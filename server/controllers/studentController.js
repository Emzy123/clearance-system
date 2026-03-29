const bcrypt = require("bcryptjs");

const User = require("../models/User");
const ClearanceRequest = require("../models/ClearanceRequest");
const Document = require("../models/Document");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const Setting = require("../models/Setting");
const { emitToUser } = require("../utils/socket");
const { looksMalicious } = require("../middleware/upload");
const { uploadBufferToGridFS, openDownloadStream } = require("../utils/gridfs");
const { generateCertificatePdfBuffer } = require("../utils/certificateGenerator");
const {
  getDepartmentPhases,
  buildInitialPhases,
  calculateProgress,
  currentSequentialSubmission,
  addSequentialDocument,
  addParallelDocuments
} = require("../utils/clearanceFlow");

async function writeAudit(req, { action, target, targetId, details }) {
  await AuditLog.create({
    userId: req.user?._id,
    userRole: req.user?.role,
    action,
    target,
    targetId,
    details,
    ipAddress: req.ip
  });
}

async function ensurePortalEnabled(res) {
  const setting = await Setting.findOne({ key: "portal.clearance.enabled" }).lean();
  // Default is enabled when setting is absent.
  const enabled = setting?.value !== false;
  if (!enabled) {
    res.status(403);
    throw new Error("Clearance portal is currently closed by admin");
  }
}

async function getProfile(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "profilePicture"];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select(
      "-password"
    );
    await writeAudit(req, { action: "student.update_profile", target: "users", targetId: user._id });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    await writeAudit(req, { action: "student.change_password", target: "users", targetId: user._id });
    res.json({ success: true, data: { updated: true } });
  } catch (err) {
    next(err);
  }
}

async function initiateClearance(req, res, next) {
  try {
    await ensurePortalEnabled(res);

    const student = await User.findById(req.user._id);
    if (!student?.matricNumber) {
      res.status(400);
      throw new Error("Missing matric number");
    }

    const existing = await ClearanceRequest.findOne({ studentId: student._id, status: { $ne: "approved" } });
    if (existing) {
      return res.json({ success: true, data: { clearance: existing } });
    }

    const { sequential, parallel } = await getDepartmentPhases();
    if (sequential.length === 0 && parallel.length === 0) {
      res.status(400);
      throw new Error("No active departments configured");
    }
    const phaseData = buildInitialPhases(sequential, parallel);

    const clearance = await ClearanceRequest.create({
      studentId: student._id,
      matricNumber: student.matricNumber,
      status: "in_progress",
      sequentialPhase: phaseData.sequentialPhase,
      parallelPhase: phaseData.parallelPhase,
      overallProgress: 0
    });

    await Notification.create({
      userId: student._id,
      title: "Clearance initiated",
      message: "Your clearance process has started.",
      type: "clearance_initiated",
      relatedId: clearance._id,
      read: false
    });

    emitToUser(student._id.toString(), "notification:new", {
      title: "Clearance initiated",
      type: "clearance_initiated"
    });

    await writeAudit(req, {
      action: "student.clearance_initiate",
      target: "clearance_requests",
      targetId: clearance._id
    });

    res.status(201).json({ success: true, data: { clearance } });
  } catch (err) {
    next(err);
  }
}

async function getClearanceStatus(req, res, next) {
  try {
    const clearance = await ClearanceRequest.findOne({ studentId: req.user._id })
      .populate("sequentialPhase.submissions.departmentId", "name code clearanceOrder phase")
      .populate("parallelPhase.submissions.departmentId", "name code clearanceOrder phase")
      .lean();
    if (!clearance) return res.json({ success: true, data: { clearance: null } });

    const progress = {
      percent: calculateProgress(clearance),
      sequential: clearance.sequentialPhase,
      parallel: clearance.parallelPhase
    };
    res.json({ success: true, data: { clearance, progress } });
  } catch (err) {
    next(err);
  }
}

async function getNotifications(req, res, next) {
  try {
    const items = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    ).lean();
    res.json({ success: true, data: { notification: n } });
  } catch (err) {
    next(err);
  }
}

