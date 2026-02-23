# Database Schema - NetherList

**Database**: PostgreSQL 16+  
**ORM**: Prisma  
**Migrations**: Prisma Migrate

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables](#tables)
4. [Indexes](#indexes)
5. [Constraints](#constraints)
6. [Prisma Schema](#prisma-schema)
7. [Sample Queries](#sample-queries)

---

## Overview

The database is designed for high read performance with proper indexing on frequently queried fields. JSONB columns are used for flexible item data storage while maintaining queryability.

**Design Principles**:
- Normalized structure for core entities
- JSONB for flexible item stats
- Composite indexes for common queries
- Soft deletes for items (status field)
- Timestamps on all tables

---

## Entity Relationship Diagram

```
┌─────────────┐           ┌──────────────┐
│    users    │───────────│    items     │
│             │   1:N     │              │
│ - id (PK)   │           │ - id (PK)    │
│ - username  │           │ - userId (FK)│
│ - email     │           │ - itemData   │
│ - googleId  │           │ - price      │
│ - avatar    │           │ - status     │
│ - battleTag │           │              │
└──────┬──────┘           └──────┬───────┘
       │                         │
       │                         │
       │                         │ 1:N
       │                  ┌──────▼────────────┐
       │                  │  transactions     │
       │      ┌───────────│                   │
       │      │   N:1     │ - id (PK)         │
       │      │           │ - itemId (FK)     │
       │      │           │ - buyerId (FK)    │
       │      │           │ - sellerId (FK)   │
       │      │           │ - status          │
       │      │           │ - buyerConfirmed  │
       │      │           │ - sellerConfirmed │
       │      │           └──────┬────────────┘
       │      │                  │
       │      │                  │ 1:N
       │      │           ┌──────▼──────────┐
       │      │           │    messages     │
       │      └───────────│                 │
       │          N:1     │ - id (PK)       │
       │                  │ - transactionId │
       │                  │ - senderId (FK) │
       │                  │ - content       │
       │                  │ - read          │
       │                  └─────────────────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│     ratings     │
│                 │
│ - id (PK)       │
│ - transactionId │
│ - raterId (FK)  │
│ - ratedUserId   │
│ - rating (1-5)  │
│ - comment       │
└─────────────────┘
```

---

## Tables

### 1. users

Stores user account information (authenticated via Google OAuth 2.0).

| Column        | Type         | Constraints                    | Description                        |
|---------------|--------------|--------------------------------|------------------------------------|
| id            | UUID         | PRIMARY KEY, DEFAULT uuid_v4() | User identifier                    |
| username      | VARCHAR(20)  | UNIQUE, NOT NULL               | Display name (unique)              |
| email         | VARCHAR(255) | UNIQUE, NOT NULL               | Email from Google account          |
| googleId      | VARCHAR(255) | UNIQUE, NOT NULL               | Google OAuth user ID               |
| avatar        | TEXT         | NULL                           | Google profile picture URL         |
| battleTag     | VARCHAR(50)  | NULL                           | Battle.net tag (e.g., Player#1234) |
| avatar        | TEXT         | NULL                           | Avatar URL                         |
| bio           | TEXT         | NULL                           | User biography                     |
| createdAt     | TIMESTAMP    | DEFAULT NOW()                  | Account creation time              |
| updatedAt     | TIMESTAMP    | DEFAULT NOW()                  | Last update time                   |

**Indexes**:
- `idx_users_email` on `email`
- `idx_users_username` on `username`

---

### 2. items

Stores item listings with structured and raw data.

| Column      | Type         | Constraints                    | Description                           |
|-------------|--------------|--------------------------------|---------------------------------------|
| id          | UUID         | PRIMARY KEY, DEFAULT uuid_v4() | Item listing identifier               |
| userId      | UUID         | NOT NULL, FK → users.id        | Owner of the listing                  |
| itemData    | JSONB        | NOT NULL                       | Structured item data (parsed)         |
| price       | JSONB        | NOT NULL                       | Price object (fiat/crypto/barter)     |
| description | TEXT         | NULL                           | User description                      |
| realm       | VARCHAR(20)  | NOT NULL                       | Americas/Europe/Asia                  |
| gameMode    | VARCHAR(30)  | NOT NULL                       | Softcore/Hardcore/Ladder variants     |
| rawText     | TEXT         | NOT NULL                       | Original copied text from game        |
| status      | VARCHAR(20)  | NOT NULL, DEFAULT 'active'     | active/sold/deleted                   |
| views       | INTEGER      | DEFAULT 0                      | View count                            |
| createdAt   | TIMESTAMP    | DEFAULT NOW()                  | Listing creation time                 |
| updatedAt   | TIMESTAMP    | DEFAULT NOW()                  | Last update time                      |

**itemData JSONB Structure**:
```json
{
  "name": "string",
  "baseItem": "string",
  "type": "runeword|unique|set|rare|magic|normal",
  "runes": ["string"],
  "ethereal": boolean,
  "sockets": number,
  "stats": [
    {
      "name": "string",
      "value": "string",
      "variable": boolean
    }
  ],
  "quality": "string"
}
```

**price JSONB Structure**:
```json
// Fiat
{
  "type": "fiat",
  "amount": number,
  "currency": "USD|EUR|GBP"
}

// Crypto
{
  "type": "crypto",
  "amount": number,
  "currency": "BTC|ETH"
}

// Barter
{
  "type": "barter",
  "description": "string"
}
```

**Indexes**:
- `idx_items_userId` on `userId`
- `idx_items_status` on `status`
- `idx_items_createdAt` on `createdAt DESC`
- `idx_items_realm_gameMode` on `(realm, gameMode)`
- `idx_items_itemData_type` on `((itemData->>'type'))`
- `idx_items_itemData_name` on `((itemData->>'name'))`
- `idx_items_price_amount` on `((price->>'amount'))` (for fiat sorting)

---

### 3. transactions

Records trade transactions between users.

| Column           | Type         | Constraints                       | Description                          |
|------------------|--------------|-----------------------------------|--------------------------------------|
| id               | UUID         | PRIMARY KEY, DEFAULT uuid_v4()    | Transaction identifier               |
| itemId           | UUID         | NOT NULL, FK → items.id           | Item being traded                    |
| buyerId          | UUID         | NOT NULL, FK → users.id           | Buyer user ID                        |
| sellerId         | UUID         | NOT NULL, FK → users.id           | Seller user ID                       |
| status           | VARCHAR(20)  | NOT NULL, DEFAULT 'pending'       | pending/completed/disputed/cancelled |
| buyerConfirmed   | BOOLEAN      | DEFAULT FALSE                     | Buyer confirmed completion           |
| sellerConfirmed  | BOOLEAN      | DEFAULT FALSE                     | Seller confirmed completion          |
| buyerNotes       | TEXT         | NULL                              | Buyer's notes on confirmation        |
| sellerNotes      | TEXT         | NULL                              | Seller's notes on confirmation       |
| reportedBy       | UUID         | NULL, FK → users.id               | User who reported issue              |
| reportReason     | TEXT         | NULL                              | Reason for report                    |
| reportDetails    | TEXT         | NULL                              | Detailed report description          |
| reportedAt       | TIMESTAMP    | NULL                              | When issue was reported              |
| completedAt      | TIMESTAMP    | NULL                              | When transaction completed           |
| createdAt        | TIMESTAMP    | DEFAULT NOW()                     | Transaction start time               |
| updatedAt        | TIMESTAMP    | DEFAULT NOW()                     | Last update time                     |

**Constraints**:
- `CHECK (buyerId != sellerId)` - Cannot trade with yourself

**Indexes**:
- `idx_transactions_itemId` on `itemId`
- `idx_transactions_buyerId` on `buyerId`
- `idx_transactions_sellerId` on `sellerId`
- `idx_transactions_status` on `status`
- `idx_transactions_createdAt` on `createdAt DESC`

**Triggers**:
- Auto-update `status` to 'completed' when both `buyerConfirmed` and `sellerConfirmed` are TRUE
- Set `completedAt` when status changes to 'completed'

---

### 4. messages

Chat messages between transaction parties.

| Column        | Type         | Constraints                    | Description                     |
|---------------|--------------|--------------------------------|---------------------------------|
| id            | UUID         | PRIMARY KEY, DEFAULT uuid_v4() | Message identifier              |
| transactionId | UUID         | NOT NULL, FK → transactions.id | Associated transaction          |
| senderId      | UUID         | NOT NULL, FK → users.id        | Message sender                  |
| content       | TEXT         | NOT NULL                       | Message content                 |
| read          | BOOLEAN      | DEFAULT FALSE                  | Read status                     |
| createdAt     | TIMESTAMP    | DEFAULT NOW()                  | Message sent time               |

**Indexes**:
- `idx_messages_transactionId` on `transactionId`
- `idx_messages_senderId` on `senderId`
- `idx_messages_createdAt` on `createdAt ASC`
- `idx_messages_read` on `read` WHERE `read = FALSE`

---

### 5. ratings

User ratings after completed transactions.

| Column        | Type         | Constraints                       | Description                 |
|---------------|--------------|-----------------------------------|-----------------------------|
| id            | UUID         | PRIMARY KEY, DEFAULT uuid_v4()    | Rating identifier           |
| transactionId | UUID         | NOT NULL, FK → transactions.id    | Associated transaction      |
| raterId       | UUID         | NOT NULL, FK → users.id           | User giving the rating      |
| ratedUserId   | UUID         | NOT NULL, FK → users.id           | User being rated            |
| rating        | INTEGER      | NOT NULL, CHECK (1-5)             | Rating value (1-5 stars)    |
| comment       | TEXT         | NULL                              | Optional comment            |
| createdAt     | TIMESTAMP    | DEFAULT NOW()                     | Rating creation time        |

**Constraints**:
- `UNIQUE (transactionId, raterId)` - One rating per user per transaction
- `CHECK (raterId != ratedUserId)` - Cannot rate yourself
- `CHECK (rating >= 1 AND rating <= 5)` - Valid rating range

**Indexes**:
- `idx_ratings_ratedUserId` on `ratedUserId`
- `idx_ratings_transactionId` on `transactionId`
- `idx_ratings_createdAt` on `createdAt DESC`

---

### 6. user_reputation (Materialized View / Computed)

Pre-computed reputation scores for performance. Can be a materialized view or updated via triggers.

| Column                | Type         | Description                           |
|-----------------------|--------------|---------------------------------------|
| userId                | UUID         | User being rated                      |
| averageRating         | DECIMAL(3,2) | Average rating (0.00-5.00)            |
| totalRatings          | INTEGER      | Total number of ratings received      |
| rating5Count          | INTEGER      | Count of 5-star ratings               |
| rating4Count          | INTEGER      | Count of 4-star ratings               |
| rating3Count          | INTEGER      | Count of 3-star ratings               |
| rating2Count          | INTEGER      | Count of 2-star ratings               |
| rating1Count          | INTEGER      | Count of 1-star ratings               |
| completedTransactions | INTEGER      | Total completed transactions          |
| lastUpdated           | TIMESTAMP    | Last calculation time                 |

**Calculation**:
```sql
-- Refresh reputation for user
CREATE OR REPLACE FUNCTION refresh_user_reputation(user_id UUID) 
RETURNS void AS $$
BEGIN
  INSERT INTO user_reputation (userId, averageRating, totalRatings, ...)
  SELECT 
    ratedUserId,
    AVG(rating)::DECIMAL(3,2),
    COUNT(*),
    COUNT(*) FILTER (WHERE rating = 5),
    COUNT(*) FILTER (WHERE rating = 4),
    COUNT(*) FILTER (WHERE rating = 3),
    COUNT(*) FILTER (WHERE rating = 2),
    COUNT(*) FILTER (WHERE rating = 1),
    (SELECT COUNT(*) FROM transactions 
     WHERE (buyerId = user_id OR sellerId = user_id) 
     AND status = 'completed'),
    NOW()
  FROM ratings
  WHERE ratedUserId = user_id
  GROUP BY ratedUserId
  ON CONFLICT (userId) DO UPDATE SET
    averageRating = EXCLUDED.averageRating,
    totalRatings = EXCLUDED.totalRatings,
    rating5Count = EXCLUDED.rating5Count,
    rating4Count = EXCLUDED.rating4Count,
    rating3Count = EXCLUDED.rating3Count,
    rating2Count = EXCLUDED.rating2Count,
    rating1Count = EXCLUDED.rating1Count,
    completedTransactions = EXCLUDED.completedTransactions,
    lastUpdated = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## Indexes

### Performance Optimization Strategy

**High-Priority Indexes** (created immediately):
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Items (most queried table)
CREATE INDEX idx_items_userId ON items(userId);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_createdAt ON items(createdAt DESC);
CREATE INDEX idx_items_realm_gameMode ON items(realm, gameMode);
CREATE INDEX idx_items_itemData_type ON items((itemData->>'type'));
CREATE INDEX idx_items_itemData_name ON items((itemData->>'name'));

-- For price sorting (fiat only)
CREATE INDEX idx_items_price_amount ON items(((price->>'amount')::numeric)) 
  WHERE (price->>'type') = 'fiat';

-- Transactions
CREATE INDEX idx_transactions_buyerId ON transactions(buyerId);
CREATE INDEX idx_transactions_sellerId ON transactions(sellerId);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_itemId ON transactions(itemId);

-- Messages
CREATE INDEX idx_messages_transactionId ON messages(transactionId);
CREATE INDEX idx_messages_unread ON messages(read) WHERE read = FALSE;

-- Ratings
CREATE INDEX idx_ratings_ratedUserId ON ratings(ratedUserId);
CREATE INDEX idx_ratings_transactionId ON ratings(transactionId);
```

**Composite Indexes** (for complex queries):
```sql
-- Search active items by type and realm
CREATE INDEX idx_items_search ON items(status, realm, gameMode, createdAt DESC)
  WHERE status = 'active';

-- User's active listings
CREATE INDEX idx_items_user_active ON items(userId, status)
  WHERE status = 'active';

-- User transactions by status
CREATE INDEX idx_transactions_buyer_status ON transactions(buyerId, status);
CREATE INDEX idx_transactions_seller_status ON transactions(sellerId, status);
```

---

## Constraints

### Foreign Key Relationships

```sql
-- Items
ALTER TABLE items 
  ADD CONSTRAINT fk_items_userId 
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

-- Transactions
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_itemId
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE RESTRICT;

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_buyerId
  FOREIGN KEY (buyerId) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_sellerId
  FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_reportedBy
  FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE SET NULL;

-- Messages
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_transactionId
  FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE;

ALTER TABLE messages
  ADD CONSTRAINT fk_messages_senderId
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE;

-- Ratings
ALTER TABLE ratings
  ADD CONSTRAINT fk_ratings_transactionId
  FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE;

ALTER TABLE ratings
  ADD CONSTRAINT fk_ratings_raterId
  FOREIGN KEY (raterId) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ratings
  ADD CONSTRAINT fk_ratings_ratedUserId
  FOREIGN KEY (ratedUserId) REFERENCES users(id) ON DELETE CASCADE;
```

### Business Logic Constraints

```sql
-- Cannot trade with yourself
ALTER TABLE transactions
  ADD CONSTRAINT chk_transactions_different_users
  CHECK (buyerId != sellerId);

-- Cannot rate yourself
ALTER TABLE ratings
  ADD CONSTRAINT chk_ratings_different_users
  CHECK (raterId != ratedUserId);

-- Rating must be 1-5
ALTER TABLE ratings
  ADD CONSTRAINT chk_ratings_valid_range
  CHECK (rating >= 1 AND rating <= 5);

-- One rating per transaction per user
ALTER TABLE ratings
  ADD CONSTRAINT unq_ratings_transaction_rater
  UNIQUE (transactionId, raterId);
```

---

## Prisma Schema

**File**: `backend/prisma/schema.prisma`

```prisma
// This is your Prisma schema file
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid()) @db.Uuid
  username  String   @unique @db.VarChar(20)
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255)
  battleTag String?  @db.VarChar(50)
  avatar    String?  @db.Text
  bio       String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  items              Item[]
  purchasedTransactions Transaction[] @relation("BuyerTransactions")
  soldTransactions      Transaction[] @relation("SellerTransactions")
  reportedTransactions  Transaction[] @relation("ReportedTransactions")
  sentMessages       Message[]
  ratingsGiven       Rating[]      @relation("RaterRatings")
  ratingsReceived    Rating[]      @relation("RatedUserRatings")
  reputation         UserReputation?

  @@index([email])
  @@index([username])
  @@map("users")
}

model Item {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  itemData    Json     // JSONB in PostgreSQL
  price       Json     // JSONB in PostgreSQL
  description String?  @db.Text
  realm       String   @db.VarChar(20)
  gameMode    String   @db.VarChar(30)
  rawText     String   @db.Text
  status      String   @default("active") @db.VarChar(20)
  views       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@index([realm, gameMode])
  @@map("items")
}

model Transaction {
  id               String    @id @default(uuid()) @db.Uuid
  itemId           String    @db.Uuid
  buyerId          String    @db.Uuid
  sellerId         String    @db.Uuid
  status           String    @default("pending") @db.VarChar(20)
  buyerConfirmed   Boolean   @default(false)
  sellerConfirmed  Boolean   @default(false)
  buyerNotes       String?   @db.Text
  sellerNotes      String?   @db.Text
  reportedBy       String?   @db.Uuid
  reportReason     String?   @db.Text
  reportDetails    String?   @db.Text
  reportedAt       DateTime?
  completedAt      DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  item      Item      @relation(fields: [itemId], references: [id], onDelete: Restrict)
  buyer     User      @relation("BuyerTransactions", fields: [buyerId], references: [id], onDelete: Cascade)
  seller    User      @relation("SellerTransactions", fields: [sellerId], references: [id], onDelete: Cascade)
  reporter  User?     @relation("ReportedTransactions", fields: [reportedBy], references: [id], onDelete: SetNull)
  messages  Message[]
  ratings   Rating[]

  @@index([itemId])
  @@index([buyerId])
  @@index([sellerId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("transactions")
}

model Message {
  id            String   @id @default(uuid()) @db.Uuid
  transactionId String   @db.Uuid
  senderId      String   @db.Uuid
  content       String   @db.Text
  read          Boolean  @default(false)
  createdAt     DateTime @default(now())

  // Relations
  transaction Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  sender      User        @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([transactionId])
  @@index([senderId])
  @@index([createdAt])
  @@index([read])
  @@map("messages")
}

model Rating {
  id            String   @id @default(uuid()) @db.Uuid
  transactionId String   @db.Uuid
  raterId       String   @db.Uuid
  ratedUserId   String   @db.Uuid
  rating        Int
  comment       String?  @db.Text
  createdAt     DateTime @default(now())

  // Relations
  transaction Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  rater       User        @relation("RaterRatings", fields: [raterId], references: [id], onDelete: Cascade)
  ratedUser   User        @relation("RatedUserRatings", fields: [ratedUserId], references: [id], onDelete: Cascade)

  @@unique([transactionId, raterId])
  @@index([ratedUserId])
  @@index([transactionId])
  @@index([createdAt(sort: Desc)])
  @@map("ratings")
}

model UserReputation {
  userId                String   @id @db.Uuid
  averageRating         Decimal  @default(0) @db.Decimal(3, 2)
  totalRatings          Int      @default(0)
  rating5Count          Int      @default(0)
  rating4Count          Int      @default(0)
  rating3Count          Int      @default(0)
  rating2Count          Int      @default(0)
  rating1Count          Int      @default(0)
  completedTransactions Int      @default(0)
  lastUpdated           DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_reputation")
}
```

---

## Sample Queries

### Get Items with Filters

```sql
-- Get active runeword items in Americas, Softcore Ladder, sorted by price
SELECT 
  i.*,
  u.username,
  u.battleTag,
  ur.averageRating,
  ur.completedTransactions
FROM items i
JOIN users u ON i.userId = u.id
LEFT JOIN user_reputation ur ON u.id = ur.userId
WHERE i.status = 'active'
  AND i.realm = 'Americas'
  AND i.gameMode = 'Softcore Ladder'
  AND i.itemData->>'type' = 'runeword'
  AND (i.price->>'type') = 'fiat'
ORDER BY (i.price->>'amount')::numeric ASC
LIMIT 20 OFFSET 0;
```

### Get User's Transactions

```sql
-- Get all transactions for a user with item and other party info
SELECT 
  t.*,
  i.itemData->>'name' as itemName,
  i.price,
  CASE 
    WHEN t.buyerId = $1 THEN 'buyer'
    WHEN t.sellerId = $1 THEN 'seller'
  END as userRole,
  CASE 
    WHEN t.buyerId = $1 THEN seller.username
    WHEN t.sellerId = $1 THEN buyer.username
  END as otherPartyUsername,
  CASE 
    WHEN t.buyerId = $1 THEN seller_rep.averageRating
    WHEN t.sellerId = $1 THEN buyer_rep.averageRating
  END as otherPartyReputation
FROM transactions t
JOIN items i ON t.itemId = i.id
JOIN users buyer ON t.buyerId = buyer.id
JOIN users seller ON t.sellerId = seller.id
LEFT JOIN user_reputation buyer_rep ON buyer.id = buyer_rep.userId
LEFT JOIN user_reputation seller_rep ON seller.id = seller_rep.userId
WHERE t.buyerId = $1 OR t.sellerId = $1
ORDER BY t.createdAt DESC;
```

### Calculate User Reputation

```sql
-- Get comprehensive reputation for a user
SELECT 
  u.id,
  u.username,
  COALESCE(AVG(r.rating), 0)::DECIMAL(3,2) as averageRating,
  COUNT(r.id) as totalRatings,
  COUNT(*) FILTER (WHERE r.rating = 5) as rating5Count,
  COUNT(*) FILTER (WHERE r.rating = 4) as rating4Count,
  COUNT(*) FILTER (WHERE r.rating = 3) as rating3Count,
  COUNT(*) FILTER (WHERE r.rating = 2) as rating2Count,
  COUNT(*) FILTER (WHERE r.rating = 1) as rating1Count,
  (
    SELECT COUNT(*) 
    FROM transactions 
    WHERE (buyerId = u.id OR sellerId = u.id) 
    AND status = 'completed'
  ) as completedTransactions
FROM users u
LEFT JOIN ratings r ON u.id = r.ratedUserId
WHERE u.id = $1
GROUP BY u.id, u.username;
```

### Get Unread Message Count

```sql
-- Get unread message count for a user across all transactions
SELECT COUNT(*) as unreadCount
FROM messages m
JOIN transactions t ON m.transactionId = t.id
WHERE m.read = FALSE
  AND m.senderId != $1  -- Not messages sent by user
  AND (t.buyerId = $1 OR t.sellerId = $1);  -- User is part of transaction
```

### Search Items by Name

```sql
-- Full-text search on item name and description
SELECT i.*, u.username
FROM items i
JOIN users u ON i.userId = u.id
WHERE i.status = 'active'
  AND (
    i.itemData->>'name' ILIKE '%enigma%'
    OR i.description ILIKE '%enigma%'
  )
ORDER BY i.createdAt DESC
LIMIT 20;
```

---

## Database Triggers

### Auto-complete Transaction

Automatically set transaction status to 'completed' when both parties confirm.

```sql
CREATE OR REPLACE FUNCTION auto_complete_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.buyerConfirmed = TRUE AND NEW.sellerConfirmed = TRUE THEN
    NEW.status = 'completed';
    NEW.completedAt = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_complete_transaction
BEFORE UPDATE ON transactions
FOR EACH ROW
WHEN (
  (OLD.buyerConfirmed IS DISTINCT FROM NEW.buyerConfirmed OR 
   OLD.sellerConfirmed IS DISTINCT FROM NEW.sellerConfirmed)
)
EXECUTE FUNCTION auto_complete_transaction();
```

### Update User Reputation on New Rating

```sql
CREATE OR REPLACE FUNCTION update_reputation_on_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_user_reputation(NEW.ratedUserId);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reputation_on_rating
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_reputation_on_rating();
```

---

## Migrations

### Initial Migration

```bash
# Create initial migration
npx prisma migrate dev --name init

# Apply migrations to production
npx prisma migrate deploy
```

### Sample Migration SQL

```sql
-- CreateEnum (if using enums)
CREATE TYPE "ItemType" AS ENUM ('runeword', 'unique', 'set', 'rare', 'magic', 'normal');
CREATE TYPE "Realm" AS ENUM ('Americas', 'Europe', 'Asia');
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'disputed', 'cancelled');

-- CreateTable users
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "battleTag" VARCHAR(50),
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Continue with other tables...
```

---

## Seed Data

**File**: `backend/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo users
  const password = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      username: 'trader_pro',
      email: 'trader@example.com',
      password,
      battleTag: 'TraderPro#1234',
      bio: 'Veteran D2 trader since 2001',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'rune_collector',
      email: 'runes@example.com',
      password,
      battleTag: 'RuneKing#5678',
    },
  });

  // Create demo items
  await prisma.item.create({
    data: {
      userId: user1.id,
      itemData: {
        name: 'Enigma',
        baseItem: 'Mage Plate',
        type: 'runeword',
        runes: ['Jah', 'Ith', 'Ber'],
        ethereal: false,
        sockets: 3,
        stats: [
          { name: 'Defense', value: '1250' },
          { name: '+2 To All Skills', value: '+2' },
        ],
      },
      price: {
        type: 'fiat',
        amount: 150,
        currency: 'USD',
      },
      description: 'Perfect defense roll, quick sale!',
      realm: 'Americas',
      gameMode: 'Softcore Ladder',
      rawText: 'Enigma Mage Plate\n...',
      status: 'active',
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Performance Considerations

1. **JSONB Indexing**: Use GIN indexes for complex JSONB queries
   ```sql
   CREATE INDEX idx_items_itemdata_gin ON items USING GIN (itemData);
   ```

2. **Partitioning**: Consider partitioning `messages` and `transactions` tables by date for large datasets

3. **Connection Pooling**: Use PgBouncer in production
   ```
   DATABASE_URL="postgresql://user:pass@localhost:6432/netherlist?pgbouncer=true"
   ```

4. **Query Optimization**: Use `EXPLAIN ANALYZE` to optimize slow queries

5. **Caching**: Cache user reputation and frequently accessed items in Redis

---

**End of Database Schema**
