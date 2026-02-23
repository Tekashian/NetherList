# API Specification - NetherList

**Version**: 1.0.0  
**Base URL**: `http://localhost:4000/api/v1`  
**Protocol**: REST  
**Authentication**: JWT Bearer Token

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Items](#2-items)
3. [Transactions](#3-transactions)
4. [Messages](#4-messages)
5. [Users & Reputation](#5-users--reputation)
6. [Error Handling](#6-error-handling)
7. [Rate Limiting](#7-rate-limiting)
8. [Pagination](#8-pagination)

---

## Common Headers

All authenticated requests require:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. Authentication

### 1.1 Google OAuth - Initiate Login

**GET** `/auth/google`

Initiate Google OAuth flow. Redirects user to Google consent screen.

**Query Parameters**:
- `redirect` (optional): Frontend URL to redirect after successful auth

**Response**: HTTP 302 redirect to Google OAuth

---

### 1.2 Google OAuth - Callback

**GET** `/auth/google/callback`

Handles Google OAuth callback. Creates new user or authenticates existing.

**Query Parameters** (set by Google):
- `code`: Authorization code
- `state`: CSRF token

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "player123",
      "email": "player@example.com",
      "googleId": "117234567890123456789",
      "avatar": "https://lh3.googleusercontent.com/a/...",
      "battleTag": "Player#1234",
      "createdAt": "2026-02-23T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note**: First-time users are auto-registered. Token expires in 7 days.

**Errors**:
- `400` - OAuth error (invalid code, access denied)
- `500` - Server error

---

### 1.3 Get Current User

**GET** `/auth/me`

Get authenticated user's profile.

**Headers**: Authorization required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "player123",
    "email": "player@example.com",
    "battleTag": "Player#1234",
    "avatar": "https://cdn.netherlist.com/avatars/123.jpg",
    "reputation": {
      "score": 4.8,
      "totalRatings": 42,
      "completedTransactions": 38
    },
    "createdAt": "2026-01-15T08:30:00.000Z"
  }
}
```

**Errors**:
- `401` - Unauthorized

---

### 1.4 Update Profile

**PATCH** `/auth/profile`

Update user profile information.

**Headers**: Authorization required

**Request Body** (all fields optional):
```json
{
  "battleTag": "NewPlayer#5678",
  "avatar": "https://cdn.netherlist.com/avatars/new.jpg",
  "bio": "Trading since 2001"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "player123",
    "battleTag": "NewPlayer#5678",
    "avatar": "https://cdn.netherlist.com/avatars/new.jpg",
    "bio": "Trading since 2001",
    "updatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

---

## 2. Items

### 2.1 Parse Item Text

**POST** `/items/parse`

Parse raw Diablo II item text into structured JSON.

**Headers**: Authorization required

**Request Body**:
```json
{
  "rawText": "Enigma Mage Plate\nRunes: Jah Ith Ber\nDefense: 1250\n+2 To All Skills\n+45% Faster Run/Walk\n+1 To Teleport\n+750-775 Defense (varies)\n+(0.75 Per Character Level) +0-74 To Strength (Based On Character Level)\nIncrease Maximum Life 5%\nDamage Reduced By 8%\n+14 Life After Each Kill\n15% Damage Taken Goes To Mana\n+(1 Per Character Level) +1-99% Better Chance of Getting Magic Items (Based On Character Level)\nEthereal (Cannot be Repaired), Socketed (3)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "parsed": {
      "name": "Enigma",
      "baseItem": "Mage Plate",
      "type": "runeword",
      "runes": ["Jah", "Ith", "Ber"],
      "ethereal": true,
      "sockets": 3,
      "stats": [
        { "name": "Defense", "value": "1250" },
        { "name": "+2 To All Skills", "value": "+2" },
        { "name": "+45% Faster Run/Walk", "value": "+45%" },
        { "name": "+1 To Teleport", "value": "+1" },
        { "name": "+750-775 Defense", "value": "+750-775", "variable": true },
        { "name": "Increase Maximum Life", "value": "5%" },
        { "name": "Damage Reduced By", "value": "8%" },
        { "name": "+14 Life After Each Kill", "value": "+14" },
        { "name": "15% Damage Taken Goes To Mana", "value": "15%" }
      ],
      "quality": "runeword",
      "confidence": 0.95
    },
    "rawText": "Enigma Mage Plate..."
  }
}
```

**Errors**:
- `400` - Invalid or unparseable text
- `401` - Unauthorized

---

### 2.2 Create Item Listing

**POST** `/items`

Create a new item listing.

**Headers**: Authorization required

**Request Body**:
```json
{
  "itemData": {
    "name": "Enigma",
    "baseItem": "Mage Plate",
    "type": "runeword",
    "runes": ["Jah", "Ith", "Ber"],
    "ethereal": true,
    "sockets": 3,
    "stats": [
      { "name": "Defense", "value": "1250" },
      { "name": "+2 To All Skills", "value": "+2" }
    ]
  },
  "price": {
    "type": "fiat",
    "amount": 150.00,
    "currency": "USD"
  },
  "description": "Perfect defense roll, ladder softcore",
  "realm": "Americas",
  "gameMode": "Softcore Ladder",
  "rawText": "Enigma Mage Plate..."
}
```

**Alternative Price Types**:
```json
// Crypto
{
  "price": {
    "type": "crypto",
    "amount": 0.05,
    "currency": "ETH"
  }
}

// Barter
{
  "price": {
    "type": "barter",
    "description": "LF: Ber + Ist runes"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "itemData": { /* full item object */ },
    "price": {
      "type": "fiat",
      "amount": 150.00,
      "currency": "USD"
    },
    "description": "Perfect defense roll, ladder softcore",
    "realm": "Americas",
    "gameMode": "Softcore Ladder",
    "status": "active",
    "views": 0,
    "createdAt": "2026-02-23T10:00:00.000Z",
    "updatedAt": "2026-02-23T10:00:00.000Z",
    "user": {
      "id": "uuid",
      "username": "player123",
      "reputation": 4.8
    }
  }
}
```

**Errors**:
- `400` - Validation error
- `401` - Unauthorized

---

### 2.3 Get All Items (Search & Filter)

**GET** `/items`

Search and filter item listings.

**Query Parameters**:
- `search` (string): Search by item name or description
- `type` (enum): `runeword|unique|set|rare|magic|normal`
- `realm` (enum): `Americas|Europe|Asia`
- `gameMode` (enum): `Softcore|Hardcore|Softcore Ladder|Hardcore Ladder`
- `minPrice` (number): Minimum price (fiat only)
- `maxPrice` (number): Maximum price (fiat only)
- `ethereal` (boolean): Filter ethereal items
- `sort` (enum): `newest|oldest|price_asc|price_desc|popular`
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Example Request**:
```
GET /items?type=runeword&realm=Americas&gameMode=Softcore%20Ladder&sort=price_asc&page=1&limit=20
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "itemData": {
          "name": "Enigma",
          "baseItem": "Mage Plate",
          "type": "runeword",
          "ethereal": true,
          "stats": [/* ... */]
        },
        "price": {
          "type": "fiat",
          "amount": 150.00,
          "currency": "USD"
        },
        "description": "Perfect defense roll",
        "realm": "Americas",
        "gameMode": "Softcore Ladder",
        "status": "active",
        "views": 42,
        "createdAt": "2026-02-23T10:00:00.000Z",
        "user": {
          "id": "uuid",
          "username": "player123",
          "reputation": 4.8,
          "completedTransactions": 35
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 2.4 Get Item by ID

**GET** `/items/:id`

Get detailed information about a specific item.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "itemData": {
      "name": "Enigma",
      "baseItem": "Mage Plate",
      "type": "runeword",
      "runes": ["Jah", "Ith", "Ber"],
      "ethereal": true,
      "sockets": 3,
      "stats": [/* full stats */]
    },
    "price": {
      "type": "fiat",
      "amount": 150.00,
      "currency": "USD"
    },
    "description": "Perfect defense roll, ladder softcore",
    "realm": "Americas",
    "gameMode": "Softcore Ladder",
    "rawText": "Enigma Mage Plate...",
    "status": "active",
    "views": 42,
    "createdAt": "2026-02-23T10:00:00.000Z",
    "updatedAt": "2026-02-23T10:00:00.000Z",
    "user": {
      "id": "uuid",
      "username": "player123",
      "battleTag": "Player#1234",
      "avatar": "https://cdn.netherlist.com/avatars/123.jpg",
      "reputation": 4.8,
      "totalRatings": 42,
      "completedTransactions": 38
    }
  }
}
```

**Errors**:
- `404` - Item not found

---

### 2.5 Update Item Listing

**PATCH** `/items/:id`

Update an existing item listing (only owner can update).

**Headers**: Authorization required

**Request Body** (all fields optional):
```json
{
  "price": {
    "type": "fiat",
    "amount": 140.00,
    "currency": "USD"
  },
  "description": "Updated description - price reduced!",
  "status": "active"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    /* updated item object */
  }
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Item not found

---

### 2.6 Delete Item Listing

**DELETE** `/items/:id`

Delete an item listing (only owner can delete).

**Headers**: Authorization required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Item listing deleted successfully"
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Forbidden (not owner or item in active transaction)
- `404` - Item not found

---

### 2.7 Get User's Items

**GET** `/users/:userId/items`

Get all items listed by a specific user.

**Query Parameters**: Same as 2.3, excluding user-specific filters

**Response**: Same structure as 2.3

---

## 3. Transactions

### 3.1 Initiate Transaction

**POST** `/transactions`

Start a transaction for an item.

**Headers**: Authorization required

**Request Body**:
```json
{
  "itemId": "uuid",
  "message": "Hi, I'd like to buy this item. When can you trade?"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemId": "uuid",
    "buyerId": "uuid",
    "sellerId": "uuid",
    "status": "pending",
    "buyerConfirmed": false,
    "sellerConfirmed": false,
    "whisperMessage": "/w *Player#1234 Hi! I'm ready to trade for Enigma",
    "createdAt": "2026-02-23T11:00:00.000Z",
    "item": {
      "id": "uuid",
      "itemData": { "name": "Enigma", /* ... */ },
      "price": { "type": "fiat", "amount": 150.00, "currency": "USD" }
    },
    "buyer": {
      "id": "uuid",
      "username": "buyer123",
      "battleTag": "Buyer#5678",
      "reputation": 4.5
    },
    "seller": {
      "id": "uuid",
      "username": "player123",
      "battleTag": "Player#1234",
      "reputation": 4.8
    }
  }
}
```

**Errors**:
- `400` - Item not available, or user trying to buy own item
- `401` - Unauthorized
- `404` - Item not found

---

### 3.2 Get Transaction by ID

**GET** `/transactions/:id`

Get transaction details (only parties involved).

**Headers**: Authorization required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemId": "uuid",
    "buyerId": "uuid",
    "sellerId": "uuid",
    "status": "pending",
    "buyerConfirmed": false,
    "sellerConfirmed": false,
    "whisperMessage": "/w *Player#1234 Hi! I'm ready to trade",
    "createdAt": "2026-02-23T11:00:00.000Z",
    "updatedAt": "2026-02-23T11:00:00.000Z",
    "item": { /* full item */ },
    "buyer": { /* full buyer profile */ },
    "seller": { /* full seller profile */ }
  }
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Forbidden (not part of transaction)
- `404` - Transaction not found

---

### 3.3 Confirm Transaction (Buyer)

**PATCH** `/transactions/:id/confirm/buyer`

Buyer confirms the transaction is complete.

**Headers**: Authorization required

**Request Body** (optional):
```json
{
  "notes": "Great trader, fast and smooth!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "buyerConfirmed": true,
    "sellerConfirmed": false,
    "updatedAt": "2026-02-23T11:30:00.000Z"
  }
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Forbidden (not buyer)
- `404` - Transaction not found

---

### 3.4 Confirm Transaction (Seller)

**PATCH** `/transactions/:id/confirm/seller`

Seller confirms the transaction is complete.

**Headers**: Authorization required

**Request Body** (optional):
```json
{
  "notes": "Payment received, item delivered!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "buyerConfirmed": true,
    "sellerConfirmed": true,
    "completedAt": "2026-02-23T11:35:00.000Z",
    "updatedAt": "2026-02-23T11:35:00.000Z"
  }
}
```

**Note**: When both parties confirm, status automatically changes to `completed`.

---

### 3.5 Report Problem with Transaction

**PATCH** `/transactions/:id/report`

Report an issue with a transaction.

**Headers**: Authorization required

**Request Body**:
```json
{
  "reason": "Seller not responding",
  "details": "Waited 2 days, no response to messages"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "disputed",
    "reportedBy": "uuid",
    "reportReason": "Seller not responding",
    "reportDetails": "Waited 2 days, no response to messages",
    "reportedAt": "2026-02-25T10:00:00.000Z"
  }
}
```

---

### 3.6 Cancel Transaction

**DELETE** `/transactions/:id`

Cancel a pending transaction (only if not confirmed by either party).

**Headers**: Authorization required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "cancelledBy": "uuid",
    "cancelledAt": "2026-02-23T12:00:00.000Z"
  }
}
```

**Errors**:
- `403` - Cannot cancel if already confirmed by any party

---

### 3.7 Get User's Transactions

**GET** `/users/:userId/transactions`

Get all transactions for a user (as buyer or seller).

**Headers**: Authorization required (must be the user or admin)

**Query Parameters**:
- `status` (enum): `pending|completed|disputed|cancelled`
- `role` (enum): `buyer|seller|all` (default: all)
- `page`, `limit`: Pagination

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "status": "completed",
        "role": "buyer",
        "item": { /* item summary */ },
        "otherParty": { /* other user summary */ },
        "createdAt": "2026-02-20T10:00:00.000Z",
        "completedAt": "2026-02-20T15:30:00.000Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

## 4. Messages

### 4.1 Send Message

**POST** `/messages`

Send a chat message.

**Headers**: Authorization required

**Request Body**:
```json
{
  "transactionId": "uuid",
  "content": "Hi, are you available now for the trade?"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "transactionId": "uuid",
    "senderId": "uuid",
    "content": "Hi, are you available now for the trade?",
    "read": false,
    "createdAt": "2026-02-23T11:15:00.000Z",
    "sender": {
      "id": "uuid",
      "username": "buyer123",
      "avatar": "https://cdn.netherlist.com/avatars/456.jpg"
    }
  }
}
```

**Real-time**: Also broadcasts via WebSocket to recipient.

---

### 4.2 Get Messages for Transaction

**GET** `/transactions/:transactionId/messages`

Get all messages for a transaction.

**Headers**: Authorization required

**Query Parameters**:
- `page`, `limit`: Pagination

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "content": "Hi, I'd like to buy this item",
        "read": true,
        "createdAt": "2026-02-23T11:00:00.000Z",
        "sender": {
          "username": "buyer123",
          "avatar": "https://cdn.netherlist.com/avatars/456.jpg"
        }
      },
      {
        "id": "uuid",
        "senderId": "uuid",
        "content": "Sure! When are you available?",
        "read": true,
        "createdAt": "2026-02-23T11:05:00.000Z",
        "sender": {
          "username": "player123",
          "avatar": "https://cdn.netherlist.com/avatars/123.jpg"
        }
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### 4.3 Mark Messages as Read

**PATCH** `/messages/read`

Mark messages as read.

**Headers**: Authorization required

**Request Body**:
```json
{
  "messageIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "updated": 3
  }
}
```

---

### 4.4 Get Unread Message Count

**GET** `/messages/unread/count`

Get count of unread messages for the authenticated user.

**Headers**: Authorization required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

## 5. Users & Reputation

### 5.1 Get User Profile

**GET** `/users/:id`

Get public user profile.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "player123",
    "battleTag": "Player#1234",
    "avatar": "https://cdn.netherlist.com/avatars/123.jpg",
    "bio": "Trading since 2001, fair and fast!",
    "reputation": {
      "score": 4.8,
      "totalRatings": 42,
      "distribution": {
        "5": 35,
        "4": 5,
        "3": 2,
        "2": 0,
        "1": 0
      },
      "completedTransactions": 38
    },
    "stats": {
      "activeListings": 5,
      "totalListings": 63,
      "memberSince": "2026-01-15T08:30:00.000Z"
    }
  }
}
```

---

### 5.2 Get User Reputation

**GET** `/users/:id/reputation`

Get detailed reputation information.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "score": 4.8,
    "totalRatings": 42,
    "distribution": {
      "5": 35,
      "4": 5,
      "3": 2,
      "2": 0,
      "1": 0
    },
    "completedTransactions": 38,
    "recentRatings": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Fast and reliable trader!",
        "createdAt": "2026-02-22T14:00:00.000Z",
        "rater": {
          "username": "buyer789"
        }
      }
    ]
  }
}
```

---

### 5.3 Rate User

**POST** `/ratings`

Rate a user after completing a transaction.

**Headers**: Authorization required

**Request Body**:
```json
{
  "transactionId": "uuid",
  "ratedUserId": "uuid",
  "rating": 5,
  "comment": "Excellent trader, very professional!"
}
```

**Validation**:
- `rating`: 1-5 (integer)
- Can only rate once per transaction
- Transaction must be completed
- Cannot rate yourself

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "transactionId": "uuid",
    "raterId": "uuid",
    "ratedUserId": "uuid",
    "rating": 5,
    "comment": "Excellent trader, very professional!",
    "createdAt": "2026-02-23T12:00:00.000Z"
  }
}
```

