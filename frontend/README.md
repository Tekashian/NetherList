# NetherList Frontend

Next.js 14 application for the NetherList trading platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Global styles
│   │   ├── (auth)/               # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── listings/             # Browse items
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx    # Item detail
│   │   ├── create/               # Create listing
│   │   ├── dashboard/            # User dashboard
│   │   │   ├── page.tsx
│   │   │   ├── listings/
│   │   │   ├── transactions/
│   │   │   └── settings/
│   │   ├── profile/              # User profiles
│   │   │   └── [id]/page.tsx
│   │   ├── messages/             # Chat interface
│   │   └── transaction/
│   │       └── [id]/page.tsx    # Transaction detail
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── items/
│   │   │   ├── ItemCard.tsx
│   │   │   ├── ItemForm.tsx
│   │   │   ├── ItemFilters.tsx
│   │   │   └── ItemParser.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionCard.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── chat/
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── reputation/
│   │   │   ├── ReputationBadge.tsx
│   │   │   └── RatingForm.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/                      # Utilities
│   │   ├── api.ts                # API client (axios)
│   │   ├── websocket.ts          # Socket.io client
│   │   ├── utils.ts              # Helper functions
│   │   └── validators.ts         # Zod schemas
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useItems.ts
│   │   ├── useTransactions.ts
│   │   ├── useChat.ts
│   │   └── useWebSocket.ts
│   ├── store/                    # Zustand state management
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   └── notificationStore.ts
│   ├── types/                    # TypeScript types
│   │   ├── api.ts
│   │   ├── items.ts
│   │   └── user.ts
│   └── utils/                    # Helper functions
│       ├── formatters.ts
│       └── constants.ts
├── public/
│   ├── images/
│   └── fonts/
├── Dockerfile
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run type-check` | Type check without building |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ci` | Run tests with coverage for CI |
| `npm run analyze` | Analyze bundle size |

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Icons**: Lucide React

## 🔑 Environment Variables

See `.env.example` for all variables.

**Required**:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL

**Optional**:
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_CDN_URL` - CDN URL for assets

## 📡 API Integration

The frontend uses TanStack Query (React Query) for data fetching and caching.

### Example: Fetching Items

```typescript
import { useQuery } from '@tanstack/react-query';
import { getItems } from '@/lib/api';

function ItemList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['items', { page: 1 }],
    queryFn: () => getItems({ page: 1, limit: 20 }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data?.items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## 🔌 WebSocket Integration

Real-time features use Socket.io.

### Example: Chat

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function ChatWidget({ transactionId }: { transactionId: string }) {
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_transaction', { transactionId });

    socket.on('new_message', (message) => {
      // Handle new message
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket, transactionId]);

  return <div>...</div>;
}
```

## 🎨 Styling with shadcn/ui

This project uses shadcn/ui components. To add new components:

```bash
# Add a component
npx shadcn-ui@latest add button

# Add multiple components
npx shadcn-ui@latest add dialog dropdown-menu
```

### Custom Colors

Diablo-themed colors are defined in `tailwind.config.ts`:

```typescript
// Usage in components
<span className="text-d2-unique">Unique Item</span>
<span className="text-d2-runeword">Runeword</span>
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:ci

# Watch mode
npm run test:watch
```

### Test Structure

```
tests/
├── components/
│   ├── ItemCard.test.tsx
│   └── ChatWidget.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── utils/
    └── formatters.test.ts
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚀 Performance Optimization

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: `npm run analyze`
- **React Query Caching**: Automatic caching and revalidation
- **Lazy Loading**: Components loaded on demand

## 🔒 Authentication

Authentication flow:

1. User logs in → receives JWT token
2. Token stored in localStorage
3. Axios interceptor adds token to requests
4. Protected routes check auth state
5. Redirect to login if unauthenticated

### Protected Routes

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

## 🎯 Key Features

### 1. Item Parser
Copy-paste Diablo II item text → automatic parsing

### 2. Advanced Search
Filter by type, realm, game mode, price, stats

### 3. Real-time Chat
Instant messaging between traders

### 4. Transaction Management
Manual confirmation system with reputation tracking

### 5. Whisper Generator
Generate Battle.net whisper messages

### 6. Reputation System
User ratings and transaction history

## 📦 Build & Deploy

### Production Build

```bash
# Build
npm run build

# Test production build locally
npm start
```

### Docker Build

```bash
# Build image
docker build -t netherlist-frontend .

# Run container
docker run -p 3000:3000 netherlist-frontend
```

## 🐛 Debugging

### Next.js DevTools

- React DevTools: Browser extension
- TanStack Query DevTools: Enabled in development
- Network tab: Monitor API calls

### Common Issues

**API not connecting**:
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running

**WebSocket errors**:
- Check `NEXT_PUBLIC_WS_URL`
- Verify Socket.io server is running

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com/)

## 🤝 Contributing

See [CONTRIBUTING.md](../docs/CONTRIBUTING.md)
