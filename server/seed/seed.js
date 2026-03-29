require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { connectDatabase } = require("../config/database");
const User = require("../models/User");
const Department = require("../models/Department");
const ClearanceRequest = require("../models/ClearanceRequest");
const Notification = require("../models/Notification");
const Document = require("../models/Document");

async function seed() {
  await connectDatabase(process.env.MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    ClearanceRequest.deleteMany({}),
    Notification.deleteMany({}),
    Document.deleteMany({})
  ]);

  const departments = await Department.insertMany([
    { name: "Academic Department", code: "ACD", description: "Academic department clearance", clearanceOrder: 1, phase: { type: "sequential", order: 1 }, isActive: true },
    { name: "Library", code: "LIB", description: "Library clearance", clearanceOrder: 2, phase: { type: "sequential", order: 2 }, isActive: true },
    { name: "Bursary", code: "BUR", description: "Fees clearance", clearanceOrder: 3, phase: { type: "sequential", order: 3 }, isActive: true },
    { name: "Hostels", code: "HOS", description: "Hostel clearance", clearanceOrder: 4, phase: { type: "parallel", order: null }, isActive: true },
    { name: "Student Affairs", code: "SAF", description: "Student affairs", clearanceOrder: 5, phase: { type: "parallel", order: null }, isActive: true },
    { name: "ICT", code: "ICT", description: "ICT clearance", clearanceOrder: 6, phase: { type: "parallel", order: null }, isActive: true },
    { name: "Sports", code: "SPT", description: "Sports clearance", clearanceOrder: 7, phase: { type: "parallel", order: null }, isActive: true },
    { name: "Health Center", code: "HLT", description: "Health center clearance", clearanceOrder: 8, phase: { type: "parallel", order: null }, isActive: true }
  ]);

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash("AdminPass123!", salt);
  const staffPass = await bcrypt.hash("StaffPass123!", salt);
  const studentPass = await bcrypt.hash("StudentPass123!", salt);

  const admin = await User.create({
    name: "System Admin",
    email: "admin@demo.edu",
    password: adminPass,
    role: "admin",
    isActive: true
  });

  const staffDepts = ["Academic Department", "Library", "Bursary", "Hostels", "ICT"];
  const staffUsers = [];
  for (let i = 0; i < staffDepts.length; i += 1) {
    const user = await User.create({
      name: `${staffDepts[i]} Staff`,
      email: `staff${i + 1}@demo.edu`,
      password: staffPass,
      role: "staff",
      staffId: `STF-000${i + 1}`,
      department: staffDepts[i],
      isActive: true
    });
    staffUsers.push(user);
  }

  const students = [];
  for (let i = 1; i <= 10; i += 1) {
    const student = await User.create({
      name: `Student ${i}`,
      email: `student${i}@demo.edu`,
      password: studentPass,
      role: "student",
      matricNumber: `MAT/2026/${String(i).padStart(3, "0")}`,
      isActive: true
    });
    students.push(student);
  }

  const sequential = departments.filter((d) => d.phase.type === "sequential").sort((a, b) => a.phase.order - b.phase.order);
  const parallel = departments.filter((d) => d.phase.type === "parallel");

  for (let i = 0; i < students.length; i += 1) {
    const seqSubmissions = sequential.map((d, idx) => ({
      departmentId: d._id,
      departmentName: d.name,
      order: idx + 1,
      status: i > idx ? "approved" : "pending",
      documents: [],
      remarks: ""
    }));
    const seqCompleted = i >= 3;
    const parSubmissions = parallel.map((d, idx) => ({
      departmentId: d._id,
      departmentName: d.name,
      status: seqCompleted ? (i > 6 + idx ? "approved" : "pending") : "not_started",
      documents: []
    }));
    await ClearanceRequest.create({
      studentId: students[i]._id,
      matricNumber: students[i].matricNumber,
      status: seqCompleted ? "parallel_pending" : "in_progress",
      sequentialPhase: {
        isCompleted: seqCompleted,
        currentStage: seqCompleted ? 2 : Math.min(i, 2),
        submissions: seqSubmissions
      },
      parallelPhase: {
        isActive: seqCompleted,
        canSubmit: seqCompleted,
        submissions: parSubmissions
      },
      overallProgress: 0
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete:");
  // eslint-disable-next-line no-console
  console.log("Admin:", admin.email, "AdminPass123!");
  // eslint-disable-next-line no-console
  console.log("Staff accounts: staff1@demo.edu to staff5@demo.edu / StaffPass123!");
  // eslint-disable-next-line no-console
  console.log("Student accounts: student1@demo.edu to student10@demo.edu / StudentPass123!");
}

seed()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });

