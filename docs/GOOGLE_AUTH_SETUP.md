# Google OAuth 2.0 Setup Guide

This guide explains how to set up **Google Sign-In** (OAuth 2.0) authentication for NetherList.

**🇵🇱 Przewodnik po polsku:** [GOOGLE_AUTH_SETUP_PL.md](./GOOGLE_AUTH_SETUP_PL.md)

---

## 🎯 Why Google OAuth?

✅ **No password management** - No bcrypt, no security risks  
✅ **Instant registration** - Users sign up in 2 clicks  
✅ **Trusted authentication** - Users trust Google  
✅ **Free tier** - 100% free for unlimited users  
✅ **Profile data** - Get email, name, and avatar automatically  

---

## 📋 Prerequisites

- Google Account
- Project deployed or running on `localhost`

**🇵🇱 Interfejs po polsku:**  
Google Cloud Console automatycznie wyświetla się po polsku. W tym przewodniku podaję nazwy PO ANGIELSKU i **PO POLSKU (PL:)**.

**Jak znaleźć "Credentials" (Dane logowania):**
- W menu po lewej: **Interfejsy API i usługi** → **Dane logowania**
- Lub bezpośredni link: https://console.cloud.google.com/apis/credentials

---

## 🚀 Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### 1.2 Create a New Project

1. Click **Select a project** → **New Project** (PL: **Wybierz projekt** → **Nowy projekt**)
2. Name: `NetherList` (or your preferred name) (PL: **Nazwa projektu**)
3. Click **Create** (PL: **Utwórz**)

### 1.3 Enable Google+ API

1. Go to **APIs & Services** → **Library** (PL: **Interfejsy API i usługi** → **Biblioteka**)
2. Search for "Google+ API"
3. Click **Enable** (PL: **Włącz**)

### 1.4 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials** (PL: **Interfejsy API i usługi** → **Dane logowania**)
2. Click **Create Credentials** → **OAuth client ID** (PL: **Utwórz dane logowania** → **Identyfikator klienta OAuth**)
3. If prompted, configure the **OAuth consent screen** (PL: **Ekran zgody OAuth**):
   - User Type: **External** (PL: **Zewnętrzny**)
   - App name: `NetherList` (PL: **Nazwa aplikacji**)
   - User support email: Your email (PL: **Adres e-mail wsparcia użytkowników**)
   - Developer contact: Your email (PL: **Dane kontaktowe dewelopera**)
   - Click **Save and Continue** (PL: **Zapisz i kontynuuj**)
   - Scopes: Add `email` and `profile` (should be default) (PL: **Zakresy**: dodaj `email` i `profile`)
   - Test users: Add your email for development (PL: **Użytkownicy testowi**: dodaj swój email)
   - Click **Save and Continue** (PL: **Zapisz i kontynuuj**)

4. **Create OAuth Client ID** (PL: **Utwórz identyfikator klienta OAuth**):
   - Application type: **Web application** (PL: **Typ aplikacji**: **Aplikacja webowa**)
   - Name: `NetherList Web Client` (PL: **Nazwa**)
   
   **Authorized JavaScript origins** (PL: **Autoryzowane źródła JavaScript**):
   ```
   http://localhost:3000
   http://localhost:4000
   https://yourdomain.com (for production)
   ```
   
   **Authorized redirect URIs** (PL: **Autoryzowane identyfikatory URI przekierowań**):
   ```
   http://localhost:4000/auth/google/callback
   https://yourdomain.com/auth/google/callback (for production)
   ```
   
5. Click **Create** (PL: **Utwórz**)
6. **SAVE** your credentials (PL: **ZAPISZ dane logowania**):
   - Client ID: `123456789-abc...xyz.apps.googleusercontent.com` (PL: **Identyfikator klienta**)
   - Client Secret: `GOCSPX-abc...xyz` (PL: **Kod dostępu klienta**)

---

## ⚙️ Step 2: Configure Backend

### 2.1 Update `.env`

Create/edit `backend/.env`:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID="123456789-abc...xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc...xyz"
GOOGLE_CALLBACK_URL="http://localhost:4000/auth/google/callback"

# Session Secret (generate random string)
SESSION_SECRET="your-random-secret-min-32-characters-long"

# JWT Secret
JWT_SECRET="your-jwt-secret-change-in-production"

# Other configs...
DATABASE_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

### 2.2 Install Dependencies

```bash
cd backend
npm install passport passport-google-oauth20 express-session
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/express-session
```

---

## ⚙️ Step 3: Configure Frontend

### 3.1 Update `.env.local`

Create `frontend/.env.local`:

```bash
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-characters"

# Google OAuth (same as backend)
GOOGLE_CLIENT_ID="123456789-abc...xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc...xyz"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"
```

### 3.2 Install NextAuth

