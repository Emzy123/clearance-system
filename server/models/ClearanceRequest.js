const mongoose = require("mongoose");

const documentItemSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const sequentialSubmissionSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    departmentName: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["pending", "approved", "rejected", "skipped"], default: "pending" },
    remarks: { type: String, default: "", maxlength: 2000 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    documents: { type: [documentItemSchema], default: [] },
    resubmissionCount: { type: Number, default: 0 },
    lastResubmissionAt: { type: Date }
  },
  { _id: false }
);

const parallelSubmissionSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    departmentName: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "not_started"], default: "not_started" },
    remarks: { type: String, default: "", maxlength: 2000 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    documents: { type: [documentItemSchema], default: [] },
    submittedAt: { type: Date }
  },
  { _id: false }
);

const clearanceRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    matricNumber: { type: String, required: true, trim: true, index: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "partial_sequential", "parallel_pending", "approved", "rejected"],
      default: "pending"
    },
    sequentialPhase: {
      isCompleted: { type: Boolean, default: false },
      currentStage: { type: Number, default: 0 },
      submissions: { type: [sequentialSubmissionSchema], default: [] }
    },
    parallelPhase: {
      isActive: { type: Boolean, default: false },
      canSubmit: { type: Boolean, default: false },
      submissions: { type: [parallelSubmissionSchema], default: [] }
    },
    finalCertificate: {
      generated: { type: Boolean, default: false },
      url: { type: String, default: "" },
      generatedAt: { type: Date },
      downloadedAt: { type: Date }
    },
    overallProgress: { type: Number, min: 0, max: 100, default: 0 }
  },
  { timestamps: true }
);

clearanceRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ClearanceRequest", clearanceRequestSchema);

