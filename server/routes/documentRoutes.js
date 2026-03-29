const express = require("express");
const { protect } = require("../middleware/auth");
const { downloadDocument } = require("../controllers/documentController");

const router = express.Router();

router.get("/:id/download", protect, downloadDocument);

module.exports = router;