```bash
cd frontend
npm install next-auth
```

---

## 💻 Step 4: Implementation

### Backend: Passport Configuration

Create `backend/src/config/passport.ts`:

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './database';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        // Create new user if doesn't exist
        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails![0].value,
              username: profile.displayName || profile.emails![0].value.split('@')[0],
              avatar: profile.photos?.[0]?.value,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
```

### Backend: Auth Routes

Create `backend/src/routes/auth.routes.ts`:

```typescript
import express from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user as any;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CORS_ORIGIN}/auth/callback?token=${token}`);
  }
);

export default router;
```

### Backend: Express Setup

Update `backend/src/index.ts`:

```typescript
import express from 'express';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';

const app = express();

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

// ... rest of your app
```

### Frontend: NextAuth Configuration

Create `frontend/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Here you could sync with your backend
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

### Frontend: Login Button

Create `frontend/src/components/auth/GoogleSignIn.tsx`:

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function GoogleSignIn() {
  return (
    <Button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="w-full"
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      Sign in with Google
    </Button>
  );
}
```

---

## 🧪 Testing

### Test Locally

1. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit: http://localhost:3000
4. Click "Sign in with Google"
5. Select your Google account
6. Should redirect to dashboard

### Verify Database

```bash
cd backend
npx prisma studio
```

Check `users` table - should see new user with:
- ✅ `googleId`
- ✅ `email`
- ✅ `username`
- ✅ `avatar` (Google profile pic)

---

## 🚀 Production Deployment

### 1. Update Google Cloud Console

Add production URLs to **Authorized redirect URIs** (PL: **Autoryzowane identyfikatory URI przekierowań**):
```
https://api.yourdomain.com/auth/google/callback
```

Add to **Authorized JavaScript origins** (PL: **Autoryzowane źródła JavaScript**):
```
https://yourdomain.com
https://api.yourdomain.com
```

### 2. Update Environment Variables

**Backend** (`backend/.env.production`):
```bash
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-secret"
GOOGLE_CALLBACK_URL="https://api.yourdomain.com/auth/google/callback"
CORS_ORIGIN="https://yourdomain.com"
```

**Frontend** (`frontend/.env.production`):
```bash
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-secret"
```

### 3. Publish OAuth App

In Google Cloud Console (PL: W Google Cloud Console):
1. Go to **OAuth consent screen** (PL: Przejdź do **Ekran zgody OAuth**)
2. Click **Publish App** (PL: Kliknij **Opublikuj aplikację**)
3. Submit for verification (optional, needed for 100+ users) (PL: Prześlij do weryfikacji - opcjonalnie, potrzebne dla 100+ użytkowników)

---

## 🔒 Security Best Practices

### Secrets Management

**Never commit secrets to Git!**

✅ Use `.env` files (ignored by Git)  
✅ Use environment variables in production  
✅ Use secret managers (AWS Secrets Manager, Doppler, etc.)  

### Generate Strong Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### HTTPS in Production

Google OAuth **requires HTTPS** in production:
- Use Let's Encrypt (free SSL)
- Configure Nginx with SSL
- See: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### ❓ Nie widzę "Credentials" / "Dane logowania"

**Problem**: Jesteś w złym miejscu (np. w "Library" / "Biblioteka")

**Rozwiązanie**:
1. W menu po lewej kliknij: **Interfejsy API i usługi**
2. Potem kliknij: **Dane logowania** (lub użyj linku: https://console.cloud.google.com/apis/credentials)
3. Jeśli nie masz projektu - najpierw **Utwórz projekt** (u góry: "Wybierz projekt" → "Nowy projekt")

### Error: `redirect_uri_mismatch`

**Problem**: Callback URL doesn't match Google Console configuration

**Solution**:
1. Check `GOOGLE_CALLBACK_URL` in `.env`
2. Verify **Authorized redirect URIs** in Google Console
3. Make sure they **exactly match** (including http/https)

### Error: `invalid_client`

**Problem**: Wrong Client ID or Secret

**Solution**:
1. Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Regenerate credentials in Google Console if needed
3. Make sure no extra spaces in `.env` file

### Error: `Access blocked: This app's request is invalid`

**Problem**: Scopes not configured properly

**Solution**:
1. Go to Google Console → **OAuth consent screen**
2. Add scopes: `email` and `profile`
3. Save and try again

### Users Can't Sign In

**Problem**: App not published

**Solution**:
1. Add test users in Google Console
2. Or publish the app (see Production section above)

---

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js App Router Guide](https://nextjs.org/docs/app)

---

## 🎉 You're Done!

Users can now sign in with their Google accounts in **2 clicks**! 🚀

**No passwords. No registration forms. Just fast, secure authentication.**

Need help? Check the [main README](../README.md) or open an issue.
