# NetherList - Diablo II: Resurrected Trading Marketplace

## 🎯 Project Overview

NetherList is an API-first trading marketplace for Diablo II: Resurrected items. The platform enables players to:
- List items by copying in-game descriptions (SHIFT+click → paste)
- Automatically parse item text into structured data
- Browse and search available items
- Communicate via integrated chat
- Build reputation through completed trades
- Generate Battle.net whisper messages

**MVP Focus**: Speed, usability, and minimal friction. No payment processing—transactions are confirmed manually by both parties.

---

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Technology Stack](#technology-stack)
3. [Quick Start](#quick-start)
4. [Project Structure](#project-structure)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Development](#development)
8. [Deployment](#deployment)
9. [Contributing](#contributing)

---

## 🏗️ Architecture

**API-First Design**: Backend exposes RESTful API; frontend consumes it.

```
┌─────────────────┐
│   Next.js App   │ ← Users interact here
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│   Node.js API   │ ← Business logic + item parser
│   (Backend)     │
└────────┬────────┘
         │
    ┏────┴────┬───────────┐
    ▼         ▼           ▼
┌────────┐ ┌──────┐ ┌─────────┐
│Postgres│ │Redis │ │ Auth    │
│  DB    │ │Cache │ │ Service │
└────────┘ └──────┘ └─────────┘
```

**Components**:
- **Frontend**: Next.js 14+ (App Router), React, TailwindCSS, TypeScript
- **Backend**: Node.js (Express), TypeScript, Zod validation
- **Database**: PostgreSQL 16+
- **Cache/Chat**: Redis 7+
- **Auth**: Google OAuth 2.0 + JWT
- **Deployment**: Docker, docker-compose, GitHub Actions

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14+ (React 18)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Auth**: NextAuth.js (Google OAuth)
- **Real-time**: Socket.io-client (chat)

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **ORM**: Prisma
- **Auth**: Google OAuth 2.0 + Passport.js + JWT
- **Real-time**: Socket.io (chat)
- **Testing**: Jest + Supertest

### Infrastructure
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Containerization**: Docker + docker-compose
- **CI/CD**: GitHub Actions
- **Hosting**: VPS (DigitalOcean/Hetzner) or AWS/GCP

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/netherlist.git
cd netherlist
```

### 2. Environment Setup

**IMPORTANT:** Setup Google OAuth first!
- 🇬🇧 English: See [docs/GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md)
- 🇵🇱 Polski: Zobacz [docs/GOOGLE_AUTH_SETUP_PL.md](docs/GOOGLE_AUTH_SETUP_PL.md)

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your Google OAuth credentials

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with Google OAuth credentials
```

### 3. Start with Docker
```bash
docker-compose up -d
```

**Services**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 4. Initialize Database
```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

### 5. Access the Application
Open http://localhost:3000

---

## 📁 Project Structure

```
NetherList/
├── README.md                      # This file
├── API_SPECIFICATION.md           # Complete API documentation
├── DATABASE_SCHEMA.md             # Database design & ERD
├── ARCHITECTURE.md                # System architecture details
├── docker-compose.yml             # Multi-container setup
├── .github/
│   └── workflows/
│       ├── ci.yml                # CI pipeline
│       └── deploy.yml            # CD pipeline
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.ts               # Seed data
│   ├── src/
│   │   ├── index.ts              # App entry point
│   │   ├── config/               # Configuration
│   │   ├── routes/               # Express routes
│   │   ├── controllers/          # Business logic
│   │   ├── services/             # Core services
│   │   │   ├── itemParser.ts    # Item text parser
│   │   │   ├── auth.ts          # Authentication
│   │   │   └── reputation.ts    # Reputation system
│   │   ├── middleware/           # Express middleware
│   │   ├── models/               # Type definitions
│   │   ├── utils/                # Helpers
│   │   └── validators/           # Zod schemas
│   └── tests/
├── frontend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── public/
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Home/marketplace
│   │   │   ├── listings/         # Browse listings
│   │   │   ├── create/           # Create listing
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── profile/          # User profile
│   │   │   ├── messages/         # Chat interface
│   │   │   └── api/              # API routes (if needed)
│   │   ├── components/           # React components
│   │   │   ├── ui/               # shadcn components
│   │   │   ├── ItemCard.tsx
│   │   │   ├── ItemForm.tsx
│   │   │   ├── ChatWidget.tsx
│   │   │   └── ReputationBadge.tsx
│   │   ├── lib/                  # Utilities
│   │   │   ├── api.ts            # API client
│   │   │   └── utils.ts
│   │   ├── hooks/                # Custom hooks
│   │   └── types/                # TypeScript types
│   └── tests/
└── docs/
    ├── SETUP.md                  # Detailed setup guide
    ├── DEPLOYMENT.md             # Deployment instructions
    └── CONTRIBUTING.md           # Contribution guidelines
```

---

## 📡 API Documentation

See [API_SPECIFICATION.md](./API_SPECIFICATION.md) for complete API documentation.

**Base URL**: `http://localhost:4000/api/v1`

**Key Endpoints**:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /items/parse` - Parse item text → JSON
- `POST /items` - Create listing
- `GET /items` - Search/filter items
- `POST /transactions` - Initiate transaction
- `PATCH /transactions/:id/confirm` - Confirm transaction
- `POST /messages` - Send chat message
- `GET /users/:id/reputation` - Get user reputation

---

## 🗄️ Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema.

**Core Tables**:
- `users` - User accounts
- `items` - Item listings
- `transactions` - Trade records
- `messages` - Chat messages
- `ratings` - User ratings
- `item_stats` - Item statistics (normalized)

---

## 💻 Development

### Backend Development
```bash
cd backend
npm install
npm run dev          # Start dev server with hot reload
npm run test         # Run tests
npm run lint         # Lint code
npm run prisma:studio # Database GUI
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
```

### Database Management
```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate dev --name migration_name

# Reset database
npm run prisma:migrate reset

# Open Prisma Studio
npm run prisma:studio
```

---

## 🚢 Deployment

### Production Build
```bash
# Build both services
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD with GitHub Actions
- **CI**: Runs on every push/PR (lint, test, build)
- **CD**: Deploys to production on merge to `main`

See [.github/workflows/](./.github/workflows/) for configurations.

### Environment Variables

**Backend** (required):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - API server port (default: 4000)

**Frontend** (required):
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL for chat

---

## 🎯 MVP Roadmap

### Phase 1: Core Functionality (Week 1-2)
- ✅ Project setup & infrastructure
- ✅ User authentication
- ✅ Item parser service
- ✅ CRUD for item listings
- ✅ Basic search/filter

### Phase 2: Transactions (Week 3)
- ✅ Transaction initiation
- ✅ Manual confirmation flow
- ✅ Reputation system
- ✅ Rating system

### Phase 3: Communication (Week 4)
- ✅ Real-time chat
- ✅ Whisper message generator
- ✅ Notifications

### Phase 4: Polish & Launch (Week 5-6)
- ✅ UI/UX improvements
- ✅ Performance optimization
- ✅ Testing & bug fixes
- ✅ Documentation
- ✅ Deployment

---

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🔗 Links

- **Documentation**: [/docs](/docs)
- **API Spec**: [API_SPECIFICATION.md](./API_SPECIFICATION.md)
- **Database Schema**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## 📧 Support

For questions or issues:
- Create an issue on GitHub
- Join our Discord: [discord.gg/netherlist](#)
- Email: support@netherlist.com

---

**Built with ❤️ for the Diablo II: Resurrected community**
