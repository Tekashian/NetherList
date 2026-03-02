import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import type { UpdateProfileDto } from '../types';

// ─── select helpers ───────────────────────────────────────────────────────────

const publicProfileSelect = {
  id:        true,
  username:  true,
  avatar:    true,
  battleTag: true,
  bio:       true,
  createdAt: true,
  reputation: {
    select: {
      averageRating:         true,
      totalRatings:          true,
      rating5Count:          true,
      rating4Count:          true,
      rating3Count:          true,
      rating2Count:          true,
      rating1Count:          true,
      completedTransactions: true,
    },
  },
  _count: {
    select: {
      items: true,
    },
  },
};

const privateProfileSelect = {
  ...publicProfileSelect,
  email:     true,
  updatedAt: true,
};

// ─── service ─────────────────────────────────────────────────────────────────

export const UsersService = {

  /**
   * Full private profile for the authenticated user themselves.
   */
  async getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: privateProfileSelect,
    });

    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  /**
   * Public profile visible to anyone (by username).
   */
  async getPublicProfile(username: string) {
    const user = await prisma.user.findUnique({
      where:  { username },
      select: publicProfileSelect,
    });

    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  /**
   * Update mutable profile fields (battleTag, bio).
   * Returns the updated private profile so the frontend stays in sync.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return prisma.user.update({
      where: { id: userId },
      data:  {
        ...(dto.battleTag !== undefined && { battleTag: dto.battleTag }),
        ...(dto.bio       !== undefined && { bio:       dto.bio }),
      },
      select: privateProfileSelect,
    });
  },

  /**
   * Lightweight stats block used on the dashboard header.
   */
  async getDashboardSummary(userId: string) {
    const [reputation, activeListings, unreadCount, pendingCount] = await Promise.all([
      prisma.userReputation.findUnique({
        where:  { userId },
        select: { averageRating: true, totalRatings: true, completedTransactions: true },
      }),
      prisma.item.count({ where: { userId, status: 'active' } }),
      prisma.message.count({
        where: {
          senderId: { not: userId },
          read:     false,
          transaction: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        },
      }),
      prisma.transaction.count({
        where: {
          status: 'pending',
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      }),
    ]);

    return {
      averageRating:         reputation?.averageRating        ?? 0,
      totalRatings:          reputation?.totalRatings         ?? 0,
      completedTransactions: reputation?.completedTransactions ?? 0,
      activeListings,
      unreadMessages:  unreadCount,
      pendingTrades:   pendingCount,
    };
  },

};
