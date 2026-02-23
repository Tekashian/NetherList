# Architecture Documentation - NetherList

## System Architecture Overview

NetherList is designed as a modern, scalable web application following microservices principles with an API-first approach.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Browser    │    │    Mobile    │    │   Desktop    │     │
│  │  (Next.js)   │    │   (Future)   │    │   (Future)   │     │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│         │                   │                    │              │
└─────────┼───────────────────┼────────────────────┼──────────────┘
          │                   │                    │
          │     HTTP/REST     │                    │
          │     WebSocket     │                    │
          └───────────────────┴────────────────────┘
                              │
         ┌────────────────────▼────────────────────┐
         │         REVERSE PROXY / LB               │
         │      (Nginx / Traefik / Cloudflare)      │
         └────────────────────┬────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         │                                          │
┌────────▼──────────┐                    ┌─────────▼─────────┐
│                   │                    │                   │
│  FRONTEND SERVER  │                    │   BACKEND API     │
│    (Next.js)      │◄───────────────────│   (Node.js)       │
│                   │      API Calls     │   (Express)       │
│  - SSR/SSG        │                    │                   │
│  - Client Routing │                    │  - REST API       │
│  - Static Assets  │                    │  - WebSocket      │
│                   │                    │  - Business Logic │
└───────────────────┘                    └─────────┬─────────┘
                                                   │
                              ┌────────────────────┼────────────────────┐
                              │                    │                    │
                    ┌─────────▼─────────┐ ┌───────▼──────┐  ┌─────────▼──────────┐
                    │                   │ │              │  │                    │
                    │   PostgreSQL      │ │    Redis     │  │   File Storage     │
                    │   (Primary DB)    │ │   (Cache)    │  │  (Avatars/Assets)  │
                    │                   │ │              │  │                    │
                    │  - Users          │ │ - Sessions   │  │  - S3 / Local      │
                    │  - Items          │ │ - Chat       │  │                    │
                    │  - Transactions   │ │ - Rate Limit │  │                    │
                    │  - Messages       │ └──────────────┘  └────────────────────┘
                    │  - Ratings        │
                    └───────────────────┘
```

---

## Component Architecture

### Frontend Architecture (Next.js)

```
┌───────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                       │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Pages    │  │ Components │  │  Layouts   │             │
│  │ (Routes)   │  │   (UI)     │  │            │             │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘             │
│         │               │                │                    │
└─────────┼───────────────┼────────────────┼────────────────────┘
          │               │                │
┌─────────▼───────────────▼────────────────▼────────────────────┐
│                      STATE MANAGEMENT                          │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐ │
│  │   Zustand    │     │ React Query  │     │   Context    │ │
│  │ (Global)     │     │ (Server)     │     │   (Local)    │ │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘ │
│         │                    │                     │          │
└─────────┼────────────────────┼─────────────────────┼──────────┘
          │                    │                     │
┌─────────▼────────────────────▼─────────────────────▼──────────┐
│                      DATA & SERVICES                           │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐ │
│  │  API Client  │     │  WebSocket   │     │    Hooks     │ │
│  │   (Axios)    │     │ (Socket.io)  │     │  (Custom)    │ │
│  └──────┬───────┘     └──────┬───────┘     └──────────────┘ │
│         │                    │                                │
└─────────┼────────────────────┼────────────────────────────────┘
          │                    │
          └────────────────────┴───► Backend API
```

### Backend Architecture (Node.js/Express)

```
┌───────────────────────────────────────────────────────────────┐
│                         API LAYER                              │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Routes  │→ │Middleware│→ │Validator │→ │Controller│     │
│  │          │  │          │  │  (Zod)   │  │          │     │
│  └──────────┘  └──────────┘  └──────────┘  └────┬─────┘     │
│                                                  │             │
└──────────────────────────────────────────────────┼─────────────┘
                                                   │
┌──────────────────────────────────────────────────▼─────────────┐
│                     BUSINESS LOGIC LAYER                        │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Auth      │  │Item Parser  │  │ Reputation  │          │
│  │  Service    │  │  Service    │  │  Service    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                 │                  │
└─────────┼────────────────┼─────────────────┼──────────────────┘
          │                │                 │
┌─────────▼────────────────▼─────────────────▼──────────────────┐
│                      DATA ACCESS LAYER                         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Prisma    │  │    Redis    │  │  WebSocket  │          │
│  │   Client    │  │   Client    │  │  (Socket.io)│          │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘          │
│         │                │                                    │
└─────────┼────────────────┼────────────────────────────────────┘
          │                │
          ▼                ▼
    PostgreSQL          Redis
```

---

## Design Patterns

### 1. Repository Pattern (Data Access)

```typescript
// Example: UserRepository
class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserDto): Promise<User> {
    return prisma.user.create({ data });
  }
}
```

### 2. Service Pattern (Business Logic)

```typescript
// Example: AuthService
class AuthService {
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError();
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedError();
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    return { user, token };
  }
}
```

### 3. Middleware Pattern (Request Processing)

```typescript
// Example: Authentication Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = await userRepository.findById(payload.id);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 4. Factory Pattern (Item Parser)