async function submitSequential(req, res, next) {
  try {
    await ensurePortalEnabled(res);

    const { departmentId } = req.params;
    if (!departmentId || departmentId === "undefined" || departmentId === "null") {
      res.status(400);
      throw new Error("Invalid department selected. Refresh and try again.");
    }
    if (!req.file?.buffer) {
      res.status(400);
      throw new Error("File is required");
    }

    if (looksMalicious(req.file.buffer)) {
      res.status(400);
      throw new Error("File failed security checks");
    }

    const clearance = await ClearanceRequest.findOne({ studentId: req.user._id });
    if (!clearance) {
      res.status(400);
      throw new Error("Clearance not initiated");
    }

    const current = currentSequentialSubmission(clearance);
    const currentDeptId = current?.departmentId?._id
      ? String(current.departmentId._id)
      : current?.departmentId?.toString?.() || "";
    if (!currentDeptId || currentDeptId !== departmentId) {
      res.status(400);
      throw new Error("You can only upload for the current clearance stage");
    }

    const gridFile = await uploadBufferToGridFS({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      metadata: {
        studentId: req.user._id.toString(),
        clearanceId: clearance._id.toString(),
        departmentId
      }
    });

    const docRecord = await Document.create({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      studentId: req.user._id,
      clearanceId: clearance._id,
      departmentId,
      phase: "sequential",
      uploadDate: new Date(),
      metadata: { fileId: gridFile._id.toString() }
    });

    addSequentialDocument(clearance, departmentId, {
      filename: req.file.originalname,
      url: `gridfs:${gridFile._id.toString()}`
    });
    clearance.overallProgress = calculateProgress(clearance);
    await clearance.save();

    await writeAudit(req, {
      action: "student.upload_document",
      target: "documents",
      targetId: docRecord._id,
      details: { departmentId, fileId: gridFile._id, phase: "sequential" }
    });

    res.status(201).json({ success: true, data: { document: docRecord, clearance } });
  } catch (err) {
    next(err);
  }
}

async function submitParallelSingle(req, res, next) {
  try {
    await ensurePortalEnabled(res);

    const { departmentId } = req.params;
    if (!departmentId || departmentId === "undefined" || departmentId === "null") {
      res.status(400);
      throw new Error("Invalid department selected. Refresh and try again.");
    }
    if (!req.file?.buffer) {
      res.status(400);
      throw new Error("File is required");
    }
    if (looksMalicious(req.file.buffer)) {
      res.status(400);
      throw new Error("File failed security checks");
    }

    const clearance = await ClearanceRequest.findOne({ studentId: req.user._id });
    if (!clearance) {
      res.status(400);
      throw new Error("Clearance not initiated");
    }

    const gridFile = await uploadBufferToGridFS({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      metadata: {
        studentId: req.user._id.toString(),
        clearanceId: clearance._id.toString(),
        departmentId
      }
    });

    const docRecord = await Document.create({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      studentId: req.user._id,
      clearanceId: clearance._id,
      departmentId,
      phase: "parallel",
      uploadDate: new Date(),
      metadata: { fileId: gridFile._id.toString() }
    });

    addParallelDocuments(clearance, [
      { departmentId, documents: [{ filename: req.file.originalname, url: `gridfs:${gridFile._id.toString()}` }] }
    ]);
    clearance.overallProgress = calculateProgress(clearance);
    await clearance.save();
    emitToUser(req.user._id.toString(), "parallel_submitted", { count: 1 });

    await writeAudit(req, {
      action: "student.submit_parallel_single",
      target: "documents",
      targetId: docRecord._id,
      details: { departmentId, phase: "parallel" }
    });

    res.status(201).json({ success: true, data: { document: docRecord, clearance } });
  } catch (err) {
    next(err);
  }
}

