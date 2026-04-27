# Render Deployment Instructions

## 🚀 Quick Start

### Option 1: Automatic (Recommended)
1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` file
3. Set environment variables
4. Deploy automatically

### Option 2: Manual
1. Run `./deploy-to-render.sh`
2. Upload `clearance-system-deploy.tar.gz`
3. Configure services manually
4. Set environment variables

## 📋 Required Environment Variables

### Backend Service
- `NODE_ENV=production`
- `MONGODB_URI=mongodb+srv://...`
- `JWT_SECRET=your-secret-key`
- `CLIENT_URL=https://your-frontend.onrender.com`

### Frontend Service  
- `VITE_API_URL=https://your-backend.onrender.com/api`
- `VITE_SOCKET_URL=https://your-backend.onrender.com`

## 🧪 Post-Deployment Testing

1. Run `./health-check.sh`
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

Check `TROUBLESHOOTING_GUIDE.md` for common issues and solutions.