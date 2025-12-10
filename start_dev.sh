#!/bin/bash

# X8 Network SaaS Development Startup Script

echo "🚀 Starting X8 Network SaaS Development Environment..."
echo ""

# Activate virtual environment
echo "📦 Activating Python virtual environment..."
source .venv/bin/activate

# Check database migration status
echo "🗄️  Checking database migration status..."
alembic current

# Start backend server in background
echo "🐍 Starting FastAPI backend server on http://localhost:8000..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend server
echo "⚛️  Starting React frontend server on http://localhost:5175..."
cd app/frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT

# Wait for both processes
wait
