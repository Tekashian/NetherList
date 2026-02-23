# NetherList - Complete Project Structure

```
NetherList/
│
├── README.md                          # Main project overview & documentation
├── PROJECT_SUMMARY.md                 # Executive summary (THIS IS YOUR STARTING POINT)
├── API_SPECIFICATION.md               # Complete API reference
├── DATABASE_SCHEMA.md                 # Database design & Prisma schema
├── ARCHITECTURE.md                    # System architecture & design patterns
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Development environment
├── docker-compose.prod.yml            # Production environment
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Continuous Integration pipeline
│       └── deploy.yml                 # Continuous Deployment pipeline
│
├── docs/
│   ├── SETUP.md                       # Quick setup guide (5-minute start)
│   ├── DEPLOYMENT.md                  # Production deployment guide
│   ├── GOOGLE_AUTH_SETUP.md           # Google OAuth 2.0 setup ⭐ NEW
│   ├── GOOGLE_AUTH_SETUP_PL.md        # Google OAuth setup (POLSKI) 🇵🇱 NEW
│   └── CONTRIBUTING.md                # Contribution guidelines (create later)
│
├── nginx/
│   ├── nginx.conf                     # Nginx reverse proxy configuration
│   └── ssl/                           # SSL certificates directory
│
├── backend/
│   ├── Dockerfile                     # Multi-stage Docker build
│   ├── .env.example                   # Environment variables template
│   ├── package.json                   # Dependencies & scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── .eslintrc.js                   # ESLint configuration (create)
│   ├── .prettierrc                    # Prettier configuration (create)
│   ├── jest.config.js                 # Jest test configuration (create)
│   ├── README.md                      # Backend-specific documentation
│   │
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   ├── seed.ts                    # Seed data script (create)
│   │   └── migrations/                # Database migrations (auto-generated)
│   │
│   ├── src/
│   │   ├── index.ts                   # Application entry point (create)
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts            # Prisma client setup (create)
│   │   │   ├── redis.ts               # Redis client setup (create)
│   │   │   ├── passport.ts            # Passport.js + Google OAuth (create)
│   │   │   └── env.ts                 # Environment variables (create)
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts               # Route aggregator (create)
│   │   │   ├── auth.routes.ts         # Google OAuth routes (create)
│   │   │   ├── items.routes.ts        # Item routes (create)
│   │   │   ├── transactions.routes.ts # Transaction routes (create)
│   │   │   ├── messages.routes.ts     # Message routes (create)
│   │   │   └── users.routes.ts        # User routes (create)
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts     # OAuth callback logic (create)
│   │   │   ├── items.controller.ts    # Item CRUD (create)
│   │   │   ├── transactions.controller.ts  # Transaction management (create)
│   │   │   ├── messages.controller.ts # Message handling (create)
│   │   │   └── users.controller.ts    # User management (create)
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts        # JWT tokens (create)
│   │   │   ├── itemParser.service.ts  # D2 item parser ⭐ CRITICAL (create)
│   │   │   ├── reputation.service.ts  # Reputation calculation (create)
│   │   │   └── websocket.service.ts   # Socket.io setup (create)
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verification (create)
│   │   │   ├── validation.middleware.ts    # Zod validation (create)
│   │   │   ├── errorHandler.middleware.ts  # Error handling (create)
│   │   │   └── rateLimiter.middleware.ts   # Rate limiting (create)
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.ts      # Auth schemas (create)
│   │   │   ├── item.validator.ts      # Item schemas (create)
│   │   │   └── transaction.validator.ts    # Transaction schemas (create)
│   │   │
│   │   ├── models/
│   │   │   └── types.ts               # TypeScript types (create)
│   │   │
│   │   └── utils/
│   │       ├── logger.ts              # Winston logger (create)
│   │       ├── errors.ts              # Custom errors (create)
│   │       └── helpers.ts             # Helper functions (create)
│   │
│   └── tests/
│       ├── unit/                      # Unit tests
│       ├── integration/               # Integration tests
│       └── e2e/                       # End-to-end tests
│
└── frontend/
    ├── Dockerfile                     # Multi-stage Docker build
    ├── .env.example                   # Environment variables template
    ├── package.json                   # Dependencies & scripts
    ├── tsconfig.json                  # TypeScript configuration
    ├── next.config.js                 # Next.js configuration
    ├── tailwind.config.ts             # Tailwind CSS configuration
    ├── postcss.config.js              # PostCSS configuration (create)
    ├── .eslintrc.js                   # ESLint configuration (create)
    ├── .prettierrc                    # Prettier configuration (create)
    ├── jest.config.js                 # Jest test configuration (create)
    ├── README.md                      # Frontend-specific documentation
    │
    ├── public/
    │   ├── favicon.ico                # Favicon (create)
    │   ├── images/                    # Static images
    │   └── fonts/                     # Custom fonts
    │
    ├── src/
    │   ├── app/                       # Next.js 14 App Router
    │   │   ├── layout.tsx             # Root layout (create)
    │   │   ├── page.tsx               # Home page / Marketplace (create)
    │   │   ├── globals.css            # Global styles (create)
    │   │   ├── providers.tsx          # React Query & other providers (create)
    │   │   │
│   │   │   ├── api/
│   │   │   │   └── auth/
│   │   │   │       └── [...nextauth]/
│   │   │   │           └── route.ts   # NextAuth Google OAuth (create)
│   │   │   │
│   │   │   ├── (auth)/                # Auth route group
│   │   │   │   └── login/
│   │   │   │       └── page.tsx       # Login with Google button (create)
    │   │   │
    │   │   ├── listings/              # Browse items
    │   │   │   ├── page.tsx           # Listings page (create)
    │   │   │   └── [id]/
    │   │   │       └── page.tsx       # Item detail page (create)
    │   │   │
    │   │   ├── create/                # Create listing
    │   │   │   └── page.tsx           # Create listing page ⭐ (create)
    │   │   │
    │   │   ├── dashboard/             # User dashboard
    │   │   │   ├── page.tsx           # Dashboard overview (create)
    │   │   │   ├── listings/
    │   │   │   │   └── page.tsx       # My listings (create)
    │   │   │   ├── transactions/
    │   │   │   │   └── page.tsx       # My transactions (create)
    │   │   │   └── settings/
    │   │   │       └── page.tsx       # Account settings (create)
    │   │   │
    │   │   ├── profile/               # User profiles
    │   │   │   └── [id]/
    │   │   │       └── page.tsx       # Public profile (create)
    │   │   │
    │   │   ├── messages/              # Chat interface
    │   │   │   └── page.tsx           # Messages page (create)
    │   │   │
    │   │   └── transaction/
    │   │       └── [id]/
    │   │           └── page.tsx       # Transaction detail (create)
    │   │
    │   ├── components/                # React components
    │   │   ├── ui/                    # shadcn/ui components
    │   │   │   ├── button.tsx         # (install via shadcn-ui CLI)
    │   │   │   ├── input.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── dropdown-menu.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── tabs.tsx
    │   │   │   ├── toast.tsx
    │   │   │   └── ...                # Add more as needed
    │   │   │
    │   │   ├── layout/
    │   │   │   ├── Header.tsx         # Main header (create)
    │   │   │   ├── Footer.tsx         # Footer (create)
    │   │   │   ├── Sidebar.tsx        # Sidebar navigation (create)
    │   │   │   └── Navigation.tsx     # Navigation component (create)
    │   │   ││   │   │   ├── auth/
│   │   │   │   ├── GoogleSignIn.tsx   # Google OAuth button ⭐ (create)
│   │   │   │   └── SignOutButton.tsx  # Sign out button (create)
│   │   │   │    │   │   ├── items/
    │   │   │   ├── ItemCard.tsx       # Item card component (create)
    │   │   │   ├── ItemForm.tsx       # Item creation form (create)
    │   │   │   ├── ItemFilters.tsx    # Search filters (create)
    │   │   │   ├── ItemParser.tsx     # Text parser interface ⭐ (create)
    │   │   │   └── ItemGrid.tsx       # Grid layout (create)
    │   │   │
    │   │   ├── transactions/
    │   │   │   ├── TransactionCard.tsx     # Transaction card (create)
    │   │   │   ├── ConfirmDialog.tsx       # Confirmation dialog (create)
    │   │   │   └── WhisperGenerator.tsx    # Battle.net whisper (create)
    │   │   │
    │   │   ├── chat/
    │   │   │   ├── ChatWidget.tsx     # Chat interface (create)
    │   │   │   ├── MessageList.tsx    # Message list (create)
    │   │   │   └── MessageInput.tsx   # Message input (create)
    │   │   │
    │   │   ├── reputation/
    │   │   │   ├── ReputationBadge.tsx     # Rep badge (create)
    │   │   │   ├── RatingForm.tsx          # Rating form (create)
    │   │   │   └── RatingDisplay.tsx       # Display ratings (create)
    │   │   │
    │   │   └── common/
    │   │       ├── LoadingSpinner.tsx # Loading state (create)
    │   │       ├── ErrorBoundary.tsx  # Error boundary (create)
    │   │       └── Pagination.tsx     # Pagination (create)
    │   │
    │   ├── lib/                       # Utilities
    │   │   ├── api.ts                 # API client (Axios) (create)
    │   │   ├── websocket.ts           # Socket.io client (create)
    │   │   ├── utils.ts               # Helper functions (create)
    │   │   └── validators.ts          # Zod schemas (create)
    │   │
    │   ├── hooks/                     # Custom React hooks
    │   │   ├── useAuth.ts             # Auth hook (create)
    │   │   ├── useItems.ts            # Items hook (create)
    │   │   ├── useTransactions.ts     # Transactions hook (create)
    │   │   ├── useChat.ts             # Chat hook (create)
    │   │   └── useWebSocket.ts        # WebSocket hook (create)
    │   │
    │   ├── store/                     # Zustand state management
    │   │   ├── authStore.ts           # Auth state (create)
    │   │   ├── chatStore.ts           # Chat state (create)
    │   │   └── notificationStore.ts   # Notifications (create)
    │   │
    │   ├── types/                     # TypeScript types
    │   │   ├── api.ts                 # API types (create)
    │   │   ├── items.ts               # Item types (create)
    │   │   └── user.ts                # User types (create)
    │   │
    │   └── utils/                     # Helper functions
    │       ├── formatters.ts          # Format utilities (create)
    │       └── constants.ts           # Constants (create)
    │
    └── tests/
        ├── components/                # Component tests
        ├── hooks/                     # Hook tests
        └── utils/                     # Utility tests
```

