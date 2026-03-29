const User = require("../models/User");
const ClearanceRequest = require("../models/ClearanceRequest");
const Department = require("../models/Department");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const { emitToUser } = require("../utils/socket");
const Document = require("../models/Document");
const { decideSequential, decideParallel, extractId } = require("../utils/clearanceFlow");

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

async function getStaffDepartment(req) {
  if (!req.user?.department) return null;
  const dept = await Department.findOne({ name: req.user.department, isActive: true }).lean();
  return dept || (await Department.findOne({ code: req.user.department, isActive: true }).lean());
}

async function getPending(req, res, next) {
  try {
    const dept = await getStaffDepartment(req);
    if (!dept) {
      res.status(400);
      throw new Error("Staff department not configured");
    }
    const sequentialPending = await ClearanceRequest.find({
      "sequentialPhase.submissions": { $elemMatch: { departmentId: dept._id, status: "pending" } },
      "sequentialPhase.isCompleted": false
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    const parallelPending = await ClearanceRequest.find({
      "parallelPhase.submissions": { $elemMatch: { departmentId: dept._id, status: "pending" } }
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json({ success: true, data: { sequentialPending, parallelPending } });
  } catch (err) {
    next(err);
  }
}

async function getRequests(req, res, next) {
  try {
    const dept = await getStaffDepartment(req);
    if (!dept) {
      res.status(400);
      throw new Error("Staff department not configured");
    }
    const items = await ClearanceRequest.find({
      $or: [
        { "sequentialPhase.submissions.departmentId": dept._id },
        { "parallelPhase.submissions.departmentId": dept._id }
      ]
    })
      .sort({ updatedAt: -1 })
      .limit(500)
      .lean();
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function decide(req, res, next, { phase, approved }) {
  try {
    const dept = await getStaffDepartment(req);
    if (!dept) {
      res.status(400);
      throw new Error("Staff department not configured");
    }

    const clearance = await ClearanceRequest.findById(req.params.clearanceId);
    if (!clearance) {
      res.status(404);
      throw new Error("Clearance request not found");
    }

    const docCount = await Document.countDocuments({
      clearanceId: clearance._id,
      departmentId: dept._id,
      phase
    });
    if (docCount < 1) {
      res.status(400);
      throw new Error("Cannot process: no documents uploaded for this department and phase");
    }

    const remarks = req.body.remarks || "";
    let movedToParallel = false;
    if (phase === "sequential") {
      const current = clearance.sequentialPhase?.submissions?.[clearance.sequentialPhase.currentStage];
      const curDeptId = extractId(current?.departmentId);
      if (!current || !curDeptId || curDeptId !== extractId(dept._id)) {
        res.status(400);
        throw new Error("Cannot process: this is not the current sequential stage");
      }
      const result = decideSequential(clearance, req.user._id, remarks, approved);
      movedToParallel = result.movedToParallel;
    } else {
      const ok = decideParallel(clearance, dept._id, req.user._id, remarks, approved);
      if (!ok) {
        res.status(403);
        throw new Error("This department is not mapped to the request");
      }
    }

    await clearance.save();

    const event = approved
      ? phase === "sequential"
        ? "sequential_approved"
        : "parallel_approved"
      : phase === "sequential"
        ? "sequential_rejected"
        : "parallel_rejected";
    await Notification.create({
      userId: clearance.studentId,
      title: approved ? "Department approved" : "Department rejected",
      message: `${dept.name} ${approved ? "approved" : "rejected"} your ${phase} clearance.`,
      type: event,
      relatedId: clearance._id,
      read: false
    });
    emitToUser(clearance.studentId.toString(), event, {
      departmentName: dept.name,
      allApproved: clearance.status === "approved"
    });
    if (movedToParallel) {
      emitToUser(clearance.studentId.toString(), "parallel_ready", { clearanceId: clearance._id.toString() });
      await Notification.create({
        userId: clearance.studentId,
        title: "Parallel phase is ready",
        message: "Sequential phase is complete. You can submit all parallel clearances now.",
        type: "parallel_ready",
        relatedId: clearance._id,
        read: false
      });
    }

    await writeAudit(req, {
      action: approved ? `staff.approve_${phase}` : `staff.reject_${phase}`,
      target: "clearance_requests",
      targetId: clearance._id,
      details: { departmentId: dept._id, phase, remarks }
    });

    res.json({ success: true, data: { clearance } });
  } catch (err) {
    next(err);
  }
}

async function approveSequential(req, res, next) {
  return decide(req, res, next, { phase: "sequential", approved: true });
}
async function rejectSequential(req, res, next) {
  return decide(req, res, next, { phase: "sequential", approved: false });
}
async function approveParallel(req, res, next) {
  return decide(req, res, next, { phase: "parallel", approved: true });
}
async function rejectParallel(req, res, next) {
  return decide(req, res, next, { phase: "parallel", approved: false });
}

async function statistics(req, res, next) {
  try {
    const dept = await getStaffDepartment(req);
    if (!dept) {
      res.status(400);
      throw new Error("Staff department not configured");
    }
    const [sequentialPending, parallelPending, seqProcessed, parProcessed] = await Promise.all([
      ClearanceRequest.countDocuments({
        "sequentialPhase.submissions": { $elemMatch: { departmentId: dept._id, status: "pending" } }
      }),
      ClearanceRequest.countDocuments({
        "parallelPhase.submissions": { $elemMatch: { departmentId: dept._id, status: "pending" } }
      }),
      ClearanceRequest.countDocuments({
        "sequentialPhase.submissions": { $elemMatch: { departmentId: dept._id, status: { $in: ["approved", "rejected"] } } }
      }),
      ClearanceRequest.countDocuments({
        "parallelPhase.submissions": { $elemMatch: { departmentId: dept._id, status: { $in: ["approved", "rejected"] } } }
      })
    ]);

    res.json({
      success: true,
      data: {
        department: { id: dept._id, name: dept.name, code: dept.code, phase: dept.phase?.type },
        sequentialPending,
        parallelPending,
        sequentialProcessed: seqProcessed,
        parallelProcessed: parProcessed
      }
    });
  } catch (err) {
    next(err);
  }
}

async function requestDetails(req, res, next) {
  try {
    const dept = await getStaffDepartment(req);
    if (!dept) {
      res.status(400);
      throw new Error("Staff department not configured");
    }
    const clearance = await ClearanceRequest.findById(req.params.clearanceId).lean();
    if (!clearance) {
      res.status(404);
      throw new Error("Clearance request not found");
    }
    const staffDeptId = extractId(dept._id);
    const sequentialSubmission = clearance.sequentialPhase?.submissions?.find(
      (s) => extractId(s.departmentId) === staffDeptId
    );
    const parallelSubmission = clearance.parallelPhase?.submissions?.find(
      (s) => extractId(s.departmentId) === staffDeptId
    );
    if (!sequentialSubmission && !parallelSubmission) {
      res.status(403);
      throw new Error("Not allowed for this clearance request");
    }

    const student = await User.findById(clearance.studentId).select("-password").lean();
    const documents = await Document.find({
      clearanceId: clearance._id,
      departmentId: dept._id
    })
      .sort({ uploadDate: -1 })
      .lean();

    res.json({ success: true, data: { clearance, sequentialSubmission, parallelSubmission, student, documents } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPending,
  getRequests,
  approveSequential,
  rejectSequential,
  approveParallel,
  rejectParallel,
  statistics,
  requestDetails
};

