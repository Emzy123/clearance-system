#!/bin/bash

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
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
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
echo "🔗 Frontend: $FRONTEND_URL"