# Quick Setup Guide - NetherList

Get NetherList running locally in under 5 minutes.

---

## Prerequisites

- Docker & Docker Compose installed
- Git installed
- 8GB RAM available

---

## Quick Start (Docker)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/netherlist.git
cd netherlist

# 2. Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# 5. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# API Health: http://localhost:4000/health
```

That's it! You're ready to develop.

---

## Manual Setup (Without Docker)

### 1. Install Dependencies

**Required Software**:
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb netherlist_dev

# Or using psql
psql -U postgres
CREATE DATABASE netherlist_dev;
\q
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Update DATABASE_URL, REDIS_URL, etc.

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Backend running at: http://localhost:4000

### 4. Setup Frontend

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Update API_URL

# Start development server
npm run dev
```

Frontend running at: http://localhost:3000

---

## Verify Installation

### 1. Check Backend

```bash
# Health check
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 2. Check Frontend

Open http://localhost:3000 in your browser.

### 3. Test API

```bash
# Register a user
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Development Workflow

### Backend Development

```bash
cd backend

# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Frontend Development

```bash
cd frontend

# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

---

## Common Commands

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Execute command in container
docker-compose exec backend npm run prisma:studio
```

### Database

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open database GUI
npx prisma studio
```

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests (future)
npm run test:e2e
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -ti:4000  # Backend
lsof -ti:3000  # Frontend

# Kill process
kill -9 $(lsof -ti:4000)
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Or with Docker
docker-compose ps postgres
docker-compose logs postgres
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping

# Or with Docker
docker-compose ps redis
docker-compose logs redis
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
npx prisma generate

# If still failing, delete and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

---

## Next Steps

1. **Read Documentation**:
   - [README.md](../README.md) - Project overview
   - [API_SPECIFICATION.md](../API_SPECIFICATION.md) - API endpoints
   - [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) - Database design
   - [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture

2. **Explore Code**:
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`

3. **Create Your First Feature**:
   - Add a new API endpoint
   - Create a new React component
   - Write tests

4. **Join Community**:
   - Discord: [discord.gg/netherlist](#)
   - GitHub Discussions: [github.com/netherlist/discussions](#)

---

## Default Credentials (Development)

After running `npx prisma db seed`:

**User 1**:
- Username: `trader_pro`
- Email: `trader@example.com`
- Password: `password123`

**User 2**:
- Username: `rune_collector`
- Email: `runes@example.com`
- Password: `password123`

---

## Useful Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs (future)
- **Prisma Studio**: http://localhost:5555 (when running `npx prisma studio`)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## Need Help?

- 📖 Read the [full documentation](../README.md)
- 🐛 Found a bug? [Create an issue](https://github.com/yourusername/netherlist/issues)
- 💬 Questions? [Join Discord](#) or [GitHub Discussions](#)
- 📧 Email: dev@netherlist.com

---

**Happy Coding! 🎮**
