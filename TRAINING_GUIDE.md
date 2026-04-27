# Production Troubleshooting Guide

## 🔍 Route Not Found Error: POST /auth/login

### **Root Cause Analysis**
The error "Route not found: POST /auth/login" indicates the API routes are not being properly mounted in the deployed environment.

### **Common Causes & Solutions**

#### 1. **Environment Variable Issues**
**Problem**: Missing or incorrect `VITE_API_URL` in frontend
**Solution**: Ensure frontend environment variables are set correctly:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

#### 2. **CORS Configuration**
**Problem**: Frontend domain not in CORS allowed origins
**Solution**: Update `CLIENT_URL` in backend environment variables:
```env
CLIENT_URL=https://your-frontend.onrender.com
```

#### 3. **Build Process Issues**
**Problem**: Frontend not building with correct environment variables
**Solution**: Verify build command includes environment:
```bash
cd client && npm install && npm run build
```

#### 4. **Route Mounting Issues**
**Problem**: Routes not properly imported or mounted
**Solution**: Verify all route files exist and are properly exported

### **Debugging Steps**

#### Step 1: Test Backend Health
```bash
curl https://your-backend.onrender.com/api/health
```

#### Step 2: Test Specific Route
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.edu","password":"AdminPass123!"}'
```

#### Step 3: Check Frontend Configuration
Open browser dev tools and check:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

#### Step 4: Verify Network Requests
In browser dev tools > Network tab:
- Check if requests are going to correct URL
- Verify CORS headers
- Look for 404 errors

### **Render-Specific Solutions**

#### 1. **Check Build Logs**
- Go to Render dashboard > Your service > Logs
- Look for route mounting errors
- Verify all dependencies installed

#### 2. **Verify Environment Variables**
- Render dashboard > Service > Environment
- Ensure all required variables are set
- Check for typos in variable names

#### 3. **Redeploy Service**
- Push changes to GitHub
- Or trigger manual redeploy in Render dashboard

#### 4. **Check Service Type**
- Backend should be "Web Service" (Node.js)
- Frontend should be "Static Site"

### **Quick Fix Checklist**

✅ **Backend Environment Variables**:
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=your-mongodb-uri`
- `JWT_SECRET=your-secret`
- `CLIENT_URL=https://your-frontend.onrender.com`

✅ **Frontend Environment Variables**:
- `VITE_API_URL=https://your-backend.onrender.com/api`
- `VITE_SOCKET_URL=https://your-backend.onrender.com`

✅ **Service Configuration**:
- Backend: Node.js, rootDir: `server`
- Frontend: Static, rootDir: `client/dist`

✅ **Build Commands**:
- Backend: `npm install`
- Frontend: `cd client && npm install && npm run build`

### **Common Render Issues**

1. **Wrong Root Directory**: Ensure backend points to `server` folder
2. **Missing Dependencies**: Check `package.json` has all required packages
3. **Environment Variable Timing**: Variables must be set before first deploy
4. **CORS Issues**: Ensure frontend URL is in allowed origins

### **Testing Production URLs**

```bash
# Test health endpoint
curl https://your-backend.onrender.com/api/health

# Test login endpoint  
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.edu","password":"AdminPass123!"}'

# Test frontend loads
curl https://your-frontend.onrender.com
```

### **If Still Not Working**

1. **Check Render service status** (active or failed)
2. **Review deployment logs** for errors
3. **Verify MongoDB connectivity** in production
4. **Test locally with production env vars**
5. **Contact Render support** if service issues persist
