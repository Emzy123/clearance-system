const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    userRole: { type: String, maxlength: 30 },
    action: { type: String, required: true, maxlength: 120, index: true },
    target: { type: String, maxlength: 120 },
    targetId: { type: mongoose.Schema.Types.Mixed },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String, maxlength: 80 },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

