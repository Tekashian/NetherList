# NetherList Backend API

Node.js + Express + TypeScript API for the NetherList trading platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Access API at http://localhost:4000
# Health check: http://localhost:4000/health
# API docs: http://localhost:4000/api-docs
```

### Building

```bash
# Compile TypeScript to JavaScript
npm run build

# Run production build
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── config/
│   │   ├── database.ts          # Prisma client setup
│   │   ├── redis.ts             # Redis client setup
│   │   └── env.ts               # Environment variables
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── auth.routes.ts       # Authentication routes
│   │   ├── items.routes.ts      # Item routes
│   │   ├── transactions.routes.ts
│   │   ├── messages.routes.ts
│   │   └── users.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts   # Auth logic
│   │   ├── items.controller.ts  # Item CRUD
│   │   ├── transactions.controller.ts
│   │   ├── messages.controller.ts
│   │   └── users.controller.ts
│   ├── services/
│   │   ├── auth.service.ts      # JWT & bcrypt
│   │   ├── itemParser.service.ts # D2 item parser
│   │   ├── reputation.service.ts # Reputation calculation
│   │   └── websocket.service.ts  # Socket.io
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── validation.middleware.ts # Zod validation
│   │   ├── errorHandler.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── item.validator.ts
│   │   └── transaction.validator.ts
│   ├── models/
│   │   └── types.ts             # TypeScript types
│   └── utils/
│       ├── logger.ts            # Winston logger
│       ├── errors.ts            # Custom errors
│       └── helpers.ts
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Seed data
│   └── migrations/              # Migration files
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run type-check` | Type check without emitting files |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ci` | Run tests with coverage for CI |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create and apply migration |
| `npm run prisma:deploy` | Apply migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:seed` | Seed database |

## 🔑 Environment Variables

See `.env.example` for all available variables.

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - API server port

**Optional**:
- `CORS_ORIGIN` - Allowed CORS origins
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `NODE_ENV` - Environment (development, production, test)

## 📡 API Endpoints

See [API_SPECIFICATION.md](../API_SPECIFICATION.md) for complete API documentation.

**Base URL**: `http://localhost:4000/api/v1`

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `PATCH /auth/profile` - Update profile

### Items
- `POST /items/parse` - Parse item text
- `POST /items` - Create listing
- `GET /items` - Search items
- `GET /items/:id` - Get item
- `PATCH /items/:id` - Update item
- `DELETE /items/:id` - Delete item

### Transactions
- `POST /transactions` - Initiate transaction
- `GET /transactions/:id` - Get transaction
- `PATCH /transactions/:id/confirm/buyer` - Buyer confirms
- `PATCH /transactions/:id/confirm/seller` - Seller confirms
- `PATCH /transactions/:id/report` - Report problem
- `DELETE /transactions/:id` - Cancel transaction

### Messages
- `POST /messages` - Send message
- `GET /transactions/:id/messages` - Get messages
- `PATCH /messages/read` - Mark as read
- `GET /messages/unread/count` - Unread count

### Users & Reputation
- `GET /users/:id` - Get user profile
- `GET /users/:id/reputation` - Get reputation
- `POST /ratings` - Rate user

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:ci

# Run specific test file
npm test -- auth.test.ts

# Watch mode
npm run test:watch
```

## 🔒 Security

- JWT authentication with bcrypt password hashing
- Rate limiting on all endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation with Zod
- SQL injection protection via Prisma ORM

## 📊 Database

### Migrations

```bash
# Create a new migration
npm run prisma:migrate -- --name migration_name

# Apply migrations
npm run prisma:deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Prisma Studio

```bash
# Open database GUI
npm run prisma:studio
```

## 🐛 Debugging

### VSCode Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## 📝 Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Follow Airbnb style guide
- Use path aliases (@config, @services, etc.)

## 🚀 Deployment

See [DEPLOYMENT.md](../docs/DEPLOYMENT.md) for deployment instructions.

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Socket.io](https://socket.io/)
