import { Router, Request, Response } from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';
import { asyncHandler, CreateItemSchema, UpdateItemSchema, ItemsQuerySchema } from '../types';
import { ItemsService } from '../services/items.service';
import { parseD2RItem } from '../utils/parser';
import { BadRequestError } from '../utils/errors';

const router = Router();

/**
 * POST /api/v1/items
 * Create a new listing.
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const dto  = CreateItemSchema.parse(req.body);
    const item = await ItemsService.create(req.user!.id, dto);
    res.status(201).json({ success: true, data: item });
  }),
);

/**
 * POST /api/v1/items/parse
 * Parse raw D2R clipboard text → structured itemData preview.
 */
router.post(
  '/parse',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { rawText } = req.body as { rawText?: string };
    if (!rawText?.trim()) throw new BadRequestError('rawText is required');
    const parsed = parseD2RItem(rawText);
    if (!parsed)          throw new BadRequestError('Could not parse item text');
    res.json({ success: true, data: parsed });
  }),
);

/**
 * GET /api/v1/items/my
 * Authenticated user's own listings.
 */
router.get(
  '/my',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const query  = ItemsQuerySchema.parse(req.query);
    const result = await ItemsService.getMyItems(req.user!.id, query);
    res.json({ success: true, ...result });
  }),
);

/**
 * GET /api/v1/items
 * Public marketplace browse.
 */
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const query  = ItemsQuerySchema.parse(req.query);
    const result = await ItemsService.browse(query);
    res.json({ success: true, ...result });
  }),
);

/**
 * GET /api/v1/items/:id
 * Single item detail. View count incremented for non-owners.
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const id   = req.params['id'] as string;
    const item = await ItemsService.getById(id, req.user?.id);
    res.json({ success: true, data: item });
  }),
);

/**
 * PATCH /api/v1/items/:id
 * Update price / description / status. Owner only.
 */
router.patch(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const id   = req.params['id'] as string;
    const dto  = UpdateItemSchema.parse(req.body);
    const item = await ItemsService.update(id, req.user!.id, dto);
    res.json({ success: true, data: item });
  }),
);

/**
 * DELETE /api/v1/items/:id
 * Soft-delete. Owner only.
 */
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    await ItemsService.remove(id, req.user!.id);
    res.status(204).end();
  }),
);

export default router;
