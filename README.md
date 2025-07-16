# Distributed Web Scraping Application

A scalable, distributed web scraping platform with intelligent rate limiting, robots.txt handling, and anti-detection capabilities.

## Features

- 🤖 **Intelligent Robots.txt Handling** - Configurable compliance with risk assessment
- ⚡ **Adaptive Rate Limiting** - Dynamic adjustment based on server responses
- 🌍 **Distributed EC2 Architecture** - Multi-region scraping with auto-scaling
- 🎭 **Advanced Anti-Detection** - Browser fingerprinting, proxy rotation, human-like behavior
- 📊 **Modern Dashboard** - Real-time monitoring and job management
- 🔍 **JavaScript Rendering** - Handle SPAs and dynamic content
- 📈 **Scalable Architecture** - From prototype to enterprise scale

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- AWS Account with EC2, S3, RDS access
- Docker & Docker Compose

### Development Setup

1. **Clone and setup environment**
```bash
cd /home/jadyar/Desktop/webscraper
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

2. **Start services**
```bash
docker-compose up -d  # PostgreSQL, Redis, monitoring
```

3. **Run backend**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. **Run frontend**
```bash
cd frontend
npm install
npm run dev
```

5. **Access the application**
- Dashboard: http://localhost:3000
- API Documentation: http://localhost:8000/docs

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   FastAPI       │    │   Worker Pool   │
│   Dashboard     │◄──►│   Backend       │◄──►│   (EC2 Fleet)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                        ┌───────▼───────┐
                        │  PostgreSQL   │
                        │  Redis Queue  │
                        │  S3 Storage   │
                        └───────────────┘
```

## Project Structure

```
├── backend/           # Python FastAPI backend
├── frontend/          # React TypeScript dashboard
├── infrastructure/    # Terraform AWS resources
├── scripts/          # Deployment and utility scripts
└── docs/             # Documentation
```

## Implementation Phases

- **Phase 1** (Weeks 1-3): Core infrastructure and basic scraping
- **Phase 2** (Weeks 4-6): Advanced features and anti-detection
- **Phase 3** (Weeks 7-9): Scaling and optimization
- **Phase 4** (Weeks 10-12): Polish and enterprise features

## Documentation

- [Implementation Checklist](IMPLEMENTATION_CHECKLIST.md)
- [Functionality Guide](FUNCTIONALITY_GUIDE.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [API Documentation](docs/API.md)

## License

MIT License - See LICENSE file for details