---

## 📝 File Creation Status

### ✅ CREATED (Ready to Use)
All configuration and documentation files are complete and ready:

**Documentation:**
- README.md
- PROJECT_SUMMARY.md
- API_SPECIFICATION.md
- DATABASE_SCHEMA.md
- ARCHITECTURE.md
- docs/SETUP.md
- docs/DEPLOYMENT.md
- docs/GOOGLE_AUTH_SETUP.md ⭐ **NEW**
- docs/GOOGLE_AUTH_SETUP_PL.md 🇵🇱 **NEW**
- backend/README.md
- frontend/README.md

**Configuration:**
- docker-compose.yml
- docker-compose.prod.yml
- backend/Dockerfile
- frontend/Dockerfile
- backend/.env.example
- frontend/.env.example
- backend/package.json
- frontend/package.json
- backend/tsconfig.json
- frontend/tsconfig.json
- backend/prisma/schema.prisma
- frontend/next.config.js
- frontend/tailwind.config.ts
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .gitignore

### 🔨 TO CREATE (Implementation Phase)
These files need to be created during development:

**Backend Core (Week 1-2):**
1. `backend/src/index.ts` - Express server setup
2. `backend/src/config/*` - Database, Redis, environment config
3. `backend/src/middleware/*` - Auth, validation, error handling
4. `backend/src/services/itemParser.service.ts` ⭐ **CRITICAL** - D2 parser
5. `backend/src/routes/*` - All route definitions

