const test = require("node:test");
const assert = require("node:assert/strict");

test("should validate clearance initiation", () => {
  const { studentSchemas } = require("../utils/validators");
  
  const result = studentSchemas.initiateClearance.safeParse({});
  assert.equal(result.success, true);
});

test("should validate file upload data", () => {
  const { studentSchemas } = require("../utils/validators");
  
  const mockFile = {
    fieldname: "file",
    originalname: "document.pdf",
    encoding: "7bit",
    mimetype: "application/pdf",
    size: 1024000,
    buffer: Buffer.from("mock file content")
  };
  
  const validData = {
    departmentId: "507f1f77bcf86cd799439011",
    file: mockFile
  };
  
  const result = studentSchemas.fileUpload.safeParse(validData);
  assert.equal(result.success, true);
});

test("should reject oversized file", () => {
  const { studentSchemas } = require("../utils/validators");
  
  const mockFile = {
    fieldname: "file",
    originalname: "large.pdf",
    encoding: "7bit",
    mimetype: "application/pdf",
    size: 15 * 1024 * 1024, // 15MB - exceeds 10MB limit
    buffer: Buffer.from("mock large file content")
  };
  
  const invalidData = {
    departmentId: "507f1f77bcf86cd799439011",
    file: mockFile
  };
  
  const result = studentSchemas.fileUpload.safeParse(invalidData);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.message.includes("File size")));
});

test("should reject unsupported file type", () => {
  const { studentSchemas } = require("../utils/validators");
  
  const mockFile = {
    fieldname: "file",
    originalname: "video.mp4",
    encoding: "7bit",
    mimetype: "video/mp4",
    size: 1024000,
    buffer: Buffer.from("mock video content")
  };
  
  const invalidData = {
    departmentId: "507f1f77bcf86cd799439011",
    file: mockFile
  };
  
  const result = studentSchemas.fileUpload.safeParse(invalidData);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.message.includes("Only PDF, JPG, PNG")));
});

test("should validate staff decision data", () => {
  const { staffSchemas } = require("../utils/validators");
  
  const validData = {
    remarks: "Student has completed all requirements"
  };
  
  const result = staffSchemas.decision.safeParse(validData);
  assert.equal(result.success, true);
});

test("should validate staff decision without remarks", () => {
  const { staffSchemas } = require("../utils/validators");
  
  const validData = {};
  
  const result = staffSchemas.decision.safeParse(validData);
  assert.equal(result.success, true);
});

test("should reject remarks that are too long", () => {
  const { staffSchemas } = require("../utils/validators");
  
  const invalidData = {
    remarks: "a".repeat(2001) // Exceeds 2000 character limit
  };
  
  const result = staffSchemas.decision.safeParse(invalidData);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.path.includes("remarks")));
});
