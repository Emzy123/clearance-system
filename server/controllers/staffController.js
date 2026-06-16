const User = require("../models/User");
const ClearanceRequest = require("../models/ClearanceRequest");
const Department = require("../models/Department");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const { emitToUser } = require("../utils/socket");
const Document = require("../models/Document");
const { decideSequential, decideParallel, extractId } = require("../utils/clearanceFlow");
const { sendEmail, getTemplateHtml, renderTemplate } = require("../utils/emailService");

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

    const student = await User.findById(clearance.studentId).lean();

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

    if (student?.email) {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const loginUrl = `${clientUrl}/login`;
      const remarksText = remarks
        ? `<p style="font-size: 14px; color: #475569; line-height: 1.6;"><strong>Feedback/Remarks:</strong> "${remarks}"</p>`
        : "";

      const subject = approved
        ? `CUSTECH Clearance: ${dept.name} Approved`
        : `CUSTECH Clearance Action Required: ${dept.name} Rejected`;

      const fallbackHtml = approved
        ? `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="background-color: #5C2C16; padding: 24px; text-align: center; border-bottom: 4px solid #D4AF37;">
    <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">CUSTECH Clearance Portal</h2>
  </div>
  <div style="padding: 24px; background-color: #ffffff;">
    <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Dear <strong>{{name}}</strong>,</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      We are pleased to inform you that your clearance submission for the <strong>{{departmentName}}</strong> department has been reviewed and <strong>APPROVED</strong>.
    </p>
    {{remarksSection}}
    <div style="margin: 24px 0; text-align: center;">
      <a href="{{loginUrl}}" style="background-color: #5C2C16; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; border: 1px solid #5C2C16; display: inline-block; transition: background 0.2s;">
        Go to Clearance Dashboard
      </a>
    </div>
    <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; margin-bottom: 0;">
      Please do not reply directly to this email. If you have any questions, please contact the respective department or the academic affairs division.
    </p>
  </div>
  <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9;">
    Confluence University of Science and Technology (CUSTECH), Osara
  </div>
</div>`
        : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="background-color: #5C2C16; padding: 24px; text-align: center; border-bottom: 4px solid #D4AF37;">
    <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">CUSTECH Clearance Portal</h2>
  </div>
  <div style="padding: 24px; background-color: #ffffff;">
    <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Dear <strong>{{name}}</strong>,</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Your clearance submission for the <strong>{{departmentName}}</strong> department was reviewed and has been <strong>REJECTED</strong>.
    </p>
    {{remarksSection}}
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Please log in to your dashboard to view the feedback, correct any issues, and re-submit the required documents.
    </p>
    <div style="margin: 24px 0; text-align: center;">
      <a href="{{loginUrl}}" style="background-color: #5C2C16; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; border: 1px solid #5C2C16; display: inline-block; transition: background 0.2s;">
        Go to Clearance Dashboard
      </a>
    </div>
    <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; margin-bottom: 0;">
      Please do not reply directly to this email. If you have any questions, please contact the respective department or the academic affairs division.
    </p>
  </div>
  <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9;">
    Confluence University of Science and Technology (CUSTECH), Osara
  </div>
</div>`;

      const templateKey = approved ? "email.clearance_approved.html" : "email.clearance_rejected.html";

      getTemplateHtml(templateKey, fallbackHtml)
        .then((tpl) => {
          const html = renderTemplate(tpl, {
            name: student.name,
            departmentName: dept.name,
            remarksSection: remarksText,
            loginUrl
          });
          return sendEmail({ to: student.email, subject, html });
        })
        .catch((err) => {
          console.error("Email notification failed:", err);
        });
    }

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

