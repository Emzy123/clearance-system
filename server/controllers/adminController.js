const bcrypt = require("bcryptjs");
const { parse } = require("csv-parse/sync");
const ExcelJS = require("exceljs");

const User = require("../models/User");
const Department = require("../models/Department");
const ClearanceRequest = require("../models/ClearanceRequest");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const Setting = require("../models/Setting");
const { calculateProgress } = require("../utils/clearanceFlow");

async function writeAudit(req, { action, target, targetId, details }) {
  await AuditLog.create({
    userId: req.user?._id,
    userRole: req.user?.role,
    action,
    target,
    targetId,
    details,
    ipAddress: req.ip
  });
}

function getPaging(req) {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

async function listUsers(req, res, next) {
  try {
    const { page, pageSize, skip } = getPaging(req);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
    if (req.query.search) {
      const s = String(req.query.search);
      filter.$or = [{ name: new RegExp(s, "i") }, { email: new RegExp(s, "i") }, { matricNumber: s }, { staffId: s }];
    }

    const [items, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      User.countDocuments(filter)
    ]);

    res.json({ success: true, data: { items, page, pageSize, total } });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, staffId, department, isActive } = req.body;

    const trimmedDept = String(department).trim();
    const dept = await Department.findOne({
      isActive: true,
      $or: [{ name: trimmedDept }, { code: trimmedDept.toUpperCase() }]
    }).lean();
    if (!dept) {
      res.status(400);
      throw new Error("Invalid or inactive department");
    }

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409);
      throw new Error("Email already in use");
    }

    const plain = password || cryptoRandomPassword();
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(plain, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "staff",
      staffId,
      department: dept.name,
      isActive: isActive !== undefined ? isActive : true
    });

    await writeAudit(req, { action: "admin.create_user", target: "users", targetId: user._id });
    res.status(201).json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (err) {
    next(err);
  }
}

function sanitizeUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete u.password;
  return u;
}

function cryptoRandomPassword() {
  return `Tmp${Math.random().toString(36).slice(2, 10)}!${Math.random().toString(36).slice(2, 6)}`;
}

async function updateUser(req, res, next) {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await writeAudit(req, { action: "admin.update_user", target: "users", targetId: user._id });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    await writeAudit(req, { action: "admin.delete_user", target: "users", targetId: user._id });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}

