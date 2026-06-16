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

  // 5 sequential clearance departments — Department/Faculty → Library → Bursary → Registrar → ICT
  const departments = await Department.insertMany([
    { name: "Department/Faculty", code: "DFT", description: "Academic department/faculty clearance", clearanceOrder: 1, phase: { type: "sequential", order: 1 }, isActive: true },
    { name: "Library", code: "LIB", description: "Library clearance", clearanceOrder: 2, phase: { type: "sequential", order: 2 }, isActive: true },
    { name: "Bursary", code: "BUR", description: "Fees and financial clearance", clearanceOrder: 3, phase: { type: "sequential", order: 3 }, isActive: true },
    { name: "Registrar", code: "REG", description: "Registrar clearance", clearanceOrder: 4, phase: { type: "sequential", order: 4 }, isActive: true },
    { name: "ICT", code: "ICT", description: "ICT clearance / transcript generation", clearanceOrder: 5, phase: { type: "sequential", order: 5 }, isActive: true }
  ]);

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash("AdminPass123!", salt);
  const staffPass = await bcrypt.hash("StaffPass123!", salt);
  const studentPass = await bcrypt.hash("StudentPass123!", salt);

  const admin = await User.create({
    name: "System Admin",
    email: "admin@custech.edu.ng",
    password: adminPass,
    role: "admin",
    isActive: true
  });

  // Create one staff per department
  const staffDepts = departments.map((d) => d.name);
  const staffUsers = [];
  for (let i = 0; i < staffDepts.length; i += 1) {
    const user = await User.create({
      name: `${staffDepts[i]} Staff`,
      email: `staff${i + 1}@custech.edu.ng`,
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
      email: `student${i}@custech.edu.ng`,
      password: studentPass,
      role: "student",
      matricNumber: `CUSTECH/2024/${String(i).padStart(3, "0")}`,
      department: "Computer Science",
      faculty: "Faculty of Science and Technology",
      yearOfAdmission: "2024",
      yearOfGraduation: "2028",
      classOfDegree: "B.Sc.",
      isActive: true
    });
    students.push(student);
  }

  const sequential = departments.sort((a, b) => a.phase.order - b.phase.order);

  for (let i = 0; i < students.length; i += 1) {
    const seqSubmissions = sequential.map((d, idx) => ({
      departmentId: d._id,
      departmentName: d.name,
      order: idx + 1,
      // First i students have first i stages approved
      status: i > idx ? "approved" : "not_started",
      documents: [],
      remarks: ""
    }));
    const approvedCount = seqSubmissions.filter((s) => s.status === "approved").length;
    const isCompleted = approvedCount === sequential.length;
    const overallProgress = sequential.length
      ? Math.round((approvedCount / sequential.length) * 100)
      : 0;

    await ClearanceRequest.create({
      studentId: students[i]._id,
      matricNumber: students[i].matricNumber,
      status: isCompleted ? "approved" : approvedCount > 0 ? "partial_sequential" : "in_progress",
      sequentialPhase: {
        isCompleted,
        currentStage: isCompleted ? sequential.length - 1 : Math.min(i, sequential.length - 1),
        submissions: seqSubmissions
      },
      parallelPhase: {
        isActive: false,
        canSubmit: false,
        submissions: []
      },
      overallProgress
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete:");
  // eslint-disable-next-line no-console
  console.log("Admin:", admin.email, "AdminPass123!");
  // eslint-disable-next-line no-console
  console.log("Staff accounts: staff1@custech.edu.ng to staff5@custech.edu.ng / StaffPass123!");
  // eslint-disable-next-line no-console
  console.log("Student accounts: student1@custech.edu.ng to student10@custech.edu.ng / StudentPass123!");
}

seed()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
