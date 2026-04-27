const test = require("node:test");
const assert = require("node:assert/strict");

test("should validate department creation", () => {
  const { adminSchemas } = require("../utils/validators");
  
  const validData = {
    name: "Computer Science",
    code: "CS",
    description: "Computer Science department",
    clearanceOrder: 1,
    phase: {
      type: "sequential",
      order: 1
    },
    isActive: true
  };
  
  const result = adminSchemas.createDepartment.safeParse(validData);
  assert.equal(result.success, true);
});

test("should validate parallel department creation", () => {
  const { adminSchemas } = require("../utils/validators");
  
  const validData = {
    name: "Library",
    code: "LIB",
    description: "Library services",
    clearanceOrder: 2,
    phase: {
      type: "parallel"
    }
  };
  
  const result = adminSchemas.createDepartment.safeParse(validData);
  assert.equal(result.success, true);
});

test("should reject invalid department code", () => {
  const { adminSchemas } = require("../utils/validators");
  
  const invalidData = {
    name: "Computer Science",
    code: "", // Empty code
    description: "Computer Science department",
    clearanceOrder: 1
  };
  
  const result = adminSchemas.createDepartment.safeParse(invalidData);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.path.includes("code")));
});

test("should validate user creation", () => {
  const { adminSchemas } = require("../utils/validators");
  
  const validData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    staffId: "STAFF001",
    department: "Computer Science",
    isActive: true
  };
  
  const result = adminSchemas.createUser.safeParse(validData);
  assert.equal(result.success, true);
});

test("should validate user update", () => {
  const { adminSchemas } = require("../utils/validators");
  
  const validData = {
    name: "John Smith",
    department: "Mathematics"
  };
  
  const result = adminSchemas.updateUser.safeParse(validData);
  assert.equal(result.success, true);
});

test("should validate department reordering", () => {
  const { adminSchemas } = require("../utils/validators");
  
  const validData = {
    departmentIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
  };
  
  const result = adminSchemas.reorderDepartments.safeParse(validData);
  assert.equal(result.success, true);
});

test("should validate department phase movement", () => {
  const { adminSchemas } = require("../utils/validators");
  
  const validData = {
    departmentId: "507f1f77bcf86cd799439011",
    phaseType: "parallel",
    order: 2
  };
  
  const result = adminSchemas.moveDepartmentPhase.safeParse(validData);
  assert.equal(result.success, true);
});

test("should reject invalid phase type", () => {
  const { adminSchemas } = require("../utils/validators");
  
  const invalidData = {
    departmentId: "507f1f77bcf86cd799439011",
    phaseType: "invalid"
  };
  
  const result = adminSchemas.moveDepartmentPhase.safeParse(invalidData);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.path.includes("phaseType")));
});
