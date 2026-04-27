#!/usr/bin/env node

// Render Deployment Automation Script
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Render Deployment Automation for Clearance System");

const renderConfig = {
  backend: {
    name: "clearance-system-api",
    runtime: "node",
    plan: "free",
    rootDir: "server",
    buildCommand: "npm install",
    startCommand: "npm start",
    envVars: {
      "NODE_ENV": "production",
      "PORT": "5000",
      "MONGODB_URI": "mongodb+srv://clearance-admin:YOUR_PASSWORD@clearance-system-cluster.mongodb.net/clearance-system?retryWrites=true&w=majority",
      "JWT_SECRET": "your-super-secret-jwt-key-min-32-chars",
      "JWT_EXPIRE": "7d",
      "CLIENT_URL": "https://clearance-system-frontend.onrender.com"
    }
  },
  frontend: {
    name: "clearance-system-frontend", 
    runtime: "static",
    plan: "free",
    rootDir: "client/dist",
    buildCommand: "cd client && npm install && npm run build",
    envVars: {
      "VITE_API_URL": "https://clearance-system-api.onrender.com/api",
      "VITE_SOCKET_URL": "https://clearance-system-api.onrender.com"
    }
  }
};

function createRenderManifest() {
  console.log("📝 Creating Render Manifest...");
  
  const manifest = {
    services: [
      {
        type: "web",
        name: renderConfig.backend.name,
        runtime: renderConfig.backend.runtime,
        plan: renderConfig.backend.plan,
        rootDir: renderConfig.backend.rootDir,
        buildCommand: renderConfig.backend.buildCommand,
        startCommand: renderConfig.backend.startCommand,
        envVars: Object.entries(renderConfig.backend.envVars).map(([key, value]) => ({
          key,
          value: key === "JWT_SECRET" ? { generateValue: true, length: 64 } : value,
          sync: key === "MONGODB_URI" ? false : true
        }))
      },
      {
        type: "web",
        name: renderConfig.frontend.name,
        runtime: renderConfig.frontend.runtime,
        plan: renderConfig.frontend.plan,
        rootDir: renderConfig.frontend.rootDir,
        buildCommand: renderConfig.frontend.buildCommand,
        envVars: Object.entries(renderConfig.frontend.envVars).map(([key, value]) => ({
          key,
          value,
          sync: true
        }))
      }
    ]
  };
  
  fs.writeFileSync("render-manifest.json", JSON.stringify(manifest, null, 2));
  console.log("✅ Render manifest created: render-manifest.json");
}

function createEnvironmentTemplates() {
  console.log("🔧 Creating Environment Variable Templates...");
  
  const backendEnv = `# Backend Environment Variables for Render
NODE_ENV=production
PORT=5000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://clearance-admin:YOUR_PASSWORD@clearance-system-cluster.mongodb.net/clearance-system?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=https://clearance-system-frontend.onrender.com

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password`;

  const frontendEnv = `# Frontend Environment Variables for Render
VITE_API_URL=https://clearance-system-api.onrender.com/api
VITE_SOCKET_URL=https://clearance-system-api.onrender.com`;

  fs.writeFileSync("backend.env.template", backendEnv);
  fs.writeFileSync("frontend.env.template", frontendEnv);
  
  console.log("✅ Environment templates created");
  console.log("   - backend.env.template");
  console.log("   - frontend.env.template");
}

function createDeploymentScript() {
  console.log("📜 Creating Deployment Script...");
  
  const script = `#!/bin/bash

# Render Deployment Script for Clearance System

echo "🚀 Starting Render Deployment..."

# Step 1: Build Frontend
echo "🔨 Building frontend..."
cd client
npm install
npm run build
cd ..

# Step 2: Verify Backend
echo "🔍 Verifying backend..."
cd server
npm install
npm run build
cd ..

# Step 3: Create deployment package
echo "📦 Creating deployment package..."
tar -czf clearance-system-deploy.tar.gz \
  server/ \
  client/dist/ \
  render.yaml \
  render-manifest.json \
  DEPLOYMENT_GUIDE.md \
  TROUBLESHOOTING_GUIDE.md

echo "✅ Deployment package created: clearance-system-deploy.tar.gz"
echo "📱 Upload this to Render or connect your GitHub repository"

# Step 4: Show next steps
echo ""
echo "📋 Next Steps:"
echo "1. Connect your GitHub repository to Render"
echo "2. Use render.yaml for automatic configuration"
echo "3. Set environment variables in Render dashboard"
echo "4. Deploy both backend and frontend services"
echo "5. Seed the production database"
echo "6. Test the deployed application"
echo ""
echo "🔗 Useful Commands:"
echo "curl https://your-backend.onrender.com/api/health"
echo "curl -X POST https://your-backend.onrender.com/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@demo.edu\",\"password\":\"AdminPass123!\"}'"`;

  fs.writeFileSync("deploy-to-render.sh", script);
  fs.chmodSync("deploy-to-render.sh", "755");
  
  console.log("✅ Deployment script created: deploy-to-render.sh");
}

