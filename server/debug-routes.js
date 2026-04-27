// Debug script to verify route registration
const express = require("express");

// Import all routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const documentRoutes = require("./routes/documentRoutes");

function debugRoutes() {
  console.log("=== Route Registration Debug ===");
  console.log("Environment:", process.env.NODE_ENV || "development");
  console.log("Port:", process.env.PORT || 5000);
  
  const app = express();
  
  // Mock the route mounting
  app.use("/api/auth", authRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/analytics", analyticsRoutes);
  app.use("/api/documents", documentRoutes);
  
  // Print all registered routes
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`Route: ${middleware.route.path} [${Object.keys(middleware.route.methods).join(", ")}]`);
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(", ").toUpperCase();
          console.log(`Route: ${handler.route.path} [${methods}]`);
        }
      });
    }
  });
  
  console.log("=== Available Auth Routes ===");
  const router = express.Router();
  router.use("/api/auth", authRoutes);
  
  router.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(", ").toUpperCase();
      console.log(`Auth Route: ${layer.route.path} [${methods}]`);
    }
  });
}

if (require.main === module) {
  debugRoutes();
}

module.exports = { debugRoutes };
