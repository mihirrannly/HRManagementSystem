#!/bin/bash

# Kill any existing processes
echo "🔄 Stopping existing servers..."
pkill -f "node server/index.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start backend server
echo "🚀 Starting backend server on port 5001..."
cd "$(dirname "$0")"
JWT_SECRET="rannkly-hr-super-secret-jwt-key-2024-development" JWT_EXPIRE="7d" NODE_ENV="development" MONGODB_URI="mongodb://localhost:27017/hr-management" PORT=5001 node server/index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd client
npm run dev &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "📱 Backend: http://localhost:5001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
