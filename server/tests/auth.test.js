const test = require("node:test");
const assert = require("node:assert/strict");

// Mock dependencies for testing
const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test User",
  email: "test@example.com",
  password: "hashedpassword123",
  role: "student",
  matricNumber: "TEST001"
};

test("should validate user registration data", () => {
  const { authSchemas } = require("../utils/validators");
  
  const validData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    matricNumber: "JD001"
  };
  
  const result = authSchemas.register.safeParse(validData);
  assert.equal(result.success, true);
});

test("should reject invalid email in registration", () => {
  const { authSchemas } = require("../utils/validators");
  
  const invalidData = {
    name: "John Doe",
    email: "invalid-email",
    password: "password123",
    matricNumber: "JD001"
  };
  
  const result = authSchemas.register.safeParse(invalidData);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.path.includes("email")));
});

test("should reject weak password", () => {
  const { authSchemas } = require("../utils/validators");
  
  const invalidData = {
    name: "John Doe",
    email: "john@example.com",
    password: "123",
    matricNumber: "JD001"
  };
  
  const result = authSchemas.register.safeParse(invalidData);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.path.includes("password")));
});

test("should validate login data", () => {
  const { authSchemas } = require("../utils/validators");
  
  const validData = {
    email: "john@example.com",
    password: "password123"
  };
  
  const result = authSchemas.login.safeParse(validData);
  assert.equal(result.success, true);
});

test("should validate forgot password data", () => {
  const { authSchemas } = require("../utils/validators");
  
  const validData = {
    email: "john@example.com"
  };
  
  const result = authSchemas.forgotPassword.safeParse(validData);
  assert.equal(result.success, true);
});
