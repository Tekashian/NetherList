import { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Extend Express.User globally so req.user carries our fields on every Request.
 * @types/passport already adds `user?: Express.User` to Request — we just
 * fill in the shape so TypeScript knows what lives there.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      email: string;
      username: string;
    }
  }
}

// Convenience alias kept for any callers that import AuthRequest
export type AuthRequest = Request;

interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

function extractToken(req: Request): string | null {
  const header = req.headers['authorization'];
  if (header?.startsWith('Bearer ')) return header.substring(7);
  return null;
}

/**
 * authMiddleware — requires a valid Bearer JWT.
 * Sets req.user or returns 401.
 */
export const authMiddleware: RequestHandler = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

/**
 * optionalAuth — attaches req.user if a valid token is present,
 * but never blocks the request. Use on public routes that show
 * extra data when a user is logged in.
 */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
    } catch {
      // ignore invalid token for optional auth
    }
  }

  next();
};

export default authMiddleware;
