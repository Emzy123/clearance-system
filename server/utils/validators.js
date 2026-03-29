const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long");

const authSchemas = {
  register: z
    .object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      password: passwordSchema,
      matricNumber: z.string().min(3).max(50)
    })
    .strict(),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  forgotPassword: z.object({
    email: z.string().email()
  }),
  resetPassword: z.object({
    password: passwordSchema
  })
};

const studentSchemas = {
  updateProfile: z.object({
    name: z.string().min(2).max(120).optional(),
    department: z.string().min(2).max(120).optional(),
    profilePicture: z.string().url().optional()
  }),
  initiateClearance: z.object({}).strict(),
  markNotificationRead: z.object({}).strict(),
  parallelBulkSubmit: z
    .object({
      departmentIds: z.union([z.array(z.string().min(1)), z.string().min(1)])
    })
    .passthrough()
};

const staffSchemas = {
  decision: z.object({
    remarks: z.string().max(2000).optional()
  })
};

const adminSchemas = {
  /** Admin may only create staff accounts; department must be assigned. */
  createUser: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password: passwordSchema.optional(),
    staffId: z.string().min(2).max(50),
    department: z.string().min(2).max(120),
    isActive: z.boolean().optional()
  }),
  updateUser: z
    .object({
      name: z.string().min(2).max(120).optional(),
      email: z.string().email().optional(),
      password: passwordSchema.optional(),
      role: z.enum(["student", "staff", "admin"]).optional(),
      matricNumber: z.string().min(3).max(50).optional(),
      staffId: z.string().min(2).max(50).optional(),
      department: z.string().min(2).max(120).optional(),
      isActive: z.boolean().optional()
    })
    .strict(),
  createDepartment: z.object({
    name: z.string().min(2).max(120),
    code: z.string().min(2).max(20),
    description: z.string().max(1000).optional(),
    clearanceOrder: z.coerce.number().int().min(1),
    phase: z
      .object({
        type: z.enum(["sequential", "parallel"]),
        order: z.coerce.number().int().min(1).nullable().optional(),
        dependsOn: z.array(z.string()).optional(),
        requiredDocuments: z.array(z.string()).optional(),
        instructions: z.string().max(2000).optional()
      })
      .optional(),
    isActive: z.boolean().optional()
  }),
  updateDepartment: z
    .object({
      name: z.string().min(2).max(120).optional(),
      code: z.string().min(2).max(20).optional(),
      description: z.string().max(1000).optional(),
      clearanceOrder: z.coerce.number().int().min(1).optional(),
      phase: z
        .object({
          type: z.enum(["sequential", "parallel"]),
          order: z.coerce.number().int().min(1).nullable().optional(),
          dependsOn: z.array(z.string()).optional(),
          requiredDocuments: z.array(z.string()).optional(),
          instructions: z.string().max(2000).optional()
        })
        .optional(),
      isActive: z.boolean().optional()
    })
    .strict(),
  reorderDepartments: z.object({
    departmentIds: z.array(z.string()).min(1)
  }),
  moveDepartmentPhase: z.object({
    departmentId: z.string().min(1),
    phaseType: z.enum(["sequential", "parallel"]),
    order: z.coerce.number().int().min(1).optional()
  }),
  updateSettings: z.record(z.string(), z.any())
};

module.exports = { authSchemas, studentSchemas, staffSchemas, adminSchemas };