function createHealthCheckScript() {
  console.log("🏥 Creating Health Check Script...");
  
  const healthScript = `#!/bin/bash

# Production Health Check Script

BACKEND_URL="https://clearance-system-api.onrender.com"
FRONTEND_URL="https://clearance-system-frontend.onrender.com"

echo "🏥 Clearing System Health Check"
echo "================================"

# Test Backend Health
echo "🔍 Testing Backend Health..."
BACKEND_HEALTH=$(curl -s "$BACKEND_URL/api/health" | head -1)
if [[ $BACKEND_HEALTH == *"success"* ]]; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed: $BACKEND_HEALTH"
fi

# Test Login Endpoint
echo "🔍 Testing Login Endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@demo.edu","password":"AdminPass123!"}' | head -1)
if [[ $LOGIN_RESPONSE == *"success"* ]]; then
    echo "✅ Login endpoint working"
else
    echo "❌ Login endpoint failed: $LOGIN_RESPONSE"
fi

# Test Frontend
echo "🔍 Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s "$FRONTEND_URL" | head -1)
if [[ $FRONTEND_RESPONSE == *"Clearance System"* ]] || [[ $FRONTEND_RESPONSE == *"<!DOCTYPE"* ]]; then
    echo "✅ Frontend loading correctly"
else
    echo "❌ Frontend not loading: $FRONTEND_RESPONSE"
fi

echo ""
echo "📊 Health Check Complete"
echo "🔗 Backend: $BACKEND_URL"
echo "🔗 Frontend: $FRONTEND_URL"`;

  fs.writeFileSync("health-check.sh", healthScript);
  fs.chmodSync("health-check.sh", "755");
  
  console.log("✅ Health check script created: health-check.sh");
}

function generateDeploymentInstructions() {
  console.log("📖 Generating Deployment Instructions...");
  
  const instructions = `# Render Deployment Instructions

## 🚀 Quick Start

### Option 1: Automatic (Recommended)
1. Connect your GitHub repository to Render
2. Use the provided \`render.yaml\` file
3. Set environment variables
4. Deploy automatically

### Option 2: Manual
1. Run \`./deploy-to-render.sh\`
2. Upload \`clearance-system-deploy.tar.gz\`
3. Configure services manually
4. Set environment variables

## 📋 Required Environment Variables

### Backend Service
- \`NODE_ENV=production\`
- \`MONGODB_URI=mongodb+srv://...\`
- \`JWT_SECRET=your-secret-key\`
- \`CLIENT_URL=https://your-frontend.onrender.com\`

### Frontend Service  
- \`VITE_API_URL=https://your-backend.onrender.com/api\`
- \`VITE_SOCKET_URL=https://your-backend.onrender.com\`

## 🧪 Post-Deployment Testing

1. Run \`./health-check.sh\`
2. Test login with demo accounts
3. Verify all features work
4. Check database connectivity

## 📱 Demo Accounts

- Admin: admin@demo.edu / AdminPass123!
- Staff: staff1@demo.edu / StaffPass123!
- Students: student1@demo.edu / StudentPass123!

## 🔗 Production URLs

Once deployed, your application will be available at:
- Backend: https://clearance-system-api.onrender.com
- Frontend: https://clearance-system-frontend.onrender.com

## 🆘 Troubleshooting

Check \`TROUBLESHOOTING_GUIDE.md\` for common issues and solutions.`;

  fs.writeFileSync("RENDER_DEPLOYMENT.md", instructions);
  
  console.log("✅ Deployment instructions created: RENDER_DEPLOYMENT.md");
}

// Main execution
function main() {
  console.log("🎯 Creating Render Deployment Automation...\n");
  
  const steps = [
    { name: "Render Manifest", fn: createRenderManifest },
    { name: "Environment Templates", fn: createEnvironmentTemplates },
    { name: "Deployment Script", fn: createDeploymentScript },
    { name: "Health Check Script", fn: createHealthCheckScript },
    { name: "Deployment Instructions", fn: generateDeploymentInstructions }
  ];
  
  for (const step of steps) {
    try {
      step.fn();
    } catch (error) {
      console.error(`❌ ${step.name} failed:`, error.message);
    }
  }
  
  console.log("\n🎉 Render deployment automation created!");
  console.log("\n📋 Files created:");
  console.log("   - render-manifest.json");
  console.log("   - backend.env.template");
  console.log("   - frontend.env.template");
  console.log("   - deploy-to-render.sh");
  console.log("   - health-check.sh");
  console.log("   - RENDER_DEPLOYMENT.md");
  console.log("\n🚀 Next steps:");
  console.log("1. Set up MongoDB Atlas (see scripts/mongodb-atlas-setup.md)");
  console.log("2. Run ./deploy-to-render.sh");
  console.log("3. Connect repository to Render");
  console.log("4. Set environment variables");
  console.log("5. Deploy and test!");
}

if (require.main === module) {
  main().catch(error => console.error(error));
}

module.exports = { main };
