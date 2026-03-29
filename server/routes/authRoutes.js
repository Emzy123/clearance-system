const express = require("express");
const { protect } = require("../middleware/auth");
const { validateBody } = require("../middleware/validation");
const { authSchemas } = require("../utils/validators");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyToken
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", validateBody(authSchemas.register), register);
router.post("/login", validateBody(authSchemas.login), login);
router.post("/forgot-password", validateBody(authSchemas.forgotPassword), forgotPassword);
router.post("/reset-password/:token", validateBody(authSchemas.resetPassword), resetPassword);
router.get("/verify-token", protect, verifyToken);

module.exports = router;