---

## 6. Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional: additional context
    }
  }
}
```

### Common HTTP Status Codes

| Code | Meaning                          | Example                           |
|------|----------------------------------|-----------------------------------|
| 200  | OK                               | Successful GET/PATCH/DELETE       |
| 201  | Created                          | Successful POST                   |
| 400  | Bad Request                      | Validation error                  |
| 401  | Unauthorized                     | Missing/invalid token             |
| 403  | Forbidden                        | Insufficient permissions          |
| 404  | Not Found                        | Resource doesn't exist            |
| 409  | Conflict                         | Duplicate resource                |
| 422  | Unprocessable Entity             | Semantic validation error         |
| 429  | Too Many Requests                | Rate limit exceeded               |
| 500  | Internal Server Error            | Server error                      |

### Error Codes

```javascript
// Authentication
INVALID_CREDENTIALS
TOKEN_EXPIRED
TOKEN_INVALID
UNAUTHORIZED

// Validation
VALIDATION_ERROR
INVALID_INPUT
REQUIRED_FIELD_MISSING

// Resources
NOT_FOUND
ALREADY_EXISTS
FORBIDDEN

// Business Logic
CANNOT_BUY_OWN_ITEM
ITEM_NOT_AVAILABLE
TRANSACTION_ALREADY_CONFIRMED
CANNOT_RATE_SELF
ALREADY_RATED

