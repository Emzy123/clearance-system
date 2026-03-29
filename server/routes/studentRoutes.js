const express = require("express");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const { validateBody } = require("../middleware/validation");
const { studentSchemas } = require("../utils/validators");
const studentController = require("../controllers/studentController");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/profile", protect, roleCheck("student"), studentController.getProfile);
router.put(
  "/profile",
  protect,
  roleCheck("student"),
  validateBody(studentSchemas.updateProfile),
  studentController.updateProfile
);

router.post(
  "/clearance/initiate",
  protect,
  roleCheck("student"),
  validateBody(studentSchemas.initiateClearance),
  studentController.initiateClearance
);

router.get("/clearance/status", protect, roleCheck("student"), studentController.getClearanceStatus);

router.post(
  "/clearance/sequential/submit/:departmentId",
  protect,
  roleCheck("student"),
  upload.single("file"),
  studentController.submitSequential
);
router.post(
  "/clearance/parallel/submit",
  protect,
  roleCheck("student"),
  upload.array("files", 10),
  studentController.submitParallelBulk
);
router.post(
  "/clearance/parallel/submit/single/:departmentId",
  protect,
  roleCheck("student"),
  upload.single("file"),
  studentController.submitParallelSingle
);
router.get(
  "/clearance/parallel/eligible-departments",
  protect,
  roleCheck("student"),
  studentController.eligibleParallelDepartments
);
router.get(
  "/clearance/certificate",
  protect,
  roleCheck("student"),
  studentController.downloadCertificate
);

router.get("/notifications", protect, roleCheck("student"), studentController.getNotifications);
router.put(
  "/notifications/:id/read",
  protect,
  roleCheck("student"),
  validateBody(studentSchemas.markNotificationRead),
  studentController.markNotificationRead
);

module.exports = router;

