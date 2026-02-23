# NetherList - Project Summary

**Complete API-First MVP Blueprint for Diablo II: Resurrected Trading Marketplace**

---

## 📋 Executive Summary

NetherList is a comprehensive trading platform for Diablo II: Resurrected items. This blueprint provides everything needed to build, deploy, and scale an MVP focusing on **speed, usability, and minimal friction**.

**Key Innovation**: Copy-paste item text from the game → automatic parsing → instant listing.

---

## 🎯 MVP Scope

### Core Features (Included)
✅ User authentication & profiles  
✅ Item listing via copy-paste from game  
✅ Automatic item text parser (Diablo II format)  
✅ Search & filter marketplace  
✅ Real-time chat between traders  
✅ Manual transaction confirmation system  
✅ Reputation & rating system  
✅ Battle.net whisper generator  
✅ Responsive web interface  

### Explicitly Out of Scope (MVP)
❌ Payment processing (manual only)  
❌ Automated escrow/timers  
❌ Mobile apps (web-first)  
❌ Advanced analytics dashboard  
❌ Multi-language support  
❌ Item price history/predictions  

---

## 📚 Documentation Structure

This blueprint contains **complete, production-ready documentation**:

### 1. [README.md](./README.md)
**Main project overview**
- Architecture diagram
- Technology stack
- Quick start guide
- Project structure
- Development workflow

### 2. [API_SPECIFICATION.md](./API_SPECIFICATION.md)
**Complete REST API documentation**
- All 25+ endpoints with full specs
- Request/response examples
- Authentication flow
- WebSocket events
- Error handling
- Rate limiting
- Real-world usage examples

**Endpoint Categories**:
- Authentication (4 endpoints)
- Items (7 endpoints)
- Transactions (7 endpoints)
- Messages (4 endpoints)
- Users & Reputation (3 endpoints)

### 3. [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
**PostgreSQL database design**
- Complete entity-relationship diagram
- 6 core tables + 1 materialized view
- Prisma schema (ready to use)
- Indexing strategy
- SQL triggers & functions
- Migration guide
- Sample queries
- Performance optimization

**Tables**:
- users
- items
- transactions
- messages
- ratings
- user_reputation

### 4. [ARCHITECTURE.md](./ARCHITECTURE.md)
**System architecture & design patterns**
- High-level architecture
- Component diagrams
- Data flow diagrams
- Design patterns (Repository, Service, Factory)
- Security architecture
- Caching strategy
- Real-time communication
- Scalability considerations
- Monitoring & observability

### 5. [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
**Production deployment guide**
- VPS deployment (DigitalOcean, Hetzner)
- Docker deployment
- Cloud deployment (AWS, GCP)
- SSL/HTTPS setup
- Database backups
- Monitoring setup
- Security hardening
- Troubleshooting guide
- Emergency procedures

### 6. [docs/SETUP.md](./docs/SETUP.md)
**Quick development setup**
- 5-minute Docker setup
- Manual setup guide
- Common commands
- Troubleshooting
- Development workflow

### 7. [docs/GOOGLE_AUTH_SETUP.md](./docs/GOOGLE_AUTH_SETUP.md) ⭐ **NEW**
**Google OAuth 2.0 configuration**
- Why Google OAuth? (no passwords, instant signup)
- Step-by-step Google Cloud Console setup
- Backend Passport.js configuration
- Frontend NextAuth.js setup
- Testing & troubleshooting
- Production deployment
- Security best practices
- **🇵🇱 Polski przewodnik:** [GOOGLE_AUTH_SETUP_PL.md](./docs/GOOGLE_AUTH_SETUP_PL.md)