async function listDepartments(req, res, next) {
  try {
    const items = await Department.find({}).sort({ clearanceOrder: 1 }).lean();
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function createDepartment(req, res, next) {
  try {
    const dept = await Department.create({
      name: req.body.name,
      code: req.body.code,
      description: req.body.description || "",
      phase: req.body.phase || { type: "parallel", order: null, dependsOn: [], requiredDocuments: [], instructions: "" },
      clearanceOrder: req.body.clearanceOrder,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    // Ensure newly created departments are reflected in active clearances,
    // so newly assigned staff can immediately fetch/act on pending requests.
    const active = await ClearanceRequest.find({
      status: { $nin: ["approved", "rejected"] }
    });

    for (const clearance of active) {
      const hasSequential = (clearance.sequentialPhase?.submissions || []).some(
        (s) => String(s.departmentId) === String(dept._id)
      );
      const hasParallel = (clearance.parallelPhase?.submissions || []).some(
        (s) => String(s.departmentId) === String(dept._id)
      );
      if (hasSequential || hasParallel) continue;

      if (dept.phase?.type === "sequential") {
        const seq = clearance.sequentialPhase?.submissions || [];
        const maxOrder = seq.reduce((m, s) => Math.max(m, Number(s.order || 0)), 0);
        seq.push({
          departmentId: dept._id,
          departmentName: dept.name,
          order: maxOrder + 1,
          status: "pending",
          remarks: "",
          documents: [],
          resubmissionCount: 0
        });
        clearance.sequentialPhase.submissions = seq;

        if (clearance.sequentialPhase?.isCompleted) {
          clearance.sequentialPhase.isCompleted = false;
          clearance.sequentialPhase.currentStage = Math.max(seq.length - 1, 0);
        }
      } else {
        const par = clearance.parallelPhase?.submissions || [];
        par.push({
          departmentId: dept._id,
          departmentName: dept.name,
          status: "not_started",
          remarks: "",
          documents: []
        });
        clearance.parallelPhase.submissions = par;
      }

      clearance.overallProgress = calculateProgress(clearance);
      await clearance.save();
    }

    await writeAudit(req, { action: "admin.create_department", target: "departments", targetId: dept._id });
    res.status(201).json({ success: true, data: { department: dept } });
  } catch (err) {
    next(err);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) {
      res.status(404);
      throw new Error("Department not found");
    }
    await writeAudit(req, { action: "admin.update_department", target: "departments", targetId: dept._id });
    res.json({ success: true, data: { department: dept } });
  } catch (err) {
    next(err);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) {
      res.status(404);
      throw new Error("Department not found");
    }
    await writeAudit(req, { action: "admin.delete_department", target: "departments", targetId: dept._id });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}

async function getAllClearances(req, res, next) {
  try {
    const { page, pageSize, skip } = getPaging(req);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.matricNumber) filter.matricNumber = req.query.matricNumber;
    const [items, total] = await Promise.all([
      ClearanceRequest.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).lean(),
      ClearanceRequest.countDocuments(filter)
    ]);
    res.json({ success: true, data: { items, page, pageSize, total } });
  } catch (err) {
    next(err);
  }
}

async function overrideClearance(req, res, next) {
  try {
    const { status, sequentialPhase, parallelPhase } = req.body;
    const clearance = await ClearanceRequest.findById(req.params.id);
    if (!clearance) {
      res.status(404);
      throw new Error("Clearance not found");
    }

    if (status) clearance.status = status;
    if (sequentialPhase) clearance.sequentialPhase = sequentialPhase;
    if (parallelPhase) clearance.parallelPhase = parallelPhase;

    await clearance.save();

    await Notification.create({
      userId: clearance.studentId,
      title: "Clearance updated by admin",
      message: "An administrator updated your clearance status.",
      type: "clearance_override",
      relatedId: clearance._id,
      read: false
    });

    await writeAudit(req, {
      action: "admin.override_clearance",
      target: "clearance_requests",
      targetId: clearance._id,
      details: { status }
    });

    res.json({ success: true, data: { clearance } });
  } catch (err) {
    next(err);
  }
}

async function reorderSequentialDepartments(req, res, next) {
  try {
    const ids = req.body.departmentIds || [];
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400);
      throw new Error("departmentIds array is required");
    }
    for (let idx = 0; idx < ids.length; idx += 1) {
      await Department.updateOne(
        { _id: ids[idx] },
        { $set: { "phase.type": "sequential", "phase.order": idx + 1 } }
      );
    }
    await writeAudit(req, {
      action: "admin.reorder_sequential_departments",
      target: "departments",
      details: { departmentIds: ids }
    });
    const items = await Department.find({}).sort({ clearanceOrder: 1 }).lean();
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function moveDepartmentPhase(req, res, next) {
  try {
    const { departmentId, phaseType, order } = req.body;
    const dept = await Department.findById(departmentId);
    if (!dept) {
      res.status(404);
      throw new Error("Department not found");
    }

    let nextOrder = null;
    if (phaseType === "sequential") {
      if (order != null) {
        nextOrder = Number(order);
      } else {
        const last = await Department.findOne({ "phase.type": "sequential", isActive: true })
          .sort({ "phase.order": -1 })
          .lean();
        nextOrder = Number(last?.phase?.order || 0) + 1;
      }
    }
    dept.phase = {
      ...dept.phase,
      type: phaseType,
      order: phaseType === "sequential" ? nextOrder : null
    };
    await dept.save();

    // Keep sequential ordering contiguous and deterministic.
    const seq = await Department.find({ "phase.type": "sequential", isActive: true })
      .sort({ "phase.order": 1, clearanceOrder: 1 })
      .lean();
    for (let idx = 0; idx < seq.length; idx += 1) {
      await Department.updateOne(
        { _id: seq[idx]._id },
        { $set: { "phase.order": idx + 1 } }
      );
    }

    await writeAudit(req, {
      action: "admin.move_department_phase",
      target: "departments",
      targetId: dept._id,
      details: { phaseType, order: dept.phase.order }
    });
    res.json({ success: true, data: { department: dept } });
  } catch (err) {
    next(err);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const { page, pageSize, skip } = getPaging(req);
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.userRole) filter.userRole = req.query.userRole;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.from || req.query.to) {
      filter.timestamp = {};
      if (req.query.from) filter.timestamp.$gte = new Date(req.query.from);
      if (req.query.to) filter.timestamp.$lte = new Date(req.query.to);
    }

    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(pageSize).lean(),
      AuditLog.countDocuments(filter)
    ]);
    res.json({ success: true, data: { items, page, pageSize, total } });
  } catch (err) {
    next(err);
  }
}