**Backend Business Logic (Week 2-3):**
6. `backend/src/controllers/*` - All controllers
7. `backend/src/services/*` - Auth, reputation, WebSocket services
8. `backend/src/validators/*` - Zod schemas
9. `backend/prisma/seed.ts` - Database seeding

**Frontend Foundation (Week 1-2):**
10. `frontend/src/app/layout.tsx` - Root layout
11. `frontend/src/app/page.tsx` - Homepage
12. `frontend/src/app/globals.css` - Global styles
13. `frontend/src/lib/api.ts` - API client
14. `frontend/src/components/ui/*` - Install via `npx shadcn-ui add`

**Frontend Pages (Week 3-4):**
15. All pages in `frontend/src/app/**/page.tsx`
16. `frontend/src/components/items/ItemParser.tsx` ⭐ **CRITICAL**
17. `frontend/src/components/chat/ChatWidget.tsx` - Real-time chat

**Frontend Components (Week 4-5):**
18. All components in `frontend/src/components/*`
19. Custom hooks in `frontend/src/hooks/*`
20. State management in `frontend/src/store/*`

**Testing (Week 5-6):**
21. Unit tests for backend services
22. Integration tests for API endpoints
23. Component tests for React components
24. E2E tests for critical flows

---

## 🚀 Development Order

