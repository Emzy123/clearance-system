const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

module.exports = mongoose.model("Setting", settingSchema);

