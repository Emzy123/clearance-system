const express = require("express");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const multer = require("multer");
const { validateBody } = require("../middleware/validation");
const { adminSchemas } = require("../utils/validators");
const adminController = require("../controllers/adminController");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/users", protect, roleCheck("admin"), adminController.listUsers);
router.post(
  "/users",
  protect,
  roleCheck("admin"),
  validateBody(adminSchemas.createUser),
  adminController.createUser
);
router.put(
  "/users/:id",
  protect,
  roleCheck("admin"),
  validateBody(adminSchemas.updateUser),
  adminController.updateUser
);
router.delete("/users/:id", protect, roleCheck("admin"), adminController.deleteUser);

router.get("/departments", protect, roleCheck("admin"), adminController.listDepartments);
router.post(
  "/departments",
  protect,
  roleCheck("admin"),
  validateBody(adminSchemas.createDepartment),
  adminController.createDepartment
);
router.put(
  "/departments/:id",
  protect,
  roleCheck("admin"),
  validateBody(adminSchemas.updateDepartment),
  adminController.updateDepartment
);
router.delete("/departments/:id", protect, roleCheck("admin"), adminController.deleteDepartment);
router.post(
  "/departments/reorder",
  protect,
  roleCheck("admin"),
  validateBody(adminSchemas.reorderDepartments),
  adminController.reorderSequentialDepartments
);
router.post(
  "/departments/phase/move",
  protect,
  roleCheck("admin"),
  validateBody(adminSchemas.moveDepartmentPhase),
  adminController.moveDepartmentPhase
);

router.get("/clearance/all", protect, roleCheck("admin"), adminController.getAllClearances);
router.put("/clearance/:id/override", protect, roleCheck("admin"), adminController.overrideClearance);

router.get("/audit-logs", protect, roleCheck("admin"), adminController.getAuditLogs);
router.get(
  "/reports/cleared-students",
  protect,
  roleCheck("admin"),
  adminController.exportClearedStudents
);
router.get("/reports/sequential-progress", protect, roleCheck("admin"), adminController.reportSequentialProgress);
router.get("/reports/parallel-progress", protect, roleCheck("admin"), adminController.reportParallelProgress);

router.post(
  "/users/import",
  protect,
  roleCheck("admin"),
  upload.single("file"),
  adminController.importUsersCsv
);

router.get("/settings", protect, roleCheck("admin"), adminController.getSettings);
router.put(
  "/settings",
  protect,
  roleCheck("admin"),
  validateBody(adminSchemas.updateSettings),
  adminController.updateSettings
);

module.exports = router;