### Phase 1: Setup (Day 1)
```bash
# 1. Clone & setup
git clone <your-repo>
cd netherlist

# 2. Setup Google OAuth (IMPORTANT!)
# Follow: docs/GOOGLE_AUTH_SETUP.md
# Get Client ID & Secret from Google Cloud Console

# 3. Start infrastructure
docker-compose up -d postgres redis

# 4. Setup backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### Phase 2: Backend (Week 1-2)
Priority order:
1. ⭐ Google OAuth setup (config/passport.ts + auth.routes.ts)
2. ⭐ `itemParser.service.ts` - Core feature
3. `items.controller.ts` + `items.routes.ts`
4. Middleware (auth, validation, error handling)

### Phase 3: Frontend (Week 2-3)
Priority order:
1. ⭐ NextAuth setup (app/api/auth/[...nextauth]/route.ts)
2. ⭐ Google Sign-In button component
3. ⭐ ItemParser component (paste → parse → preview)
4. ItemForm with parsed data
5. Item listing page

### Phase 4: Integration (Week 3-4)
1. Connect frontend to API
2. Implement transactions
3. Add chat functionality
4. Reputation system

### Phase 5: Polish (Week 5-6)
1. UI/UX improvements
2. Error handling
3. Loading states
4. Testing
5. Documentation
6. Deployment

---

## 🎯 Critical Files (Start Here)

If you're starting fresh, implement these in order:

1. **Google OAuth Setup** - See [docs/GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md) ⭐⭐⭐
2. **backend/src/config/passport.ts** - Passport + Google OAuth strategy
3. **backend/src/routes/auth.routes.ts** - OAuth callback routes
4. **frontend/src/app/api/auth/[...nextauth]/route.ts** - NextAuth config
5. **frontend/src/components/auth/GoogleSignIn.tsx** - Sign-in button
6. **backend/src/services/itemParser.service.ts** - D2 item text parser ⭐
7. **frontend/src/components/items/ItemParser.tsx** - Paste interface ⭐
8. **frontend/src/app/create/page.tsx** - Create listing page

**Steps 1-5** enable instant user authentication (no passwords!)  
**Steps 6-8** demonstrate the core value proposition of NetherList.

---

## 📦 Quick Commands

```bash
# Install shadcn/ui components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs

# Generate Prisma types
cd backend
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development
docker-compose up -d
```

---

**Start with PROJECT_SUMMARY.md → Then follow docs/SETUP.md → Begin coding!** 🚀
