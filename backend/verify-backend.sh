#!/bin/bash
# Backend verification script - Run this AFTER restarting backend

echo "🔍 Checking if backend is running on port 5001..."
lsof -i :5001 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend is listening on port 5001"
else
    echo "❌ Backend is NOT running on port 5001"
    echo "   Please restart: npm run dev"
    exit 1
fi

echo ""
echo "🔍 Testing health endpoint..."
HEALTH=$(curl -s http://localhost:5001/health)
if [ $? -eq 0 ]; then
    echo "✅ Health endpoint responding:"
    echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
    echo "❌ Health endpoint not responding"
    exit 1
fi

echo ""
echo "🔍 Testing link creation..."
RESPONSE=$(curl -s -X POST http://localhost:5001/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://www.google.com",
    "customAlias": "test-'$(date +%s)'",
    "campaign": "verification-test"
  }')

if [ $? -eq 0 ]; then
    echo "✅ Link creation test successful:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ Link creation failed"
    exit 1
fi

echo ""
echo "✅ All checks passed! Backend is working correctly."
