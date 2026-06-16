const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["student", "staff", "admin"], required: true },
    matricNumber: { type: String, trim: true, index: true },
    staffId: { type: String, trim: true, index: true },
    department: { type: String, trim: true },
    profilePicture: { type: String },
    faculty: { type: String, trim: true },
    yearOfAdmission: { type: String, trim: true },
    yearOfGraduation: { type: String, trim: true },
    classOfDegree: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);

