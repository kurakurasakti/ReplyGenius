require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const integrationRoutes = require("./routes/integrations");
const trainRoutes = require("./routes/train");
const generateRoutes = require("./routes/generate");
const oauthRoutes = require("./routes/oauth"); // <-- Import the new route

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use(rateLimiter);

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadsDir = process.env.UPLOAD_PATH || "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("🏥 Health check requested");
  res.status(200).json({
    status: "OK",
    message: "ReplyGenius Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/train", trainRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/oauth", oauthRoutes); // <-- Use the new route

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    message: `${req.method} ${req.originalUrl} does not exist on this server`,
    availableRoutes: [
      "GET /health",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "POST /api/integrations",
      "GET /api/integrations",
      "POST /api/train",
      "POST /api/generate",
    ],
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("🚀 ReplyGenius Backend Server Started");
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);

  // Log available routes
  console.log("\n📋 Available API Routes:");
  console.log("   🔐 Authentication: /api/auth");
  console.log("   🔗 Integrations: /api/integrations");
  console.log("   📚 Training: /api/train");
  console.log("   🤖 Generate: /api/generate");
  console.log("\n💡 Use Ctrl+C to stop the server\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("💤 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n💤 SIGINT received, shutting down gracefully");
  process.exit(0);
});
