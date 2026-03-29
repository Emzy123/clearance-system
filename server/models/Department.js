const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 20 },
    description: { type: String, default: "", maxlength: 1000 },
    phase: {
      type: {
        type: String,
        enum: ["sequential", "parallel"],
        required: true,
        default: "parallel",
        index: true
      },
      order: { type: Number, default: null },
      dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
      requiredDocuments: [{ type: String, trim: true }],
      instructions: { type: String, default: "", maxlength: 2000 }
    },
    clearanceOrder: { type: Number, required: true, min: 1, index: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: false }
);

departmentSchema.index({ clearanceOrder: 1, isActive: 1 });
departmentSchema.index({ "phase.type": 1, "phase.order": 1, isActive: 1 });

module.exports = mongoose.model("Department", departmentSchema);