async function submitParallelBulk(req, res, next) {
  try {
    await ensurePortalEnabled(res);

    if (!Array.isArray(req.files) || req.files.length === 0) {
      res.status(400);
      throw new Error("At least one file is required");
    }
    const clearance = await ClearanceRequest.findOne({ studentId: req.user._id });
    if (!clearance) {
      res.status(400);
      throw new Error("Clearance not initiated");
    }

    const deptIdsRaw = req.body.departmentIds;
    const deptIds = Array.isArray(deptIdsRaw)
      ? deptIdsRaw
      : typeof deptIdsRaw === "string"
        ? deptIdsRaw.split(",").map((v) => v.trim()).filter(Boolean)
        : [];
    if (deptIds.length === 0) {
      res.status(400);
      throw new Error("departmentIds is required");
    }

    const uploaded = [];
    for (const file of req.files) {
      if (looksMalicious(file.buffer)) {
        res.status(400);
        throw new Error(`File ${file.originalname} failed security checks`);
      }
      const gridFile = await uploadBufferToGridFS({
        buffer: file.buffer,
        filename: file.originalname,
        contentType: file.mimetype,
        metadata: {
          studentId: req.user._id.toString(),
          clearanceId: clearance._id.toString(),
          departmentIds: deptIds
        }
      });

      for (const departmentId of deptIds) {
        const docRecord = await Document.create({
          filename: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          studentId: req.user._id,
          clearanceId: clearance._id,
          departmentId,
          phase: "parallel",
          uploadDate: new Date(),
          metadata: { fileId: gridFile._id.toString() }
        });
        uploaded.push(docRecord);
      }

      addParallelDocuments(
        clearance,
        deptIds.map((departmentId) => ({
          departmentId,
          documents: [{ filename: file.originalname, url: `gridfs:${gridFile._id.toString()}` }]
        }))
      );
    }

    clearance.overallProgress = calculateProgress(clearance);
    await clearance.save();
    emitToUser(req.user._id.toString(), "parallel_submitted", { count: deptIds.length });
    res.status(201).json({ success: true, data: { documents: uploaded, clearance } });
  } catch (err) {
    next(err);
  }
}

async function eligibleParallelDepartments(req, res, next) {
  try {
    const clearance = await ClearanceRequest.findOne({ studentId: req.user._id }).lean();
    if (!clearance) return res.json({ success: true, data: { items: [] } });
    const items = clearance.parallelPhase.submissions || [];
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function downloadCertificate(req, res, next) {
  try {
    const clearance = await ClearanceRequest.findOne({ studentId: req.user._id })
      .populate("sequentialPhase.submissions.departmentId", "name code")
      .populate("parallelPhase.submissions.departmentId", "name code")
      .lean();
    if (!clearance) {
      res.status(404);
      throw new Error("Clearance not found");
    }
    if (clearance.status !== "approved") {
      res.status(400);
      throw new Error("Certificate is available only after full approval");
    }

    // If already generated and stored, stream from GridFS.
    const existingFileId = clearance.finalCertificate?.url?.startsWith("gridfs:")
      ? clearance.finalCertificate.url.replace("gridfs:", "")
      : null;

    if (existingFileId) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=clearance-certificate.pdf");
      const stream = openDownloadStream(new (require("mongodb").ObjectId)(existingFileId));
      stream.on("error", (e) => next(e));
      return stream.pipe(res);
    }

    const departments = [
      ...(clearance.sequentialPhase?.submissions || []),
      ...(clearance.parallelPhase?.submissions || [])
    ]
      .filter((s) => s.status === "approved")
      .map((s) => s.departmentId?.name || s.departmentName);

    const buffer = await generateCertificatePdfBuffer({
      studentName: req.user.name,
      matricNumber: clearance.matricNumber,
      dateString: new Date().toDateString(),
      departments
    });

    const gridFile = await uploadBufferToGridFS({
      buffer,
      filename: `certificate-${clearance.matricNumber}.pdf`,
      contentType: "application/pdf",
      metadata: { type: "certificate", studentId: req.user._id.toString(), clearanceId: clearance._id.toString() }
    });

    await ClearanceRequest.updateOne(
      { _id: clearance._id },
      {
        $set: {
          "finalCertificate.generated": true,
          "finalCertificate.url": `gridfs:${gridFile._id.toString()}`,
          "finalCertificate.generatedAt": new Date()
        }
      }
    );

    await Notification.create({
      userId: req.user._id,
      title: "Certificate ready",
      message: "Your clearance certificate is ready to download.",
      type: "certificate_ready",
      relatedId: clearance._id,
      read: false
    });
    emitToUser(req.user._id.toString(), "notification:new", { type: "certificate_ready" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=clearance-certificate.pdf");
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  initiateClearance,
  getClearanceStatus,
  submitSequential,
  submitParallelBulk,
  submitParallelSingle,
  eligibleParallelDepartments,
  downloadCertificate,
  getNotifications,
  markNotificationRead
};

