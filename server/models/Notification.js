const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 2000 },
    type: {
      type: String,
      required: true,
      enum: [
        "clearance_initiated",
        "sequential_approved",
        "sequential_rejected",
        "next_sequential_ready",
        "parallel_ready",
        "parallel_submitted",
        "parallel_approved",
        "parallel_rejected",
        "certificate_ready",
        "clearance_override",
        "welcome",
        "security",
        "system"
      ]
    },
    read: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

