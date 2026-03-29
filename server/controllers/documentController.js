const { ObjectId } = require("mongodb");

const Document = require("../models/Document");
const ClearanceRequest = require("../models/ClearanceRequest");
const Department = require("../models/Department");
const { openDownloadStream } = require("../utils/gridfs");

async function downloadDocument(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id).lean();
    if (!doc) {
      res.status(404);
      throw new Error("Document not found");
    }

    // Authorization rules:
    // - student: only their own document
    // - staff: only documents belonging to their department and existing clearance
    // - admin: any
    if (req.user.role === "student") {
      if (doc.studentId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Forbidden");
      }
    } else if (req.user.role === "staff") {
      const staffDept =
        (await Department.findOne({ name: req.user.department, isActive: true }).lean()) ||
        (await Department.findOne({ code: req.user.department, isActive: true }).lean());
      if (!staffDept || doc.departmentId.toString() !== staffDept._id.toString()) {
        res.status(403);
        throw new Error("Forbidden");
      }
      const clearance = await ClearanceRequest.findById(doc.clearanceId).lean();
      if (!clearance) {
        res.status(400);
        throw new Error("Invalid clearance");
      }
    }

    const fileIdRaw = doc.metadata?.fileId;
    if (!fileIdRaw) {
      res.status(500);
      throw new Error("Document file missing");
    }

    res.setHeader("Content-Type", doc.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${doc.filename}"`);

    const stream = openDownloadStream(new ObjectId(fileIdRaw));
    stream.on("error", (e) => next(e));
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = { downloadDocument };

