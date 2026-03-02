import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import type {
  CreateTransactionDto,
  ConfirmTransactionDto,
  ReportTransactionDto,
  TransactionsQuery,
  CreateRatingDto,
} from '../types';

// ─── select helpers ───────────────────────────────────────────────────────────

const partySelect = {
  id:       true,
  username: true,
  avatar:   true,
} satisfies Prisma.UserSelect;

const transactionSelect = {
  id:              true,
  itemId:          true,
  buyerId:         true,
  sellerId:        true,
  status:          true,
  buyerConfirmed:  true,
  sellerConfirmed: true,
  buyerNotes:      true,
  sellerNotes:     true,
  reportReason:    true,
  completedAt:     true,
  createdAt:       true,
  updatedAt:       true,
  item: {
    select: {
      id:       true,
      itemData: true,
      price:    true,
      realm:    true,
      gameMode: true,
      status:   true,
    },
  },
  buyer:  { select: partySelect },
  seller: { select: partySelect },
  _count: { select: { messages: true, ratings: true } },
} satisfies Prisma.TransactionSelect;

// ─── helpers ──────────────────────────────────────────────────────────────────

function assertParticipant(tx: { buyerId: string; sellerId: string }, userId: string) {
  if (tx.buyerId !== userId && tx.sellerId !== userId) {
    throw new ForbiddenError('You are not a participant in this transaction');
  }
}

/**
 * Upserts UserReputation after a rating is submitted.
 * Uses a raw SQL expression so we never read-then-write (race-free).
 */