```typescript
// Example: Item Parser Factory
class ItemParserFactory {
  static getParser(type: ItemType): ItemParser {
    switch (type) {
      case 'runeword': return new RunewordParser();
      case 'unique': return new UniqueParser();
      case 'set': return new SetParser();
      default: return new GenericParser();
    }
  }
}
```

---

## Data Flow

### 1. User Creates Item Listing

```
User Input → Frontend
    │
    └─► Parse Item Text (Paste)
         │
         ├─► POST /api/v1/items/parse
         │    │
         │    └─► ItemParserService.parse()
         │         │
         │         └─► Return structured JSON
         │
         ├─► Display Parsed Data (Preview)
         │
         └─► Submit Listing
              │
              └─► POST /api/v1/items
                   │
                   ├─► Validate (Zod)
                   ├─► ItemController.create()
                   ├─► ItemService.createListing()
                   ├─► Database Insert
                   └─► Return Created Item
```

### 2. Transaction Flow

```
Buyer Initiates → POST /api/v1/transactions
    │
    ├─► Create Transaction (status: pending)
    ├─► Generate Whisper Message
    ├─► Send Notification to Seller
    └─► Return Transaction Object
         │
Buyer & Seller Chat (WebSocket)
    │
    ├─► socket.emit('send_message')
    ├─► Save to Database
    └─► socket.broadcast('new_message')
         │
Trade In-Game
    │
Buyer Confirms → PATCH /api/v1/transactions/:id/confirm/buyer
    │             └─► Set buyerConfirmed = true
    │
Seller Confirms → PATCH /api/v1/transactions/:id/confirm/seller
    │              └─► Set sellerConfirmed = true
    │
Both Confirmed?
    │
    └─► Auto-update status to 'completed'
    └─► Update item status to 'sold'
    └─► Trigger reputation update
         │
Rate Each Other → POST /api/v1/ratings
    │              └─► Update UserReputation
    │
Transaction Complete ✅
```

---

## Security Architecture

### 1. Authentication & Authorization

```
┌─────────────────────────────────────────────┐
│          Authentication Flow                 │
├─────────────────────────────────────────────┤
│                                              │
│  1. User Login (email + password)           │
│     ↓                                        │
│  2. Verify Credentials (bcrypt)             │
│     ↓                                        │
│  3. Generate JWT Token                      │
│     ↓                                        │
│  4. Return Token to Client                  │
│     ↓                                        │
│  5. Client Stores Token (localStorage)      │
│     ↓                                        │
│  6. Include Token in Headers                │
│     ↓                                        │
│  7. Backend Verifies Token (Middleware)     │
│     ↓                                        │
│  8. Attach User to Request                  │
│     ↓                                        │
│  9. Check Permissions                       │
│     ↓                                        │
│  10. Allow/Deny Access                      │
│                                              │
└─────────────────────────────────────────────┘
```

