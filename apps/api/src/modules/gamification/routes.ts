import { Router } from 'express';
import { z } from 'zod';
import type { ClaimBadgeRequest } from '@distill/contracts';
import { authRequired } from '../auth/middleware.js';
import { claimBadge } from '../../services/gamification.service.js';
import { prisma } from '../../db/prisma.js';

const claimSchema = z.object({
  badge_code: z.enum(['first_book', 'seven_day_streak', 'thirty_chapters'])
});

export const gamificationRoutes = Router();

gamificationRoutes.get('/summary', authRequired, async (req, res) => {
  const userId = req.userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const badges = await prisma.badgeAward.findMany({ where: { userId }, orderBy: { earnedAt: 'asc' } });

  res.json({
    xp: user.xp,
    streak_count: user.streakCount,
    level: Math.floor(user.xp / 250) + 1,
    badges: badges.map((badge) => ({
      id: badge.id,
      userId: badge.userId,
      badgeCode: badge.badgeCode,
      claimed: badge.claimed,
      earnedAt: badge.earnedAt.toISOString()
    }))
  });
});

gamificationRoutes.post('/claim', authRequired, async (req, res) => {
  const parsed = claimSchema.safeParse(req.body as ClaimBadgeRequest);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    return;
  }

  const badge = await claimBadge(req.userId as string, parsed.data.badge_code);
  res.json({ success: Boolean(badge), badge });
});
