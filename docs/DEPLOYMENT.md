# Deployment Guide - NetherList

Complete guide for deploying NetherList to production.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment Options](#deployment-options)
5. [Docker Deployment](#docker-deployment)
6. [VPS Deployment](#vps-deployment)
7. [Cloud Deployment](#cloud-deployment)
8. [Post-Deployment](#post-deployment)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Overview

NetherList can be deployed in several ways:
- **Docker Compose** (Recommended for small-medium scale)
- **VPS** (DigitalOcean, Hetzner, Linode)
- **Cloud Platforms** (AWS, GCP, Azure)
- **Kubernetes** (For large scale)

**Recommended for MVP**: VPS with Docker Compose

---

## Prerequisites

### Required
- Domain name (e.g., `netherlist.com`)
- VPS or cloud account
- SSL certificate (Let's Encrypt)
- Git repository access

### Recommended Specs (MVP)
- **CPU**: 2 cores minimum
- **RAM**: 4GB minimum
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

---

## Environment Setup

### 1. Domain Configuration

Point your domain to your server:

```
# DNS Records
A     @               YOUR_SERVER_IP
A     www             YOUR_SERVER_IP
A     api             YOUR_SERVER_IP
CNAME www             netherlist.com
```

### 2. SSH Key Setup

```bash
# Generate SSH key (local machine)
ssh-keygen -t ed25519 -C "deploy@netherlist.com"

# Copy to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@YOUR_SERVER_IP
```

### 3. Server Initial Setup

```bash
# SSH into server
ssh user@YOUR_SERVER_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git vim ufw fail2ban

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Create deployment user
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo su - deploy
```

---

## Docker Deployment

### 1. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/netherlist
sudo chown deploy:deploy /opt/netherlist
cd /opt/netherlist

# Clone repository
git clone https://github.com/yourusername/netherlist.git .
```

### 3. Configure Environment

```bash
# Backend environment
cd /opt/netherlist
cp backend/.env.example backend/.env

# Edit backend/.env
nano backend/.env
```

**backend/.env** (Production):
```env
NODE_ENV=production
PORT=4000

# Database (use strong password!)
DATABASE_URL="postgresql://netherlist:STRONG_PASSWORD_HERE@postgres:5432/netherlist_prod"

# Redis
REDIS_URL="redis://redis:6379"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY_HERE"

# CORS
CORS_ORIGIN="https://netherlist.com,https://www.netherlist.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**frontend/.env** (Production):
```env
NEXT_PUBLIC_API_URL=https://api.netherlist.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.netherlist.com
NEXT_PUBLIC_APP_NAME=NetherList
NEXT_PUBLIC_APP_URL=https://netherlist.com
```

**docker-compose.prod.yml** environment:
```bash
# Create .env for docker-compose
nano .env
```

```env
# PostgreSQL
POSTGRES_USER=netherlist
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=netherlist_prod

# Redis
REDIS_PASSWORD=REDIS_PASSWORD_HERE

# URLs
DATABASE_URL=postgresql://netherlist:STRONG_PASSWORD_HERE@postgres:5432/netherlist_prod
REDIS_URL=redis://:REDIS_PASSWORD_HERE@redis:6379

# Backend
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_HERE
CORS_ORIGIN=https://netherlist.com,https://www.netherlist.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.netherlist.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.netherlist.com
```

### 4. Setup Nginx Reverse Proxy

```bash
# Create nginx configuration directory
mkdir -p nginx

# Create nginx.conf
nano nginx/nginx.conf
```

**nginx/nginx.conf**:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:4000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=1000r/m;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name netherlist.com www.netherlist.com api.netherlist.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend (netherlist.com)
    server {
        listen 443 ssl http2;
        server_name netherlist.com www.netherlist.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        client_max_body_size 10M;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Backend API (api.netherlist.com)
    server {
        listen 443 ssl http2;
        server_name api.netherlist.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        client_max_body_size 10M;

        location / {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot

# Get SSL certificate
sudo certbot certonly --standalone -d netherlist.com -d www.netherlist.com -d api.netherlist.com

# Copy certificates to nginx directory
sudo mkdir -p /opt/netherlist/nginx/ssl
sudo cp /etc/letsencrypt/live/netherlist.com/fullchain.pem /opt/netherlist/nginx/ssl/
sudo cp /etc/letsencrypt/live/netherlist.com/privkey.pem /opt/netherlist/nginx/ssl/
sudo chown -R deploy:deploy /opt/netherlist/nginx/ssl

# Auto-renewal cron job
sudo crontab -e
# Add this line:
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/netherlist.com/*.pem /opt/netherlist/nginx/ssl/ && docker-compose -f /opt/netherlist/docker-compose.prod.yml restart nginx
```

### 6. Build and Deploy

```bash
# Navigate to project directory
cd /opt/netherlist

# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Optional: Seed database
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

### 7. Verify Deployment

```bash
# Check if services are running
curl https://api.netherlist.com/health
curl https://netherlist.com

# Check logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs postgres
docker-compose -f docker-compose.prod.yml logs redis
```

---

## VPS Deployment (Without Docker)

### 1. Install Dependencies

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
sudo apt update
sudo apt install -y postgresql-16

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx
```

### 2. Setup PostgreSQL

```bash
# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE netherlist_prod;
CREATE USER netherlist WITH PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE netherlist_prod TO netherlist;
\q
```

### 3. Setup Application

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/yourusername/netherlist.git
sudo chown -R deploy:deploy /opt/netherlist
cd /opt/netherlist

# Backend setup
cd backend
cp .env.example .env
nano .env  # Configure production settings
npm ci --production
npm run build
npx prisma migrate deploy

# Frontend setup
cd ../frontend
cp .env.example .env
nano .env  # Configure production settings
npm ci --production
npm run build
```

### 4. Setup PM2 Process Manager

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /opt/netherlist/backend
pm2 start npm --name "netherlist-api" -- start

# Start frontend
cd /opt/netherlist/frontend
pm2 start npm --name "netherlist-web" -- start

# Configure PM2 to start on boot
pm2 startup
pm2 save

# Monitor processes
pm2 status
pm2 logs
```

### 5. Configure Nginx

Use the same Nginx configuration as in Docker deployment section, but proxy to:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:3000`

```bash
# Copy nginx config
sudo cp /opt/netherlist/nginx/nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Cloud Deployment

### AWS Deployment

#### Option 1: EC2 + RDS + ElastiCache

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04
   - Type: t3.medium (minimum)
   - Security Group: Allow 80, 443, 22

2. **Create RDS PostgreSQL Instance**
   - Engine: PostgreSQL 16
   - Instance: db.t3.micro (start small)
   - Multi-AZ: Yes (production)

3. **Create ElastiCache Redis**
   - Engine: Redis 7
   - Node: cache.t3.micro

4. **Deploy Application**
   - Follow Docker deployment steps
   - Update DATABASE_URL with RDS endpoint
   - Update REDIS_URL with ElastiCache endpoint

#### Option 2: ECS (Elastic Container Service)

```yaml
# ecs-task-definition.json
{
  "family": "netherlist",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ghcr.io/yourusername/netherlist-backend:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ]
    }
  ]
}
```

### DigitalOcean App Platform

1. **Create New App**
2. **Connect GitHub Repository**
3. **Configure Services**:
   - Backend: Node.js 20, Dockerfile
   - Frontend: Next.js, Dockerfile
   - Database: PostgreSQL managed database
   - Redis: Managed Redis

4. **Set Environment Variables** in UI

5. **Deploy** (automatic)

---

## Post-Deployment

### 1. Database Backup Setup

```bash
# Create backup script
sudo nano /opt/scripts/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose -f /opt/netherlist/docker-compose.prod.yml exec -T postgres \
  pg_dump -U netherlist netherlist_prod | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup Redis
docker-compose -f /opt/netherlist/docker-compose.prod.yml exec -T redis \
  redis-cli BGSAVE

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://netherlist-backups/

# Delete old backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /opt/scripts/backup-db.sh

# Add to crontab (daily at 3 AM)
sudo crontab -e
0 3 * * * /opt/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### 2. Monitoring Setup

```bash
# Install monitoring tools
npm install -g pm2

# Backend monitoring
cd /opt/netherlist
pm2 install pm2-logrotate

# Set up alerts (optional)
pm2 install pm2-slack

# Health check script
nano /opt/scripts/health-check.sh
```

```bash
#!/bin/bash
if curl -f https://api.netherlist.com/health > /dev/null 2>&1; then
    echo "Backend: OK"
else
    echo "Backend: FAILED"
    # Restart if needed
    cd /opt/netherlist
    docker-compose -f docker-compose.prod.yml restart backend
fi

if curl -f https://netherlist.com > /dev/null 2>&1; then
    echo "Frontend: OK"
else
    echo "Frontend: FAILED"
    docker-compose -f docker-compose.prod.yml restart frontend
fi
```

### 3. Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/netherlist
```

```
/opt/netherlist/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        docker-compose -f /opt/netherlist/docker-compose.prod.yml kill -s SIGUSR1 backend
    endscript
}
```

### 4. Security Hardening

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure fail2ban for nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
```

```bash
# Restart fail2ban
sudo systemctl restart fail2ban
```

---

## Monitoring

### Application Monitoring

**Option 1: Self-hosted (Prometheus + Grafana)**

```bash
# Add to docker-compose.prod.yml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
```

**Option 2: Cloud Services**
- **DataDog**: Full-stack monitoring
- **New Relic**: APM + Infrastructure
- **Sentry**: Error tracking
- **LogRocket**: Frontend monitoring

### Key Metrics to Monitor

```
Application:
- API response times
- Error rates
- Request volume
- Active users
- Transaction completion rate

Infrastructure:
- CPU usage
- Memory usage
- Disk usage
- Network I/O
- Database connections

Business:
- New listings/day
- Transactions/day
- User registrations
- Revenue (if applicable)
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check logs
docker-compose -f docker-compose.prod.yml logs postgres

# Verify connection string
docker-compose -f docker-compose.prod.yml exec backend printenv DATABASE_URL

# Test connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U netherlist -d netherlist_prod -c "SELECT 1"
```

#### 2. Frontend Not Loading

```bash
# Check frontend container
docker-compose -f docker-compose.prod.yml logs frontend

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec frontend printenv

# Rebuild frontend
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

#### 3. WebSocket Connection Issues

```bash
# Check nginx WebSocket configuration
sudo nginx -t

# Verify backend WebSocket server
docker-compose -f docker-compose.prod.yml exec backend node -e "console.log(require('./dist/index.js'))"

# Check firewall
sudo ufw status
```

#### 4. High Memory Usage

```bash
# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Scale down if needed
docker-compose -f docker-compose.prod.yml scale backend=1
```

### Emergency Procedures

#### Rollback Deployment

```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git log --oneline
git checkout PREVIOUS_COMMIT_HASH

# Rebuild and deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

#### Database Restore

```bash
# Stop application
docker-compose -f docker-compose.prod.yml down

# Restore from backup
gunzip -c /opt/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U netherlist -d netherlist_prod

# Start application
docker-compose -f docker-compose.prod.yml up -d
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor application logs
- Check error rates
- Verify backups completed

**Weekly**:
- Review performance metrics
- Update dependencies (security patches)
- Clean up old Docker images

**Monthly**:
- Review database performance
- Optimize slow queries
- Update documentation

### Update Procedure

```bash
# Pull latest code
cd /opt/netherlist
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Verify deployment
curl https://api.netherlist.com/health
```

---

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_items_search ON items USING GIN (to_tsvector('english', description));
CREATE INDEX idx_items_price_amount ON items(((price->>'amount')::numeric)) WHERE (price->>'type') = 'fiat';

-- Analyze tables
ANALYZE items;
ANALYZE transactions;
```

### 2. Redis Caching

```typescript
// Cache frequently accessed data
await redis.setex(`items:popular`, 300, JSON.stringify(popularItems));
```

### 3. CDN Setup

- Use Cloudflare for static assets
- Enable nginx gzip compression
- Configure browser caching

---

**End of Deployment Guide**
