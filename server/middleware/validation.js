const { z } = require("zod");

function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      return next();
    } catch (err) {
      res.status(400);
      const issues = err instanceof z.ZodError ? err.issues : undefined;
      return next(
        Object.assign(new Error("Validation error"), {
          code: "VALIDATION_ERROR",
          issues
        })
      );
    }
  };
}

module.exports = { validateBody };

