const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clearanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClearanceRequest",
      required: true,
      index: true
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    phase: { type: String, enum: ["sequential", "parallel"], required: true },
    uploadDate: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: false }
);

documentSchema.index({ studentId: 1, clearanceId: 1, departmentId: 1, uploadDate: -1 });

module.exports = mongoose.model("Document", documentSchema);

