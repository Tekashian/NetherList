import { prisma } from '../config/database';
import { ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';
import type { SendMessageDto, MessagesQuery } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

async function assertParticipant(transactionId: string, userId: string) {
  const tx = await prisma.transaction.findUnique({
    where:  { id: transactionId },
    select: { buyerId: true, sellerId: true, status: true },
  });

  if (!tx) throw new NotFoundError('Transaction not found');

  if (tx.buyerId !== userId && tx.sellerId !== userId) {
    throw new ForbiddenError('You are not a participant in this transaction');
  }

  return tx;
}

// ─── service ──────────────────────────────────────────────────────────────────

export const MessagesService = {

  /**
   * Paginated message history for a transaction.
   * Marks all messages sent to the requester as read in one shot.
   */
  async getMessages(transactionId: string, userId: string, query: MessagesQuery) {
    await assertParticipant(transactionId, userId);

    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where:   { transactionId },
        skip,
        take:    limit,
        orderBy: { createdAt: 'asc' },
        select:  {
          id:        true,
          content:   true,
          read:      true,
          createdAt: true,
          sender: {
            select: { id: true, username: true, avatar: true },
          },
        },
      }),
      prisma.message.count({ where: { transactionId } }),
    ]);

    // mark unread messages NOT sent by this user as read
    prisma.message.updateMany({
      where: { transactionId, senderId: { not: userId }, read: false },
      data:  { read: true },
    }).catch(() => { /* non-critical, fire-and-forget */ });

    return { messages, total, page, limit, pages: Math.ceil(total / limit) };
  },

  /**
   * Send a message in a transaction thread.
   * Blocked if transaction is completed or cancelled.
   */
  async send(transactionId: string, senderId: string, dto: SendMessageDto) {
    const tx = await assertParticipant(transactionId, senderId);

    if (tx.status === 'completed' || tx.status === 'cancelled') {
      throw new ConflictError(`Cannot send messages in a ${tx.status} transaction`);
    }

    return prisma.message.create({
      data: { transactionId, senderId, content: dto.content },
      select: {
        id:        true,
        content:   true,
        read:      true,
        createdAt: true,
        sender: { select: { id: true, username: true, avatar: true } },
      },
    });
  },

  /**
   * Count of unread messages across all user's transactions.
   * Used for the dashboard notification badge.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.message.count({
      where: {
        senderId: { not: userId },
        read:     false,
        transaction: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      },
    });
  },

};
