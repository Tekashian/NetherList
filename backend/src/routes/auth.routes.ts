import express from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = express.Router();

/**
 * Initiate Google OAuth flow
 * GET /auth/google
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * Google OAuth callback
 * GET /auth/google/callback
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CORS_ORIGIN}/login?error=auth_failed`,
  }),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${env.CORS_ORIGIN}/login?error=no_user`);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${env.CORS_ORIGIN}/auth/callback?token=${token}`);
  }
);

/**
 * Get current user
 * GET /auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    res.json({
      success: true,
      data: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
});

/**
 * Logout (optional - token blacklist would go here)
 * POST /auth/logout
 */
router.post('/logout', (_req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
