import { z } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

export const paginationSchema = z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────
// Item schemas
// ─────────────────────────────────────────────

export const ItemTypeEnum = z.enum(['runeword', 'unique', 'set', 'rare', 'magic', 'normal']);
export const RealmEnum    = z.enum(['Americas', 'Europe', 'Asia']);
export const GameModeEnum = z.enum(['SC', 'HC', 'SCL', 'HCL']);
export const ItemStatusEnum = z.enum(['active', 'sold', 'deleted']);

const StatSchema = z.object({
  name:     z.string().min(1),
  value:    z.string(),
  variable: z.boolean().optional(),
});

export const ItemDataSchema = z.object({
  name:     z.string().min(1).max(120),
  baseItem: z.string().min(1).max(120),
  type:     ItemTypeEnum,
  runes:    z.array(z.string()).optional(),
  ethereal: z.boolean().optional(),
  sockets:  z.number().int().min(0).max(6).optional(),
  stats:    z.array(StatSchema),
  quality:  z.string().optional(),
});

export const PriceSchema = z.discriminatedUnion('type', [
  z.object({
    type:     z.literal('fiat'),
    amount:   z.number().positive(),
    currency: z.string().length(3).toUpperCase(),
  }),
  z.object({
    type:     z.literal('crypto'),
    amount:   z.number().positive(),
    currency: z.string().min(2).max(10).toUpperCase(),
  }),
  z.object({
    type:        z.literal('barter'),
    description: z.string().min(3).max(500),
  }),
]);

export const CreateItemSchema = z.object({
  itemData:    ItemDataSchema,
  price:       PriceSchema,
  description: z.string().max(2000).optional(),
  realm:       RealmEnum,
  gameMode:    GameModeEnum,
  rawText:     z.string().min(1),
});

export const UpdateItemSchema = z.object({
  price:       PriceSchema.optional(),
  description: z.string().max(2000).optional(),
  status:      z.enum(['active', 'deleted']).optional(),
}).strict();

export const ItemsQuerySchema = paginationSchema.extend({
  realm:     RealmEnum.optional(),
  gameMode:  GameModeEnum.optional(),
  type:      ItemTypeEnum.optional(),
  status:    ItemStatusEnum.optional(),
  search:    z.string().max(100).optional(),
  sortBy:    z.enum(['createdAt', 'views']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─────────────────────────────────────────────
// Transaction schemas
// ─────────────────────────────────────────────

export const TransactionStatusEnum = z.enum(['pending', 'completed', 'disputed', 'cancelled']);

export const CreateTransactionSchema = z.object({
  itemId:     z.string().uuid(),
  buyerNotes: z.string().max(1000).optional(),
});

export const ConfirmTransactionSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export const ReportTransactionSchema = z.object({
  reason:  z.string().min(10).max(500),
  details: z.string().max(2000).optional(),
});

export const TransactionsQuerySchema = paginationSchema.extend({
  role:   z.enum(['buyer', 'seller', 'all']).default('all'),
  status: TransactionStatusEnum.optional(),
});

// ─────────────────────────────────────────────
// Message schemas
// ─────────────────────────────────────────────

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
});

export const MessagesQuerySchema = paginationSchema.extend({
  before: z.string().uuid().optional(), // cursor: messages before this ID
});

// ─────────────────────────────────────────────
// User / profile schemas
// ─────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  battleTag: z.string().max(50).optional().nullable(),
  bio:       z.string().max(500).optional().nullable(),
}).strict();

// ─────────────────────────────────────────────
// Rating schemas
// ─────────────────────────────────────────────

export const CreateRatingSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ─────────────────────────────────────────────
// TS types inferred from schemas
// ─────────────────────────────────────────────

export type CreateItemDto         = z.infer<typeof CreateItemSchema>;
export type UpdateItemDto         = z.infer<typeof UpdateItemSchema>;
export type ItemsQuery            = z.infer<typeof ItemsQuerySchema>;
export type CreateTransactionDto  = z.infer<typeof CreateTransactionSchema>;
export type ConfirmTransactionDto = z.infer<typeof ConfirmTransactionSchema>;
export type ReportTransactionDto  = z.infer<typeof ReportTransactionSchema>;
export type TransactionsQuery     = z.infer<typeof TransactionsQuerySchema>;
export type SendMessageDto        = z.infer<typeof SendMessageSchema>;
export type MessagesQuery         = z.infer<typeof MessagesQuerySchema>;
export type UpdateProfileDto      = z.infer<typeof UpdateProfileSchema>;
export type CreateRatingDto       = z.infer<typeof CreateRatingSchema>;

// ─────────────────────────────────────────────
// asyncHandler — eliminates try-catch boilerplate.
// Thrown errors flow to the global error middleware.
// ─────────────────────────────────────────────

export const asyncHandler = (
  fn: (req: any, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