// Rate Limiting
RATE_LIMIT_EXCEEDED

// Server
INTERNAL_ERROR
DATABASE_ERROR
```

---

## 7. Rate Limiting

**Limits** (per IP address):
- General endpoints: 100 requests / 15 minutes
- Auth endpoints: 5 requests / 15 minutes
- Parse endpoint: 20 requests / 1 minute

**Headers** (included in response):
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708689600
```

**429 Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 300
    }
  }
}
```

---

## 8. Pagination

All list endpoints support pagination.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "items": [ /* array of results */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 9. WebSocket Events (Real-time)

**Connection URL**: `ws://localhost:4000`

**Authentication**:
```javascript
socket.emit('authenticate', { token: 'jwt_token' });
```

### Events

#### Client → Server

| Event              | Payload                                  | Description          |
|--------------------|------------------------------------------|----------------------|
| `authenticate`     | `{ token: string }`                      | Authenticate socket  |
| `join_transaction` | `{ transactionId: string }`              | Join transaction room|
| `send_message`     | `{ transactionId, content }`             | Send chat message    |
| `typing`           | `{ transactionId }`                      | User is typing       |

#### Server → Client

| Event                | Payload                                  | Description              |
|----------------------|------------------------------------------|--------------------------|
| `authenticated`      | `{ userId: string }`                     | Auth successful          |
| `new_message`        | `{ message: Message }`                   | New message received     |
| `transaction_update` | `{ transaction: Transaction }`           | Transaction status change|
| `user_typing`        | `{ userId: string, transactionId }`      | Other user typing        |
| `notification`       | `{ type, message }`                      | General notification     |
| `error`              | `{ message: string }`                    | Error occurred           |

