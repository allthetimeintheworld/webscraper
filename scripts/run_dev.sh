#!/bin/bash

# Development runner script for Web Scraper

set -e

echo "🚀 Starting Web Scraper development environment..."

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    pkill -f "uvicorn main:app" || true
    pkill -f "npm run dev" || true
    pkill -f "celery" || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Docker services if not running
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Start backend in background
echo "🐍 Starting backend server..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend in background
echo "⚛️  Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start Celery worker in background
echo "👷 Starting Celery worker..."
cd backend
source venv/bin/activate
celery -A core.queue.tasks worker --loglevel=info &
WORKER_PID=$!
cd ..

echo ""
echo "🎉 All services started!"
echo ""
echo "📖 Access the application:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Documentation: http://localhost:8000/docs"
echo ""
echo "📊 Service status:"
echo "  - Backend PID: $BACKEND_PID"
echo "  - Frontend PID: $FRONTEND_PID"
echo "  - Worker PID: $WORKER_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