async function importUsersCsv(req, res, next) {
  try {
    if (!req.file?.buffer) {
      res.status(400);
      throw new Error("CSV file is required");
    }

    const csvText = req.file.buffer.toString("utf-8");
    const records = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

    let created = 0;
    for (const r of records) {
      const email = r.email?.toLowerCase();
      if (!email) continue;
      const exists = await User.findOne({ email });
      if (exists) continue;

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(r.password || cryptoRandomPassword(), salt);
      await User.create({
        name: r.name || "Imported User",
        email,
        password: hashed,
        role: r.role || "student",
        matricNumber: r.matricNumber,
        staffId: r.staffId,
        department: r.department,
        isActive: r.isActive ? String(r.isActive).toLowerCase() === "true" : true
      });
      created += 1;
    }

    await writeAudit(req, { action: "admin.import_users_csv", target: "users", details: { created } });
    res.json({ success: true, data: { created } });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const entries = Object.entries(req.body || {});
    for (const [key, value] of entries) {
      await Setting.findOneAndUpdate(
        { key },
        { key, value, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    await writeAudit(req, {
      action: "admin.update_settings",
      target: "settings",
      details: { keys: entries.map(([k]) => k) }
    });
    res.json({ success: true, data: { updated: true, keys: entries.map(([k]) => k) } });
  } catch (err) {
    next(err);
  }
}

async function getSettings(req, res, next) {
  try {
    const keys = (req.query.keys ? String(req.query.keys).split(",") : []).filter(Boolean);
    const filter = keys.length ? { key: { $in: keys } } : {};
    const items = await Setting.find(filter).lean();
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function exportClearedStudents(req, res, next) {
  try {
    const cleared = await ClearanceRequest.find({ status: "approved" })
      .sort({ updatedAt: -1 })
      .lean();

    const studentIds = [...new Set(cleared.map((c) => c.studentId.toString()))];
    const users = await User.find({ _id: { $in: studentIds } }).select("-password").lean();
    const userById = new Map(users.map((u) => [u._id.toString(), u]));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Cleared Students");

    sheet.columns = [
      { header: "Student Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Matric Number", key: "matricNumber", width: 20 },
      { header: "Cleared At", key: "clearedAt", width: 20 }
    ];

    for (const c of cleared) {
      const u = userById.get(c.studentId.toString());
      sheet.addRow({
        name: u?.name || "",
        email: u?.email || "",
        matricNumber: c.matricNumber,
        clearedAt: c.updatedAt ? new Date(c.updatedAt).toISOString().slice(0, 10) : ""
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=cleared-students.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

async function reportSequentialProgress(req, res, next) {
  try {
    const requests = await ClearanceRequest.find({}).lean();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sequential Progress");
    sheet.columns = [
      { header: "Matric Number", key: "matricNumber", width: 20 },
      { header: "Current Stage", key: "currentStage", width: 15 },
      { header: "Completed", key: "completed", width: 12 },
      { header: "Approved Count", key: "approvedCount", width: 16 }
    ];
    for (const reqItem of requests) {
      const seqSubs = reqItem.sequentialPhase?.submissions || [];
      sheet.addRow({
        matricNumber: reqItem.matricNumber,
        currentStage: reqItem.sequentialPhase?.currentStage ?? 0,
        completed: reqItem.sequentialPhase?.isCompleted ? "Yes" : "No",
        approvedCount: seqSubs.filter((s) => s.status === "approved").length
      });
    }
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=sequential-progress.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

async function reportParallelProgress(req, res, next) {
  try {
    const requests = await ClearanceRequest.find({}).lean();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Parallel Progress");
    sheet.columns = [
      { header: "Matric Number", key: "matricNumber", width: 20 },
      { header: "Can Submit", key: "canSubmit", width: 12 },
      { header: "Approved Count", key: "approvedCount", width: 16 },
      { header: "Pending Count", key: "pendingCount", width: 16 }
    ];
    for (const reqItem of requests) {
      const items = reqItem.parallelPhase?.submissions || [];
      sheet.addRow({
        matricNumber: reqItem.matricNumber,
        canSubmit: reqItem.parallelPhase?.canSubmit ? "Yes" : "No",
        approvedCount: items.filter((s) => s.status === "approved").length,
        pendingCount: items.filter((s) => s.status === "pending").length
      });
    }
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=parallel-progress.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listDepartments,
  createDepartment,
  updateDepartment,
  reorderSequentialDepartments,
  moveDepartmentPhase,
  deleteDepartment,
  getAllClearances,
  overrideClearance,
  getAuditLogs,
  importUsersCsv,
  getSettings,
  updateSettings,
  exportClearedStudents,
  reportSequentialProgress,
  reportParallelProgress
};

