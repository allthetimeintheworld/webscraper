#!/bin/bash

# Web Scraper Development Environment Setup Script

set -e

echo "🚀 Setting up Web Scraper development environment..."

# Check if Python 3.9+ is available
if ! python3 --version | grep -qE "Python 3\.(9|10|11|12)"; then
    echo "❌ Python 3.9+ is required. Please install it first."
    exit 1
fi

# Check if Node.js 16+ is available
if ! node --version | grep -qE "v1[6-9]|v[2-9][0-9]"; then
    echo "❌ Node.js 16+ is required. Please install it first."
    exit 1
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required. Please install it first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is required. Please install it first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration"
fi

# Setup Python backend
echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup complete"

cd ..

# Setup React frontend
echo "⚛️  Setting up React frontend..."
cd frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete"

cd ..

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL, Redis)..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Setting up database..."
cd backend
source venv/bin/activate

# Create database tables (this will be done automatically when the app starts)
echo "Database will be initialized when the backend starts."

cd ..

echo ""
echo "🎉 Setup complete! You can now run the application:"
echo ""
echo "Backend:  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "Frontend: cd frontend && npm run dev"
echo ""
echo "Or use the run script: ./scripts/run_dev.sh"
echo ""
echo "📖 Documentation:"
echo "  - API docs: http://localhost:8000/docs"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "⚠️  Don't forget to configure your .env file with AWS credentials!"