### 2. Security Layers

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **Transport** | HTTPS/TLS | SSL certificates (Let's Encrypt) |
| **Headers** | Security headers | Helmet.js middleware |
| **CORS** | Origin restriction | CORS middleware (whitelist) |
| **Input** | Validation | Zod schemas |
| **Injection** | SQL injection | Prisma ORM (parameterized queries) |
| **XSS** | Cross-site scripting | Input sanitization, CSP headers |
| **CSRF** | Cross-site request forgery | SameSite cookies, CSRF tokens |
| **Rate Limit** | DoS protection | express-rate-limit |
| **Auth** | JWT validation | JWT middleware |
| **Secrets** | Environment vars | .env files, never committed |

---

## Caching Strategy

### 1. Redis Caching Layers

```typescript
// Cache Structure
{
  // User Sessions
  'session:{userId}': { ...sessionData },
  
  // Rate Limiting
  'ratelimit:{ip}:{endpoint}': count,
  
  // Item Listings (short TTL)
  'items:list:{filters}': { items: [...], ttl: 60 },
  
  // User Reputation (medium TTL)
  'reputation:{userId}': { score, ratings, ttl: 300 },
  
  // Chat Messages (temporary)
  'chat:{transactionId}': [ ...messages ],
}
```

### 2. Cache Invalidation

```typescript
// When item is updated
await redis.del(`items:list:*`); // Wildcard delete
await redis.del(`item:${itemId}`);

// When reputation changes
await redis.del(`reputation:${userId}`);
```

### 3. React Query Caching (Frontend)

```typescript
// Automatic caching with staleTime
const { data } = useQuery({
  queryKey: ['items', filters],
  queryFn: () => fetchItems(filters),
  staleTime: 1000 * 60 * 5, // 5 minutes
  cacheTime: 1000 * 60 * 10, // 10 minutes
});
```

---

## Real-time Communication

### WebSocket Architecture

```
┌─────────────────────────────────────────────┐
│         Socket.io Architecture               │
├─────────────────────────────────────────────┤
│                                              │
│  Client                    Server            │
│    │                         │               │
│    ├─► Connect              │               │
│    │                         │               │
│    ├─► Authenticate(token) ─┤               │
│    │                         ├─► Verify JWT │
│    │                         ├─► Join rooms │
│    │                         │               │
│    ├─► join_transaction ────┤               │
│    │                         ├─► Join room  │
│    │                         │               │
│    ├─► send_message ────────┤               │
│    │                         ├─► Save DB    │
│    │                         ├─► Broadcast  │
│    │◄── new_message ─────────┤               │
│    │                         │               │
│    ├─► typing ──────────────┤               │
│    │◄── user_typing ─────────┤               │
│    │                         │               │
│    │◄── transaction_update ──┤               │
│    │                         │               │
│    ├─► Disconnect           │               │
│    │                         ├─► Leave rooms│
│                                              │
└─────────────────────────────────────────────┘
```

### Socket.io Rooms

```typescript
// Join transaction room
socket.join(`transaction:${transactionId}`);

// Broadcast to room
io.to(`transaction:${transactionId}`).emit('new_message', message);

// User-specific notifications
io.to(`user:${userId}`).emit('notification', notification);
```

---

## Scalability Considerations

### Horizontal Scaling

```
┌───────────────────────────────────────────────┐
│          Load Balancer (Nginx/HAProxy)        │
└────────────────┬──────────────────────────────┘
                 │
      ┌──────────┼──────────┬──────────┐
      │          │           │          │
┌─────▼────┐ ┌──▼──────┐ ┌─▼────────┐ │
│ Backend  │ │Backend  │ │ Backend  │ │
│Instance 1│ │Instance2│ │Instance 3│ │
└────┬─────┘ └────┬────┘ └────┬─────┘ │
     │            │            │        │
     └────────────┴────────────┴────────┘
                  │
         ┌────────┴─────────┐
         │                  │
    ┌────▼─────┐      ┌────▼────┐
    │PostgreSQL│      │  Redis  │
    │ (Primary)│      │(Cluster)│
    └──────────┘      └─────────┘
```

### Database Scaling

**Read Replicas**:
```
Primary (Write) → Replica 1 (Read)
                → Replica 2 (Read)
                → Replica 3 (Read)
```

**Connection Pooling**:
```typescript
// PgBouncer configuration
const DATABASE_URL = "postgresql://user:pass@pgbouncer:6432/db?pgbouncer=true";
```

### Caching Strategy for Scale

1. **Application-level**: Redis caching
2. **Database-level**: Query result caching
3. **CDN**: Static assets (images, CSS, JS)
4. **Edge caching**: Cloudflare/Fastly

---

## Monitoring & Observability

### Metrics to Track

```
Application Metrics:
├── API Response Times (p50, p95, p99)
├── Error Rates (4xx, 5xx)
├── Request Volume (req/s)
├── Active Users
└── Database Query Performance

Infrastructure Metrics:
├── CPU Usage
├── Memory Usage
├── Disk I/O
├── Network I/O
└── Container Health

Business Metrics:
├── New Listings Created
├── Transactions Completed
├── Active Users (DAU/MAU)
├── Average Transaction Time
└── User Retention Rate
```

### Logging Strategy

```typescript
// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Structured logging
logger.info('User created listing', {
  userId: user.id,
  itemId: item.id,
  itemType: item.type,
  timestamp: new Date(),
});
```

---

## Disaster Recovery

### Backup Strategy

```
Daily Backups:
├── Database (PostgreSQL dump)
├── Redis snapshots (RDB)
└── User uploads (S3 versioning)

Retention:
├── Daily: Keep 7 days
├── Weekly: Keep 4 weeks
└── Monthly: Keep 12 months
```

### Recovery Procedures

1. **Database Restore**:
   ```bash
   pg_restore -d database_name backup_file.sql
   ```

2. **Redis Restore**:
   ```bash
   redis-cli --rdb dump.rdb
   ```

3. **Application Rollback**:
   ```bash
   kubectl rollout undo deployment/backend
   ```

---

## Future Enhancements

### Phase 2 Features
- Payment integration (Stripe/PayPal)
- Automated price suggestions (ML)
- Advanced search with Elasticsearch
- Mobile applications (React Native)
- Admin dashboard

### Phase 3 Features
- Auction system
- Live trading sessions
- API rate limiting tiers
- Webhook notifications
- Public API for third parties

---

## Technology Decision Rationale

| Choice | Reasons |
|--------|---------|
| **Next.js** | SSR/SSG, great DX, API routes, image optimization |
| **Node.js** | JavaScript everywhere, NPM ecosystem, async I/O |
| **TypeScript** | Type safety, better IDE support, catches errors early |
| **PostgreSQL** | ACID compliance, JSONB support, robust |
| **Redis** | Fast caching, pub/sub, session storage |
| **Prisma** | Type-safe ORM, migrations, great DX |
| **Socket.io** | Reliable WebSocket, fallbacks, rooms |
| **Docker** | Consistency, portability, easy deployment |

---

**End of Architecture Documentation**
