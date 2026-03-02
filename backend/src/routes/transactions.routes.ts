import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  asyncHandler,
  CreateTransactionSchema,
  ConfirmTransactionSchema,
  ReportTransactionSchema,
  TransactionsQuerySchema,
  CreateRatingSchema,
} from '../types';
import { TransactionsService } from '../services/transactions.service';

const router = Router();

// All transaction routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/transactions
 * Initiate a trade on an active item.
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const dto = CreateTransactionSchema.parse(req.body);
    const tx  = await TransactionsService.create(req.user!.id, dto);
    res.status(201).json({ success: true, data: tx });
  }),
);

/**
 * GET /api/v1/transactions
 * User's transactions. ?role=buyer|seller|all  ?status=pending|...
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const query  = TransactionsQuerySchema.parse(req.query);
    const result = await TransactionsService.getForUser(req.user!.id, query);
    res.json({ success: true, ...result });
  }),
);

/**
 * GET /api/v1/transactions/:id
 * Single transaction (participants only).
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const tx = await TransactionsService.getById(id, req.user!.id);
    res.json({ success: true, data: tx });
  }),
);

/**
 * POST /api/v1/transactions/:id/confirm
 * Confirm your side of the trade. Both confirmed -> auto-completes.
 */
router.post(
  '/:id/confirm',
  asyncHandler(async (req: Request, res: Response) => {
    const id  = req.params['id'] as string;
    const dto = ConfirmTransactionSchema.parse(req.body);
    const tx  = await TransactionsService.confirm(id, req.user!.id, dto);
    res.json({ success: true, data: tx });
  }),
);

/**
 * POST /api/v1/transactions/:id/report
 * Report a dispute. Transitions status -> 'disputed'.
 */
router.post(
  '/:id/report',
  asyncHandler(async (req: Request, res: Response) => {
    const id  = req.params['id'] as string;
    const dto = ReportTransactionSchema.parse(req.body);
    const tx  = await TransactionsService.report(id, req.user!.id, dto);
    res.json({ success: true, data: tx });
  }),
);

/**
 * POST /api/v1/transactions/:id/rate
 * Leave a rating for the counterparty after completion.
 */
router.post(
  '/:id/rate',
  asyncHandler(async (req: Request, res: Response) => {
    const id     = req.params['id'] as string;
    const dto    = CreateRatingSchema.parse(req.body);
    const rating = await TransactionsService.rate(id, req.user!.id, dto);
    res.status(201).json({ success: true, data: rating });
  }),
);

export default router;