---

## 10. Type Definitions

### Item Types
```typescript
type ItemType = 'runeword' | 'unique' | 'set' | 'rare' | 'magic' | 'normal';

type Realm = 'Americas' | 'Europe' | 'Asia';

type GameMode = 'Softcore' | 'Hardcore' | 'Softcore Ladder' | 'Hardcore Ladder';

interface ItemStat {
  name: string;
  value: string;
  variable?: boolean;
}

interface ItemData {
  name: string;
  baseItem: string;
  type: ItemType;
  runes?: string[];
  ethereal: boolean;
  sockets: number;
  stats: ItemStat[];
  quality?: string;
}
```

### Price Types
```typescript
type PriceType = 'fiat' | 'crypto' | 'barter';

interface FiatPrice {
  type: 'fiat';
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
}

interface CryptoPrice {
  type: 'crypto';
  amount: number;
  currency: 'BTC' | 'ETH';
}

interface BarterPrice {
  type: 'barter';
  description: string;
}

type Price = FiatPrice | CryptoPrice | BarterPrice;
```

### Transaction Statuses
```typescript
type TransactionStatus = 'pending' | 'completed' | 'disputed' | 'cancelled';
```

---

## 11. Best Practices

### Authentication
- Store JWT in httpOnly cookies (preferred) or localStorage
- Include token in `Authorization: Bearer <token>` header
- Refresh token before expiry (tokens expire in 7 days)