async function refreshReputation(ratedUserId: string): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO user_reputation (
      "userId", "averageRating", "totalRatings",
      "rating5Count", "rating4Count", "rating3Count", "rating2Count", "rating1Count",
      "completedTransactions", "lastUpdated"
    )
    SELECT
      r."ratedUserId",
      ROUND(AVG(r.rating)::numeric, 2),
      COUNT(*),
      COUNT(*) FILTER (WHERE r.rating = 5),
      COUNT(*) FILTER (WHERE r.rating = 4),
      COUNT(*) FILTER (WHERE r.rating = 3),
      COUNT(*) FILTER (WHERE r.rating = 2),
      COUNT(*) FILTER (WHERE r.rating = 1),
      (SELECT COUNT(*) FROM transactions
        WHERE ("buyerId" = r."ratedUserId" OR "sellerId" = r."ratedUserId")
          AND status = 'completed'),
      NOW()
    FROM ratings r
    WHERE r."ratedUserId" = ${ratedUserId}
    GROUP BY r."ratedUserId"
    ON CONFLICT ("userId") DO UPDATE SET
      "averageRating"         = EXCLUDED."averageRating",
      "totalRatings"          = EXCLUDED."totalRatings",
      "rating5Count"          = EXCLUDED."rating5Count",
      "rating4Count"          = EXCLUDED."rating4Count",
      "rating3Count"          = EXCLUDED."rating3Count",
      "rating2Count"          = EXCLUDED."rating2Count",
      "rating1Count"          = EXCLUDED."rating1Count",
      "completedTransactions" = EXCLUDED."completedTransactions",
      "lastUpdated"           = NOW()
  `;
}

// ─── service ──────────────────────────────────────────────────────────────────

export const TransactionsService = {

  /**
   * Initiate a trade.  Validates:
   *  - item exists and is active
   *  - buyer is not the seller
   *  - no pending transaction for the same item already exists
   * Marks the item as 'sold' inside a transaction so it's atomic.
   */
  async create(buyerId: string, dto: CreateTransactionDto) {
    const item = await prisma.item.findUnique({
      where:  { id: dto.itemId },
      select: { userId: true, status: true },
    });

    if (!item || item.status === 'deleted') throw new NotFoundError('Item not found');
    if (item.status !== 'active')           throw new ConflictError('Item is no longer available');
    if (item.userId === buyerId)            throw new BadRequestError('You cannot buy your own item');

    // Check for existing pending transaction (race guard)
    const existing = await prisma.transaction.findFirst({
      where: { itemId: dto.itemId, status: 'pending' },
    });
    if (existing) throw new ConflictError('This item already has a pending transaction');

    return prisma.$transaction(async (tx) => {
      await tx.item.update({ where: { id: dto.itemId }, data: { status: 'sold' } });

      return tx.transaction.create({
        data: {
          itemId:     dto.itemId,
          buyerId,
          sellerId:   item.userId,
          buyerNotes: dto.buyerNotes ?? null,
          status:     'pending',
        },
        select: transactionSelect,
      });
    });
  },

  /**
   * List transactions for the authenticated user.
   * role: 'buyer' | 'seller' | 'all'
   */
  async getForUser(userId: string, query: TransactionsQuery) {
    const { page, limit, role, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      ...(status && { status }),
      ...(role === 'buyer'  && { buyerId:  userId }),
      ...(role === 'seller' && { sellerId: userId }),
      ...(role === 'all'    && { OR: [{ buyerId: userId }, { sellerId: userId }] }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        select:  transactionSelect,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total, page, limit, pages: Math.ceil(total / limit) };
  },

  /**
   * Single transaction — only accessible to participants.
   */
  async getById(id: string, userId: string) {
    const tx = await prisma.transaction.findUnique({
      where:  { id },
      select: transactionSelect,
    });

    if (!tx) throw new NotFoundError('Transaction not found');
    assertParticipant(tx, userId);

    return tx;
  },

  /**
   * Confirm transaction completion.
   * When both sides have confirmed → status transitions to 'completed'.
   */
  async confirm(id: string, userId: string, dto: ConfirmTransactionDto) {
    const tx = await prisma.transaction.findUnique({
      where:  { id },
      select: { buyerId: true, sellerId: true, status: true, buyerConfirmed: true, sellerConfirmed: true },
    });

    if (!tx)                throw new NotFoundError('Transaction not found');
    if (tx.status !== 'pending') throw new ConflictError(`Transaction is already ${tx.status}`);
    assertParticipant(tx, userId);

    const isBuyer  = tx.buyerId  === userId;
    const isSeller = tx.sellerId === userId;

    const alreadyConfirmed =
      (isBuyer  && tx.buyerConfirmed)  ||
      (isSeller && tx.sellerConfirmed);

    if (alreadyConfirmed) throw new ConflictError('You have already confirmed this transaction');

    const update: Prisma.TransactionUpdateInput = {
      ...(isBuyer  && { buyerConfirmed:  true, buyerNotes:  dto.notes ?? null }),
      ...(isSeller && { sellerConfirmed: true, sellerNotes: dto.notes ?? null }),
    };

    const willComplete = isBuyer
      ? tx.sellerConfirmed
      : tx.buyerConfirmed;

    if (willComplete) {
      update.status      = 'completed';
      update.completedAt = new Date();
    }

    return prisma.transaction.update({
      where:  { id },
      data:   update,
      select: transactionSelect,
    });
  },

  /**
   * Mark a transaction as disputed and record the report.
   */
  async report(id: string, userId: string, dto: ReportTransactionDto) {
    const tx = await prisma.transaction.findUnique({
      where:  { id },
      select: { buyerId: true, sellerId: true, status: true, reportedBy: true },
    });

    if (!tx)                throw new NotFoundError('Transaction not found');
    assertParticipant(tx, userId);
    if (tx.status === 'completed') throw new ConflictError('Cannot report a completed transaction');
    if (tx.reportedBy)             throw new ConflictError('Transaction already reported');

    return prisma.transaction.update({
      where: { id },
      data:  {
        reportedBy:   userId,
        reportReason: dto.reason,
        reportDetails: dto.details ?? null,
        reportedAt:   new Date(),
        status:       'disputed',
      },
      select: transactionSelect,
    });
  },

  /**
   * Submit a rating for the counterparty after transaction is completed.
   * Automatically refreshes UserReputation via atomic SQL upsert.
   */
  async rate(transactionId: string, raterId: string, dto: CreateRatingDto) {
    const transaction = await prisma.transaction.findUnique({
      where:  { id: transactionId },
      select: { buyerId: true, sellerId: true, status: true },
    });

    if (!transaction)                 throw new NotFoundError('Transaction not found');
    if (transaction.status !== 'completed') throw new ConflictError('Can only rate completed transactions');
    assertParticipant(transaction, raterId);

    const ratedUserId =
      transaction.buyerId === raterId
        ? transaction.sellerId
        : transaction.buyerId;

    const rating = await prisma.rating.create({
      data: {
        transactionId,
        raterId,
        ratedUserId,
        rating:  dto.rating,
        comment: dto.comment ?? null,
      },
      select: {
        id:          true,
        rating:      true,
        comment:     true,
        createdAt:   true,
        ratedUser:   { select: { id: true, username: true } },
      },
    });

    // Async reputation refresh — don't block the response
    refreshReputation(ratedUserId).catch(() => { /* log elsewhere */ });

    return rating;
  },

};
