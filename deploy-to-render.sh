#!/bin/bash

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
tar -czf clearance-system-deploy.tar.gz   server/   client/dist/   render.yaml   render-manifest.json   DEPLOYMENT_GUIDE.md   TROUBLESHOOTING_GUIDE.md

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
echo "curl -X POST https://your-backend.onrender.com/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@demo.edu","password":"AdminPass123!"}'"