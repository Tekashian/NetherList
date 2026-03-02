import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler, SendMessageSchema, MessagesQuerySchema } from '../types';
import { MessagesService } from '../services/messages.service';

const router = Router();

// All message routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/messages/unread/count
 * Unread message count across all user's transactions (badge value).
 * NOTE: must be declared BEFORE /:transactionId to avoid being shadowed.
 */
router.get(
  '/unread/count',
  asyncHandler(async (req: Request, res: Response) => {
    const count = await MessagesService.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { count } });
  }),
);

/**
 * GET /api/v1/messages/:transactionId
 * Paginated message history. Also marks received messages as read.
 */
router.get(
  '/:transactionId',
  asyncHandler(async (req: Request, res: Response) => {
    const transactionId = req.params['transactionId'] as string;
    const query         = MessagesQuerySchema.parse(req.query);
    const result        = await MessagesService.getMessages(transactionId, req.user!.id, query);
    res.json({ success: true, ...result });
  }),
);

/**
 * POST /api/v1/messages/:transactionId
 * Send a message in a transaction thread.
 */
router.post(
  '/:transactionId',
  asyncHandler(async (req: Request, res: Response) => {
    const transactionId = req.params['transactionId'] as string;
    const dto           = SendMessageSchema.parse(req.body);
    const message       = await MessagesService.send(transactionId, req.user!.id, dto);
    res.status(201).json({ success: true, data: message });
  }),
);

export default router;
