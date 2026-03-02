import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from './config/passport';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import authRoutes         from './routes/auth.routes';
import itemsRoutes        from './routes/items.routes';
import transactionsRoutes from './routes/transactions.routes';
import messagesRoutes     from './routes/messages.routes';
import usersRoutes        from './routes/users.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for Passport)
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/items',        itemsRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/messages',     messagesRoutes);
app.use('/api/v1/users',        usersRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
  });
});

// ── Centralised error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT);
app.listen(PORT, () => {
  console.log(`
🚀 NetherList Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
🔐 Auth: http://localhost:${PORT}/auth/google
🌍 Environment: ${env.NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
