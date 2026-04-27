# Render Deployment Guide

## 🚀 Quick Setup for Production

### 1. Backend Service (API)

**Service Settings:**
- **Name**: `clearance-system-api`
- **Runtime**: Node
- **Plan**: Free or Starter
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clearance-system?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-app.onrender.com
```

### 2. Frontend Service

**Service Settings:**
- **Name**: `clearance-system-frontend`
- **Runtime**: Static
- **Plan**: Free
- **Root Directory**: `client/dist`
- **Build Command**: `cd client && npm install && npm run build`

**Environment Variables:**
```env
VITE_API_URL=https://clearance-system-api.onrender.com/api
VITE_SOCKET_URL=https://clearance-system-api.onrender.com
```

## 📋 Required Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clearance-system?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-app.onrender.com
```

### Frontend (.env.production)
```env
VITE_API_URL=https://clearance-system-api.onrender.com/api
VITE_SOCKET_URL=https://clearance-system-api.onrender.com
```

## 🔧 MongoDB Setup

1. **Create MongoDB Atlas Account**
2. **Create a New Cluster**
3. **Get Connection String**
4. **Set Environment Variable**: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clearance-system?retryWrites=true&w=majority`

## 📱 Deployment Steps

### Step 1: Deploy Backend
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure as shown above
4. Deploy and wait for build to complete

### Step 2: Deploy Frontend
1. Create another Web Service
2. Configure as Static site
3. Connect to same repository
4. Deploy and wait for build to complete

### Step 3: Seed Database
1. Once backend is deployed, access the Render shell
2. Run: `cd server && npm run seed`
3. Verify seeded data works

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `https://your-api.onrender.com/api/health`
- [ ] Frontend loads correctly
- [ ] Login works with seeded accounts
- [ ] CORS is properly configured
- [ ] Database connectivity is established
- [ ] All API endpoints respond correctly

## 🧪 Testing Production URLs

```bash
# Test health endpoint
curl https://your-api.onrender.com/api/health

# Test login
curl -X POST https://your-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.edu","password":"AdminPass123!"}'
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CLIENT_URL` matches your frontend URL
2. **Database Connection**: Verify MongoDB URI is correct and accessible
3. **Build Failures**: Check Node.js version compatibility (requires 20.x)
4. **Login Failures**: Ensure database is seeded with demo accounts

### Environment Variable Debugging

```bash
# Check if backend is running
curl https://your-api.onrender.com/api/health

# Check environment variables in Render dashboard
# Navigate to Service > Environment > Environment Variables
```

## 📊 Demo Accounts for Testing

- **Admin**: `admin@demo.edu` / `AdminPass123!`
- **Staff**: `staff1@demo.edu` to `staff5@demo.edu` / `StaffPass123!`
- **Students**: `student1@demo.edu` to `student10@demo.edu` / `StudentPass123!`

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub. Ensure:
- Your `render.yaml` is properly configured
- Environment variables are set in Render dashboard
- Build scripts work correctly

## 📞 Support

If you encounter issues:
1. Check Render build logs
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB Atlas connectivity