### Error Handling
- Always check `success` field
- Handle specific error codes for better UX
- Show user-friendly messages from `error.message`

### Performance
- Use pagination for lists
- Cache user profiles and reputation data
- Implement optimistic UI updates for better UX

### Real-time Features
- Connect WebSocket on login
- Join transaction rooms when viewing transaction details
- Disconnect socket on logout

---

## Examples

### Complete Flow: Creating a Listing

```javascript
// 1. Parse item text
const parseResponse = await fetch('/api/v1/items/parse', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rawText: "Enigma Mage Plate\n..."
  })
});
const { data: { parsed } } = await parseResponse.json();

// 2. Create listing with parsed data
const createResponse = await fetch('/api/v1/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    itemData: parsed,
    price: {
      type: 'fiat',
      amount: 150,
      currency: 'USD'
    },
    description: 'Perfect roll, quick sale!',
    realm: 'Americas',
    gameMode: 'Softcore Ladder',
    rawText: "Enigma Mage Plate\n..."
  })
});
const { data: listing } = await createResponse.json();
```

### Complete Flow: Transaction

```javascript
// 1. Initiate transaction
const txResponse = await fetch('/api/v1/transactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${buyerToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    itemId: 'item-uuid',
    message: "I'd like to buy this!"
  })
});
const { data: transaction } = await txResponse.json();

// 2. Copy whisper message
navigator.clipboard.writeText(transaction.whisperMessage);

// 3. Trade in-game

// 4. Buyer confirms
await fetch(`/api/v1/transactions/${transaction.id}/confirm/buyer`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${buyerToken}` }
});

// 5. Seller confirms
await fetch(`/api/v1/transactions/${transaction.id}/confirm/seller`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${sellerToken}` }
});
// Transaction now marked as completed

// 6. Rate seller
await fetch('/api/v1/ratings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${buyerToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    transactionId: transaction.id,
    ratedUserId: transaction.sellerId,
    rating: 5,
    comment: 'Great trader!'
  })
});
```

---

**End of API Specification**
