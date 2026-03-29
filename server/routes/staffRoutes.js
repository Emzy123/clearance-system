const express = require("express");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const { requireStaffDepartment } = require("../middleware/staffDepartment");
const { validateBody } = require("../middleware/validation");
const { staffSchemas } = require("../utils/validators");
const staffController = require("../controllers/staffController");

const router = express.Router();

const staffOnly = [protect, roleCheck("staff"), requireStaffDepartment];

router.get("/pending", ...staffOnly, staffController.getPending);
router.get("/requests", ...staffOnly, staffController.getRequests);
router.get("/requests/:clearanceId", ...staffOnly, staffController.requestDetails);
router.put(
  "/sequential/approve/:clearanceId",
  ...staffOnly,
  validateBody(staffSchemas.decision),
  staffController.approveSequential
);
router.put(
  "/sequential/reject/:clearanceId",
  ...staffOnly,
  validateBody(staffSchemas.decision),
  staffController.rejectSequential
);
router.put(
  "/parallel/approve/:clearanceId",
  ...staffOnly,
  validateBody(staffSchemas.decision),
  staffController.approveParallel
);
router.put(
  "/parallel/reject/:clearanceId",
  ...staffOnly,
  validateBody(staffSchemas.decision),
  staffController.rejectParallel
);
router.get("/statistics", ...staffOnly, staffController.statistics);

module.exports = router;

