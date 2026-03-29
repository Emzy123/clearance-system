const express = require("express");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const { getAnalytics } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/", protect, roleCheck("admin"), getAnalytics);

module.exports = router;

