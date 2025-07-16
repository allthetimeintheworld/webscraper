# Project File Structure

```
webscraper/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/
│   ├── requirements.txt
│   ├── main.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   └── database.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── jobs.py
│   │   ├── instances.py
│   │   └── data.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── scraper/
│   │   │   ├── __init__.py
│   │   │   ├── base_spider.py
│   │   │   ├── selenium_spider.py
│   │   │   └── rate_limiter.py
│   │   ├── queue/
│   │   │   ├── __init__.py
│   │   │   ├── job_manager.py
│   │   │   └── tasks.py
│   │   └── aws/
│   │       ├── __init__.py
│   │       ├── ec2_manager.py
│   │       └── s3_storage.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── job.py
│   │   ├── target.py
│   │   └── result.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── job_service.py
│   │   ├── instance_service.py
│   │   └── data_service.py
│   └── tests/
│       ├── __init__.py
│       ├── test_api/
│       ├── test_scraper/
│       └── test_services/
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── MainDashboard.tsx
│   │   │   │   ├── MetricsCards.tsx
│   │   │   │   └── JobStatusTable.tsx
│   │   │   ├── Jobs/
│   │   │   │   ├── JobCreator.tsx
│   │   │   │   ├── JobManager.tsx
│   │   │   │   └── JobDetails.tsx
│   │   │   ├── Instances/
│   │   │   │   ├── InstanceGrid.tsx
│   │   │   │   ├── InstanceMonitor.tsx
│   │   │   │   └── ScalingConfig.tsx
│   │   │   └── common/
│   │   │       ├── Layout.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Header.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── websocket.ts
│   │   │   └── types.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── jobStore.ts
│   │   │   └── instanceStore.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Jobs.tsx
│   │   │   ├── Instances.tsx
│   │   │   └── Settings.tsx
│   │   └── App.tsx
│   └── public/
│
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── ec2/
│   │   │   ├── rds/
│   │   │   └── networking/
│   │   └── environments/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── prod/
│   └── docker/
│       ├── Dockerfile.backend
│       ├── Dockerfile.frontend
│       └── Dockerfile.worker
│
├── scripts/
│   ├── deploy.sh
│   ├── setup_dev.sh
│   └── run_tests.sh
│
└── docs/
    ├── API.md
    ├── DEPLOYMENT.md
    ├── ARCHITECTURE.md
    └── USER_GUIDE.md
```

## Key Configuration Files

### backend/requirements.txt
```txt
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
redis==5.0.1
celery==5.3.4
scrapy==2.11.0
selenium==4.15.2
playwright==1.40.0
beautifulsoup4==4.12.2
requests==2.31.0
boto3==1.34.0
pydantic==2.5.0
python-multipart==0.0.6
python-jose==3.3.0
passlib==1.7.4
aiofiles==23.2.1
```

### frontend/package.json
```json
{
  "name": "webscraper-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "typescript": "^5.0.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.7.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: webscraper
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: ../infrastructure/docker/Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/webscraper
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: ./frontend
      dockerfile: ../infrastructure/docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app

  worker:
    build:
      context: ./backend
      dockerfile: ../infrastructure/docker/Dockerfile.worker
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/webscraper
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```