### 8. Configuration Files
**Ready-to-use configs**
- `docker-compose.yml` (development)
- `docker-compose.prod.yml` (production)
- `backend/Dockerfile` (multi-stage)
- `frontend/Dockerfile` (multi-stage)
- `backend/package.json` (all dependencies)
- `frontend/package.json` (Next.js 14)
- `backend/tsconfig.json` (strict mode)
- `frontend/tsconfig.json` (Next.js optimized)
- `frontend/tailwind.config.ts` (Diablo theme)
- `backend/prisma/schema.prisma` (database)
- `.github/workflows/ci.yml` (CI pipeline)
- `.github/workflows/deploy.yml` (CD pipeline)

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.1+ | React framework (App Router) |
| **TypeScript** | 5.3+ | Type safety |
| **TailwindCSS** | 3.4+ | Styling |
| **shadcn/ui** | Latest | UI components |
| **TanStack Query** | 5.18+ | Server state management |
| **Zustand** | 4.5+ | Client state management |
| **React Hook Form** | 7.50+ | Forms |
| **Zod** | 3.22+ | Validation || **NextAuth.js** | 4.24+ | Google OAuth authentication || **Socket.io Client** | 4.6+ | WebSocket |
| **Axios** | 1.6+ | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20 LTS | Runtime |
| **Express** | 4.18+ | Web framework |
| **TypeScript** | 5.3+ | Type safety |
| **Prisma** | 5.9+ | ORM |
| **PostgreSQL** | 16+ | Database |
| **Redis** | 7+ | Cache & sessions |
| **Socket.io** | 4.6+ | WebSocket |
| **Passport.js** | 0.7+ | OAuth middleware |
| **Google OAuth 2.0** | Latest | Authentication (no passwords!) |
| **JWT** | 9.0+ | Session tokens |
| **Zod** | 3.22+ | Validation |
| **Winston** | 3.11+ | Logging |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy |
| **GitHub Actions** | CI/CD |
| **Let's Encrypt** | SSL certificates |

---

## 🏗️ Architecture Highlights

### API-First Design
```
Frontend (Next.js) ──HTTP/REST──► Backend (Express)
                   ◄──JSON────────┘
                   
                   ──WebSocket───► Backend (Socket.io)
                   ◄──Events──────┘
```

All business logic lives in the backend. Frontend is a pure consumer of the API.

### Data Flow: Item Listing
```
1. User copies item text from game (SHIFT+click)
2. Paste into form → Frontend calls POST /items/parse
3. Backend ItemParserService extracts structured data
4. Preview shown to user with auto-filled form
5. User adds price, description → POST /items
6. Validation → Database insert → Return listing
7. Item appears in marketplace immediately
```

### Transaction Flow
```
Buyer initiates → Chat begins → Trade in-game → Both confirm → Auto-complete → Rate → Update reputation
```

### Security Layers
1. HTTPS/TLS encryption
2. JWT authentication
3. Zod input validation
4. Rate limiting (100 req/15min)
5. CORS restrictions
6. Helmet.js security headers
7. XSS/CSRF protection
8. SQL injection prevention (Prisma)

---

## 📊 Database Design

### Core Relationships
```
users (1) ──── (N) items
users (1) ──── (N) transactions (buyer)
users (1) ──── (N) transactions (seller)
transactions (1) ──── (N) messages
transactions (1) ──── (N) ratings
users (1) ──── (1) user_reputation
```

### JSONB Flexibility
Items use JSONB for flexibility:
```json
{
  "name": "Enigma",
  "baseItem": "Mage Plate",
  "type": "runeword",
  "stats": [{ "name": "Defense", "value": "1250" }],
  "ethereal": true,
  "sockets": 3
}
```

Queryable with PostgreSQL JSONB operators:
```sql
WHERE itemData->>'type' = 'runeword'
  AND itemData->>'ethereal' = 'true'
```

---

## 🚀 Deployment Options

### Option 1: VPS + Docker (Recommended for MVP)
**Cost**: ~$12/month (DigitalOcean, Hetzner)  
**Complexity**: Low  
**Scalability**: Medium  
**Setup Time**: 30 minutes  

