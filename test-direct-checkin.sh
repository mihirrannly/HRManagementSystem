#!/bin/bash
# Direct test of the check-in endpoint (no auth, just to see if route exists)

echo "🧪 Testing attendance endpoints..."
echo ""

echo "1️⃣ Testing /api/attendance/today (should return 401 without auth):"
curl -s -w "\nStatus: %{http_code}\n" http://localhost:5001/api/attendance/today
echo ""
echo ""

echo "2️⃣ Testing /api/attendance/checkin (should return 401 without auth):"
curl -s -w "\nStatus: %{http_code}\n" -X POST http://localhost:5001/api/attendance/checkin \
  -H "Content-Type: application/json" \
  -d '{"deviceInfo": {"test": "true"}}'
echo ""
echo ""

echo "3️⃣ Testing /api/webhook/attendance (should return 401 without x-auth-key):"
curl -s -w "\nStatus: %{http_code}\n" -X POST http://localhost:5001/api/webhook/attendance \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
echo ""

