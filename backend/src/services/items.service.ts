import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';
import type { CreateItemDto, UpdateItemDto, ItemsQuery } from '../types';

// ─── response shape helpers ──────────────────────────────────────────────────

const ownerSelect = {
  id:       true,
  username: true,
  avatar:   true,
  reputation: {
    select: { averageRating: true, completedTransactions: true },
  },
} satisfies Prisma.UserSelect;

const itemSelect = (includeOwner = false) => ({
  id:          true,
  itemData:    true,
  price:       true,
  description: true,
  realm:       true,
  gameMode:    true,
  rawText:     true,
  status:      true,
  views:       true,
  createdAt:   true,
  updatedAt:   true,
  userId:      true,
  ...(includeOwner && { user: { select: ownerSelect } }),
});

// ─── service ─────────────────────────────────────────────────────────────────

export const ItemsService = {

  /**
   * Create a new item listing owned by userId.
   */
  async create(userId: string, dto: CreateItemDto) {
    return prisma.item.create({
      data: {
        userId,
        itemData:    dto.itemData    as Prisma.InputJsonValue,
        price:       dto.price       as Prisma.InputJsonValue,
        description: dto.description ?? null,
        realm:       dto.realm,
        gameMode:    dto.gameMode,
        rawText:     dto.rawText,
        status:      'active',
      },
      select: itemSelect(true),
    });
  },

  /**
   * Authenticated user's own listings.
   * Supports pagination + status filter.
   */
  async getMyItems(userId: string, query: ItemsQuery) {
    const { page, limit, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      userId,
      status: status ?? { not: 'deleted' },
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { [sortBy]: sortOrder },
        select:  itemSelect(false),
      }),
      prisma.item.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  /**
   * Public marketplace browse — only active items.
   * Supports realm / gameMode / type filters + full-text search on rawText.
   */
  async browse(query: ItemsQuery) {
    const { page, limit, realm, gameMode, type, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      status: 'active',
      ...(realm    && { realm }),
      ...(gameMode && { gameMode }),
      ...(type     && {
        itemData: { path: ['type'], equals: type },
      }),
      ...(search && {
        OR: [
          { rawText:     { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            itemData: {
              path:     ['name'],
              string_contains: search,
            },
          },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { [sortBy]: sortOrder },
        select:  itemSelect(true),
      }),
      prisma.item.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  /**
   * Single item by ID; increments views atomically (fire-and-forget).
   */
  async getById(id: string, requesterId?: string) {
    const item = await prisma.item.findUnique({
      where:  { id },
      select: itemSelect(true),
    });

    if (!item || item.status === 'deleted') throw new NotFoundError('Item not found');

    // Increment view counter only for non-owners
    if (requesterId !== item.userId) {
      prisma.item.update({ where: { id }, data: { views: { increment: 1 } } })
        .catch(() => { /* non-critical */ });
    }

    return item;
  },

  /**
   * Update price / description / status (active ↔ deleted only).
   * Only the owner may update.
   */
  async update(id: string, userId: string, dto: UpdateItemDto) {
    const item = await prisma.item.findUnique({ where: { id }, select: { userId: true, status: true } });
    if (!item || item.status === 'deleted') throw new NotFoundError('Item not found');
    if (item.userId !== userId)             throw new ForbiddenError('You do not own this item');

    return prisma.item.update({
      where: { id },
      data:  {
        ...(dto.price       && { price:       dto.price       as Prisma.InputJsonValue }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status      && { status:      dto.status }),
      },
      select: itemSelect(true),
    });
  },

  /**
   * Soft-delete (status → 'deleted'). Only owner; only while active.
   */
  async remove(id: string, userId: string) {
    const item = await prisma.item.findUnique({ where: { id }, select: { userId: true, status: true } });
    if (!item || item.status === 'deleted') throw new NotFoundError('Item not found');
    if (item.userId !== userId)             throw new ForbiddenError('You do not own this item');
    if (item.status === 'sold')             throw new ConflictError('Cannot delete a sold item');

    await prisma.item.update({ where: { id }, data: { status: 'deleted' } });
  },

};
