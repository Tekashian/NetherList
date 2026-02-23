import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './database';
import { env } from './env';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Check if user exists by Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        // If user doesn't exist, create new user
        if (!user) {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // Generate username from email or display name
          const username =
            profile.displayName?.replace(/\s+/g, '').toLowerCase() ||
            email.split('@')[0];

          // Check if username already exists, if so append random number
          let finalUsername: string = username;
          const existingUser = await prisma.user.findUnique({
            where: { username: finalUsername },
          });
          
          if (existingUser) {
            finalUsername = `${username}${Math.floor(Math.random() * 10000)}`;
          }

          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email,
              username: finalUsername,
              avatar: profile.photos?.[0]?.value || null,
            },
          });

          console.log('✅ New user created:', user.email);
        } else {
          console.log('✅ Existing user logged in:', user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        return done(error as Error);
      }
    }
  )
);

export default passport;
