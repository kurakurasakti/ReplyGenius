const errorHandler = (err, req, res, next) => {
  console.error("🚨 Error occurred:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Supabase errors
  if (err.code === "PGRST116") {
    statusCode = 404;
    message = "Resource not found";
  }

  // OpenAI API errors
  if (err.status && err.message && err.type === "openai_error") {
    statusCode = err.status;
    message = `OpenAI API Error: ${err.message}`;
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file field";
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      originalError: err,
    }),
  });
};

module.exports = errorHandler;
