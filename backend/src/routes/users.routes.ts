import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler, UpdateProfileSchema } from '../types';
import { UsersService } from '../services/users.service';

const router = Router();

/**
 * GET /api/v1/users/me
 * Private profile + dashboard summary stats.
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const [profile, summary] = await Promise.all([
      UsersService.getMyProfile(req.user!.id),
      UsersService.getDashboardSummary(req.user!.id),
    ]);
    res.json({ success: true, data: { ...profile, summary } });
  }),
);

/**
 * PATCH /api/v1/users/me
 * Update battleTag and/or bio.
 */
router.patch(
  '/me',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const dto     = UpdateProfileSchema.parse(req.body);
    const profile = await UsersService.updateProfile(req.user!.id, dto);
    res.json({ success: true, data: profile });
  }),
);

/**
 * GET /api/v1/users/:username
 * Public profile (anyone can view).
 */
router.get(
  '/:username',
  asyncHandler(async (req: Request, res: Response) => {
    const username = req.params['username'] as string;
    const profile  = await UsersService.getPublicProfile(username);
    res.json({ success: true, data: profile });
  }),
);

export default router;
