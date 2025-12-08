#!/bin/bash

# Test Authentication Endpoints
BASE_URL="http://localhost:8000"

echo "================================"
echo "Testing X8 Network Auth API"
echo "================================"
echo ""

# Test 1: Register a new user
echo "1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "client"
  }')

echo "Response: $REGISTER_RESPONSE"
echo ""

# Extract access token if registration succeeded
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo "✓ Registration successful!"
  echo "Access Token: ${ACCESS_TOKEN:0:50}..."
else
  echo "✗ Registration failed or user already exists"
fi
echo ""

# Test 2: Login with existing user
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract access token from login
LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$LOGIN_TOKEN" ]; then
  echo "✓ Login successful!"
  echo "Access Token: ${LOGIN_TOKEN:0:50}..."
  ACCESS_TOKEN=$LOGIN_TOKEN
else
  echo "✗ Login failed"
fi
echo ""

# Test 3: Get current user info
if [ -n "$ACCESS_TOKEN" ]; then
  echo "3. Testing Get Current User..."
  USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  echo "Response: $USER_RESPONSE"
  echo ""

  if echo "$USER_RESPONSE" | grep -q "email"; then
    echo "✓ User info retrieved successfully!"
  else
    echo "✗ Failed to retrieve user info"
  fi
else
  echo "3. Skipping user info test (no access token)"
fi

echo ""
echo "================================"
echo "Test Complete"
echo "================================"