**Steps**:
1. Provision VPS (2 vCPU, 4GB RAM)
2. Install Docker & Docker Compose
3. Clone repository
4. Configure environment variables
5. Setup SSL (Let's Encrypt)
6. `docker-compose up -d`
7. Initialize database
8. Deploy ✅

### Option 2: Cloud (AWS/GCP)
**Cost**: ~$50-100/month  
**Complexity**: Medium  
**Scalability**: High  
**Setup Time**: 2-4 hours  

**AWS Stack**:
- EC2 (t3.medium)
- RDS PostgreSQL
- ElastiCache Redis
- S3 (static assets)
- CloudFront (CDN)
- Route 53 (DNS)

### Option 3: Platform-as-a-Service
**Examples**: Vercel (frontend) + Railway/Render (backend)  
**Cost**: ~$20-40/month  
**Complexity**: Very Low  
**Scalability**: Medium  
**Setup Time**: 15 minutes  

---

## 📈 Scaling Strategy

### Phase 1: Single Server (0-1,000 users)
```
Single VPS:
- Frontend (Next.js)
- Backend (Node.js)
- PostgreSQL
- Redis
- Nginx
```
**Cost**: $12-25/month

### Phase 2: Horizontal Scaling (1,000-10,000 users)
```
Load Balancer
├── Backend Instance 1
├── Backend Instance 2
└── Backend Instance 3

Managed Database (RDS/CloudSQL)
Managed Redis (ElastiCache/MemoryStore)
CDN (Cloudflare/CloudFront)
```
**Cost**: $100-300/month

### Phase 3: Microservices (10,000+ users)
```
API Gateway
├── Auth Service
├── Item Service
├── Transaction Service
├── Chat Service
└── Reputation Service

Database per service (optional)
Event Bus (RabbitMQ/Kafka)
Kubernetes orchestration
```
**Cost**: $500-1,000+/month

---

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Services, utilities
- **Integration Tests**: API endpoints
- **E2E Tests**: Full user flows

**Tools**: Jest, Supertest

### Frontend Testing
- **Unit Tests**: Components, hooks
- **Integration Tests**: Page flows
- **E2E Tests**: User journeys

**Tools**: Jest, React Testing Library, Playwright (future)

### CI/CD Pipeline
```
Push to GitHub
  ↓
Lint & Type Check
  ↓
Run Tests
  ↓
Build Docker Images
  ↓
Security Scan
  ↓
Deploy to Staging
  ↓
Automated Tests
  ↓
Deploy to Production
```

---

## 💰 Cost Estimation

### MVP (0-500 users)
| Service | Provider | Cost/month |
|---------|----------|------------|
| VPS | DigitalOcean | $12 |
| Domain | Namecheap | $1 |
| SSL | Let's Encrypt | Free |
| CDN | Cloudflare | Free |
| **Total** | | **~$13/month** |

### Growth (500-5,000 users)
| Service | Provider | Cost/month |
|---------|----------|------------|
| Compute | AWS EC2 (t3.medium) | $30 |
| Database | RDS (db.t3.small) | $25 |
| Cache | ElastiCache | $15 |
| Storage | S3 | $5 |
| CDN | CloudFront | $10 |
| Monitoring | DataDog | $15 |
| **Total** | | **~$100/month** |

---

## ⏱️ Development Timeline

### Week 1-2: Foundation
- ✅ Project setup (provided)
- ✅ Database schema (provided)
- ✅ API endpoints (spec provided)
- Implement authentication
- Implement item parser

### Week 3: Core Features
- Item CRUD operations
- Search & filtering
- Basic frontend UI

### Week 4: Transactions
- Transaction initiation
- Manual confirmation flow
- Status management

### Week 5: Communication
- Real-time chat (Socket.io)
- Message persistence
- Whisper generator

### Week 6: Polish & Launch
- Reputation system
- UI/UX improvements
- Testing & bug fixes
- Documentation
- Deployment to production
- **MVP LAUNCH** 🚀

**Total Time**: 6 weeks for 1-2 developers

---

## 🎯 Success Metrics

### Technical KPIs
- API response time < 200ms (p95)
- Uptime > 99.5%
- Error rate < 0.5%
- Page load time < 2s

### Business KPIs
- User registrations
- Listings created
- Transactions completed
- User retention (D7, D30)
- Time to list item < 60s

---

## 🔐 Security Checklist

### Pre-Launch
- [ ] All secrets in environment variables
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention
- [ ] CSRF tokens (if using cookies)
- [ ] Password hashing (bcrypt)
- [ ] JWT secret rotation plan

### Post-Launch
- [ ] Regular dependency updates
- [ ] Security audit (npm audit)
- [ ] Penetration testing
- [ ] Database backups automated
- [ ] Monitoring & alerts configured
- [ ] Incident response plan

---

## 🚦 Next Steps

### Immediate (Start Now)
1. **Setup Development Environment**
   ```bash
   git clone https://github.com/yourusername/netherlist.git
   cd netherlist
   docker-compose up -d
   ```

2. **Read Core Documentation**
   - API_SPECIFICATION.md
   - DATABASE_SCHEMA.md
   - ARCHITECTURE.md

3. **Implement Item Parser**
   - This is the most critical unique feature
   - Test with real D2R item text
   - Handle edge cases

### Week 1
1. Implement authentication endpoints
2. Create user registration/login UI
3. Setup Prisma and run migrations
4. Create basic layout components

### Week 2-6
Follow the development timeline above.

---

## 📞 Support & Resources

### Documentation
- **Main README**: System overview
- **API Spec**: Complete endpoint reference
- **Database Schema**: Data modeling
- **Architecture**: Design decisions
- **Deployment Guide**: Production deployment
- **Setup Guide**: Quick development start

### Community (Future)
- Discord: Real-time chat
- GitHub Discussions: Q&A
- GitHub Issues: Bug reports
- Documentation site: Full guides

### Learning Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [Socket.io Docs](https://socket.io/docs/)

---

## ✅ Deliverables Checklist

This blueprint includes:

### Documentation
- [x] Complete README with architecture
- [x] Full API specification (25+ endpoints)
- [x] Database schema with ERD
- [x] System architecture documentation
- [x] Deployment guide (VPS, Docker, Cloud)
- [x] Quick setup guide
- [x] This project summary

### Configuration Files
- [x] Docker Compose (dev & prod)
- [x] Dockerfiles (backend & frontend)
- [x] Environment variable templates
- [x] TypeScript configurations
- [x] Prisma schema
- [x] Tailwind configuration
- [x] Next.js configuration
- [x] Package.json files

### CI/CD
- [x] GitHub Actions CI workflow
- [x] GitHub Actions CD workflow
- [x] Automated testing pipeline
- [x] Docker image building
- [x] Security scanning

### Project Structure
- [x] Complete folder hierarchy
- [x] Recommended file organization
- [x] Path aliases configuration
- [x] .gitignore file

---

## 🎉 Conclusion

This blueprint provides **everything needed to build and deploy NetherList MVP**:

✅ Complete, production-ready architecture  
✅ Fully specified API (25+ endpoints)  
✅ Optimized database schema  
✅ Docker deployment setup  
✅ CI/CD pipelines  
✅ Security best practices  
✅ Scalability considerations  
✅ Cost optimization  

**A developer can start coding immediately** with this blueprint. All design decisions have been made, all specifications are complete, and all deployment paths are documented.

**Estimated time to MVP**: 6 weeks (1-2 developers)  
**Estimated cost (first year)**: $150-500  
**Time saved with this blueprint**: 2-3 weeks of planning and architecture

---

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ for the Diablo II: Resurrected community**

**Ready to build? Start with [docs/SETUP.md](./docs/SETUP.md)** 🚀
