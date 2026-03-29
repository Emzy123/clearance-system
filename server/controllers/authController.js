const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const Setting = require("../models/Setting");
const Notification = require("../models/Notification");
const { sendEmail, getTemplateHtml, renderTemplate } = require("../utils/emailService");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d"
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password, matricNumber } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409);
      throw new Error("Email already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "student",
      matricNumber
    });

    await Notification.create({
      userId: user._id,
      title: "Welcome",
      message: "Your account has been created successfully.",
      type: "welcome",
      read: false
    });

    // Optional email template stored in settings, else default.
    const html = renderTemplate(
      await getTemplateHtml(
        "email.welcome.html",
        `<div style="font-family:Inter,Arial,sans-serif"><h2>Welcome, {{name}}</h2><p>Your account is ready.</p></div>`
      ),
      { name }
    );
    await sendEmail({
      to: email,
      subject: "Welcome to Clearance System",
      html
    }).catch(() => {});

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          matricNumber: user.matricNumber,
          staffId: user.staffId,
          department: user.department
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true }).select("+password");
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          matricNumber: user.matricNumber,
          staffId: user.staffId,
          department: user.department
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isActive: true });

    // Always respond success to avoid email enumeration.
    if (!user) return res.json({ success: true, data: { sent: true } });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000;

    await Setting.findOneAndUpdate(
      { key: `passwordReset.${user._id.toString()}` },
      { value: { tokenHash, expiresAt }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password reset",
      html: renderTemplate(
        await getTemplateHtml(
          "email.password_reset.html",
          `<div style="font-family:Inter,Arial,sans-serif"><p>Reset your password:</p><p><a href="{{resetUrl}}">{{resetUrl}}</a></p></div>`
        ),
        { resetUrl }
      )
    });

    return res.json({ success: true, data: { sent: true } });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find matching reset record by scanning settings (small project); can be optimized later.
    const candidate = await Setting.findOne({ "value.tokenHash": tokenHash }).lean();
    if (!candidate) {
      res.status(400);
      throw new Error("Invalid or expired token");
    }

    const userId = candidate.key.replace("passwordReset.", "");
    if (!candidate.value?.expiresAt || Date.now() > Number(candidate.value.expiresAt)) {
      res.status(400);
      throw new Error("Invalid or expired token");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await User.findByIdAndUpdate(userId, { password: hashed });

    await Setting.deleteOne({ _id: candidate._id });

    await Notification.create({
      userId,
      title: "Password updated",
      message: "Your password was updated successfully.",
      type: "security",
      read: false
    });

    res.json({ success: true, data: { reset: true } });
  } catch (err) {
    next(err);
  }
}

async function verifyToken(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

module.exports = { register, login, forgotPassword, resetPassword, verifyToken };

