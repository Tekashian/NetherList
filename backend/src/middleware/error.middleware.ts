import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Centralized error handler.
 * Must be registered LAST in the Express middleware chain.
 *
 * Handles:
 *  - ZodError          → 422 with per-field issues
 *  - CustomError       → whatever statusCode was set
 *  - Prisma P2002      → 409 Conflict (unique violation)
 *  - Prisma P2025      → 404 Not Found
 *  - Everything else   → 500 (stack only in dev)
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // ── Zod validation errors ──────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: 'Validation failed',
      issues: err.errors.map((e) => ({
        field:   e.path.join('.'),
        message: e.message,
        code:    e.code,
      })),
    });
    return;
  }

  // ── Custom operational errors ──────────────────────────────────────
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // ── Prisma known errors ────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.['target'] as string[] | undefined)?.join(', ') ?? 'field';
      res.status(409).json({ success: false, error: `Duplicate value on: ${fields}` });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Record not found' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ success: false, error: 'Referenced record does not exist' });
      return;
    }
  }

  // ── Unknown / programming errors ──────────────────────────────────
  const message = err instanceof Error ? err.message : 'Unknown error';
  const stack   = err instanceof Error ? err.stack   : undefined;

  logger.error('Unhandled error', {
    message,
    stack,
    method: req.method,
    url:    req.originalUrl,
  });

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { message, stack }),
  });
};
