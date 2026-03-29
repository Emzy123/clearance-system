function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Multer errors -> 400 with readable message
  if (err && (err.name === "MulterError" || String(err.message || "").includes("Unsupported file type"))) {
    res.status(400);
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

