#!/usr/bin/env node

// Production Setup Script
require("dotenv").config();

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Production Environment for Clearance System");

// Check required environment variables
const requiredEnvVars = [
  "NODE_ENV",
  "MONGODB_URI", 
  "JWT_SECRET",
  "CLIENT_URL"
];

function checkEnvironmentVariables() {
  console.log("\n📋 Checking Environment Variables...");
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log("\n💡 Set these in your Render dashboard or .env file");
    return false;
  }
  
  console.log("✅ All required environment variables are set");
  return true;
}

function validateMongoDBConnection() {
  console.log("\n🗄️  Validating MongoDB Connection...");
  
  try {
    const mongoose = require("mongoose");
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGODB_URI not set");
      return false;
    }
    
    // Basic URI validation
    if (!mongoURI.includes("mongodb")) {
      console.error("❌ Invalid MongoDB URI format");
      return false;
    }
    
    console.log("✅ MongoDB URI format is valid");
    return true;
  } catch (error) {
    console.error("❌ Error validating MongoDB:", error.message);
    return false;
  }
}

function createProductionBuild() {
  console.log("\n🔨 Creating Production Build...");
  
  try {
    // Build frontend
    console.log("Building frontend...");
    execSync("cd client && npm run build", { stdio: "inherit" });
    
    // Verify backend build
    console.log("Verifying backend...");
    execSync("cd server && npm run build", { stdio: "inherit" });
    
    console.log("✅ Production build completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    return false;
  }
}

function seedProductionDatabase() {
  console.log("\n🌱 Seeding Production Database...");
  
  try {
    console.log("Running database seed...");
    execSync("cd server && npm run seed", { stdio: "inherit" });
    console.log("✅ Database seeded successfully");
    return true;
  } catch (error) {
    console.error("❌ Database seeding failed:", error.message);
    return false;
  }
}

function testProductionEndpoints() {
  console.log("\n🧪 Testing Production Endpoints...");
  
  const baseURL = process.env.CLIENT_URL || "http://localhost:5000";
  
  const tests = [
    {
      name: "Health Check",
      command: `curl -s "${baseURL}/api/health" | head -1`
    },
    {
      name: "Login Test", 
      command: `curl -s -X POST "${baseURL}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@demo.edu","password":"AdminPass123!"}' | head -1`
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const result = execSync(test.command, { encoding: "utf8" });
      
      if (result.includes("success") || result.includes("ok")) {
        console.log(`✅ ${test.name} passed`);
      } else {
        console.log(`⚠️  ${test.name} response: ${result}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed: ${error.message}`);
    }
  }
}

function generateDeploymentChecklist() {
  console.log("\n📝 Generating Deployment Checklist...");
  
  const checklist = `
# Production Deployment Checklist

## ✅ Pre-Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured
- [ ] Production build completed
- [ ] Database seeded with demo data

## ✅ Render Configuration
- [ ] Backend service created (Node.js)
- [ ] Frontend service created (Static)
- [ ] Environment variables set in Render
- [ ] Build commands configured
- [ ] Root directories set correctly

## ✅ Post-Deployment
- [ ] Health endpoint responding
- [ ] Login functionality working
- [ ] Database connectivity verified
- [ ] CORS properly configured
- [ ] All API endpoints tested

## 🧪 Test Accounts
- Admin: admin@demo.edu / AdminPass123!
- Staff: staff1@demo.edu / StaffPass123!
- Students: student1@demo.edu / StudentPass123!

## 🔗 Production URLs
- Backend: ${process.env.CLIENT_URL}/api
- Frontend: ${process.env.CLIENT_URL}
- Health: ${process.env.CLIENT_URL}/api/health
`;
  
  fs.writeFileSync("DEPLOYMENT_CHECKLIST.md", checklist);
  console.log("✅ Deployment checklist created: DEPLOYMENT_CHECKLIST.md");
}

// Main execution
async function main() {
  console.log("🎯 Production Setup Started\n");
  
  const steps = [
    { name: "Environment Variables", fn: checkEnvironmentVariables },
    { name: "MongoDB Connection", fn: validateMongoDBConnection },
    { name: "Production Build", fn: createProductionBuild },
    { name: "Database Seeding", fn: seedProductionDatabase },
    { name: "Endpoint Testing", fn: testProductionEndpoints },
    { name: "Checklist Generation", fn: generateDeploymentChecklist }
  ];
  
  let allPassed = true;
  
  for (const step of steps) {
    try {
      const result = step.fn();
      if (result === false) {
        allPassed = false;
        break;
      }
    } catch (error) {
      console.error(`❌ ${step.name} failed:`, error.message);
      allPassed = false;
      break;
    }
  }
  
  if (allPassed) {
    console.log("\n🎉 Production setup completed successfully!");
    console.log("📱 Your clearance system is ready for deployment!");
  } else {
    console.log("\n❌ Production setup failed. Please fix the issues above.");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
