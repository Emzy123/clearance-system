function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log errors for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error(`Error ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.user?.id || req.user?._id
    });
  }

  // Multer errors -> 400 with readable message
  if (err && (err.name === "MulterError" || String(err.message || "").includes("Unsupported file type"))) {
    return res.status(400).json({
      success: false,
      error: {
        message: "File upload error: " + (err.message || "Invalid file"),
        code: "FILE_UPLOAD_ERROR"
      }
    });
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        message: "Invalid authentication token",
        code: "INVALID_TOKEN"
      }
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: {
        message: "Authentication token expired",
        code: "TOKEN_EXPIRED"
      }
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: {
        message: `${field} already exists`,
        code: "DUPLICATE_ERROR"
      }
    });
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      error: {
        message: "Data validation failed",
        code: "MONGO_VALIDATION_ERROR",
        details: errors
      }
    });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  const payload = {
    success: false,
    error: {
      message: err.message || "Server error",
      code: err.code || "SERVER_ERROR"
    }
  };

  if (process.env.NODE_ENV !== "production") {
    payload.error.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };

