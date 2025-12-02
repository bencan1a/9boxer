# Deployment Guide

This guide covers deploying the 9-Box Performance Review System in various environments.

## Table of Contents
- [Docker Deployment (Recommended)](#docker-deployment-recommended)
- [Manual Deployment](#manual-deployment)
- [Production Configuration](#production-configuration)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Docker Deployment (Recommended)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM
- 10GB+ disk space

### Steps

1. **Clone the repository**:
```bash
git clone <repository-url>
cd 9boxer
```

2. **Create environment file**:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```bash
# IMPORTANT: Generate a strong secret key!
SECRET_KEY=your-very-long-random-secret-key-here

# Optional: Customize other settings
LOG_LEVEL=INFO
TOKEN_EXPIRE_MINUTES=60
```

3. **Generate a secure SECRET_KEY**:
```bash
# Use Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or OpenSSL
openssl rand -base64 32
```

4. **Build and start containers**:
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

5. **Verify deployment**:
```bash
# Check container status
docker-compose ps

# Should show:
# ninebox-backend   running   0.0.0.0:8000->8000/tcp
# ninebox-frontend  running   0.0.0.0:3000->80/tcp

# Check health
curl http://localhost:8000/health
curl http://localhost:3000/health
```

6. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Remove all data (WARNING: Destroys database!)
docker-compose down -v
```

## Manual Deployment

### Backend Deployment

#### Prerequisites
- Python 3.10+
- pip
- Virtual environment

#### Steps

1. **Set up backend**:
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -e .
```

2. **Configure environment**:
```bash
# Create .env file in backend directory
cat > .env << EOF
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///data/ninebox.db
LOG_LEVEL=INFO
EOF
```

3. **Initialize database**:
```bash
python -c "from ninebox.core.database import init_db; init_db()"
```

4. **Run backend**:
```bash
# Development
cd src
python -m ninebox.main

# Production (with Gunicorn)
pip install gunicorn
gunicorn ninebox.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### Frontend Deployment

#### Prerequisites
- Node.js 18+
- npm

#### Steps

1. **Set up frontend**:
```bash
cd frontend
npm install
```

2. **Configure API endpoint**:
Edit `frontend/src/services/api.ts` and update the `baseURL`:
```typescript
baseURL: "http://your-backend-domain:8000",
```

3. **Build frontend**:
```bash
npm run build
# Output in dist/ directory
```

4. **Serve frontend**:

**Option A: Using nginx**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Option B: Using serve**:
```bash
npm install -g serve
serve -s dist -p 3000
```

## Production Configuration

### Environment Variables

#### Backend
```bash
# Security (REQUIRED)
SECRET_KEY=very-long-random-string-change-in-production

# Database
DATABASE_URL=sqlite:////app/data/ninebox.db

# CORS (adjust for your domains)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=WARNING  # Use WARNING or ERROR in production

# JWT
TOKEN_EXPIRE_MINUTES=60
```

#### Frontend
Update `frontend/.env.production`:
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Database

#### SQLite (Default)
- Good for: Small deployments, single-server setups
- Limitations: No concurrent writes, single file
- Location: `/app/data/ninebox.db` (in Docker)
- Backup: Copy the database file

#### Upgrading to PostgreSQL (Recommended for Production)

1. **Install PostgreSQL**:
```bash
# Using Docker
docker run -d \
  --name ninebox-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=ninebox \
  -p 5432:5432 \
  postgres:15
```

2. **Update DATABASE_URL**:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ninebox
```

3. **Install dependencies**:
```bash
pip install psycopg2-binary
```

### Reverse Proxy (nginx)

Recommended nginx configuration for production:

```nginx
upstream backend {
    server localhost:8000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    root /var/www/ninebox/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth endpoints
    location /auth/ {
        proxy_pass http://backend/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # File uploads
    location /session/ {
        client_max_body_size 10M;
        proxy_pass http://backend/session/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Best Practices

### 1. SECRET_KEY
- **CRITICAL**: Change the default SECRET_KEY
- Use a cryptographically secure random string (32+ characters)
- Never commit the secret key to version control
- Rotate periodically (invalidates existing tokens)

### 2. CORS Configuration
```bash
# Only allow your domains
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

### 3. HTTPS
- Always use HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Redirect HTTP to HTTPS

### 4. Database Security
- Use strong passwords
- Restrict database access to localhost
- Regular backups
- Encrypt sensitive data

### 5. File Upload Security
- Already limited to .xlsx/.xls files
- 10MB file size limit
- Files processed in memory, not stored permanently

### 6. Authentication
- JWT tokens expire after 60 minutes (configurable)
- Passwords are hashed with bcrypt
- No password reset functionality (add if needed)

### 7. Rate Limiting
Consider adding rate limiting with nginx:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
    proxy_pass http://backend/api/;
}
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:3000/health
```

### Logging

**Backend logs**:
```bash
# Docker
docker-compose logs -f backend

# Manual deployment
tail -f /path/to/logs/ninebox.log
```

**Frontend logs** (nginx):
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Metrics

Consider adding:
- Prometheus for metrics collection
- Grafana for visualization
- Application performance monitoring (APM)

## Backup and Recovery

### Database Backup

**SQLite**:
```bash
# Backup
cp /app/data/ninebox.db /backups/ninebox_$(date +%Y%m%d).db

# Restore
cp /backups/ninebox_20231215.db /app/data/ninebox.db
```

**PostgreSQL**:
```bash
# Backup
pg_dump ninebox > ninebox_backup.sql

# Restore
psql ninebox < ninebox_backup.sql
```

### Docker Volumes Backup

```bash
# Backup volume
docker run --rm \
  -v ninebox-backend-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /data

# Restore volume
docker run --rm \
  -v ninebox-backend-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Common issues:
# - Port already in use (change ports in docker-compose.yml)
# - Permission issues (check file permissions)
# - Missing .env file (create from .env.example)
```

### Database errors

```bash
# Reset database (WARNING: Destroys data!)
docker-compose down -v
docker-compose up -d

# Or manually:
rm /app/data/ninebox.db
python -c "from ninebox.core.database import init_db; init_db()"
```

### CORS errors

```bash
# Update CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Restart backend
docker-compose restart backend
```

### File upload fails

```bash
# Check nginx configuration
client_max_body_size 10M;

# Check backend file size limit (in code)
# Default is 10MB
```

### Frontend can't reach backend

```bash
# Check API base URL in frontend
# src/services/api.ts should point to correct backend URL

# Check nginx proxy configuration
# Ensure /api/ routes are proxied correctly
```

### Performance issues

```bash
# Scale backend workers
docker-compose up -d --scale backend=3

# Or with Gunicorn
gunicorn ninebox.main:app --workers 4
```

### Memory issues

```bash
# Limit container memory
docker-compose.yml:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

## Upgrading

### Docker upgrade

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose down
docker-compose build
docker-compose up -d
```

### Manual upgrade

```bash
# Backend
cd backend
git pull
source venv/bin/activate
pip install -e .
# Restart service

# Frontend
cd frontend
git pull
npm install
npm run build
# Restart web server
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check health endpoints
4. Review nginx error logs
5. Open an issue on GitHub
