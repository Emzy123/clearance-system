# MongoDB Atlas Setup Guide

## 🚀 Quick Setup for Production

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or sign up
3. Verify your email address

### Step 2: Create a New Cluster
1. Click "Build a Cluster"
2. Choose **M0 Sandbox** (Free tier)
3. Select a cloud provider and region (choose closest to your users)
4. Cluster name: `clearance-system-cluster`
5. Click "Create Cluster"

### Step 3: Configure Network Access
1. Go to **Network Access** in left sidebar
2. Click "Add IP Address"
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Click "Confirm"

### Step 4: Create Database User
1. Go to **Database Access** in left sidebar
2. Click "Add New Database User"
3. Username: `clearance-admin`
4. Password: Generate a strong password (save it!)
5. Database User Privileges: Read and write to any database
6. Click "Add User"

### Step 5: Get Connection String
1. Go to **Database** in left sidebar
2. Click "Connect" for your cluster
3. Select "Connect with MongoDB Compass"
4. Click "I have MongoDB Compass"
5. Copy the connection string

### Step 6: Update Connection String
Replace the placeholder in the connection string:
```bash
# Original:
mongodb+srv://<username>:<password>@cluster.mongodb.net/

# Updated:
mongodb+srv://clearance-admin:YOUR_PASSWORD@clearance-system-cluster.mongodb.net/clearance-system?retryWrites=true&w=majority
```

### Step 7: Set Environment Variable
In your Render dashboard, set:
```env
MONGODB_URI=mongodb+srv://clearance-admin:YOUR_PASSWORD@clearance-system-cluster.mongodb.net/clearance-system?retryWrites=true&w=majority
```

## 🔧 Test Connection

### Option 1: Using MongoDB Compass
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Paste your connection string
3. Click "Connect"
4. You should see an empty database

### Option 2: Using Node.js
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect('your-connection-string')
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.error('❌ Connection failed:', err.message));
"
```

## 📱 Production Database Setup

Once connected, run the seed script to populate your database:
```bash
cd server
npm run seed
```

## 🔍 Troubleshooting

### Common Issues

1. **IP Access Error**
   - Ensure 0.0.0.0/0 is added to IP whitelist
   - Wait 2-3 minutes for changes to take effect

2. **Authentication Error**
   - Double-check username and password
   - Ensure user has correct permissions

3. **Connection Timeout**
   - Check if cluster is created and running
   - Verify network access settings

4. **SSL Certificate Error**
   - Ensure connection string includes `ssl=true` (default in Atlas)

### Connection String Examples

**Development (Local):**
```env
MONGODB_URI=mongodb://localhost:27017/clearance-system
```

**Production (Atlas):**
```env
MONGODB_URI=mongodb+srv://clearance-admin:strong_password_123@clearance-system-cluster.mongodb.net/clearance-system?retryWrites=true&w=majority
```

## 🚀 Next Steps

1. ✅ Atlas account created
2. ✅ Cluster deployed (M0 Sandbox)
3. ✅ Network access configured
4. ✅ Database user created
5. ✅ Connection string obtained
6. ✅ Environment variable set
7. ✅ Connection tested
8. ✅ Database seeded

Your MongoDB Atlas database is now ready for production!
