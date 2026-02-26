import type { BadgeAward } from '@distill/contracts';
import { prisma } from '../db/prisma.js';
import { isNewDay } from '../utils/time.js';

const BADGES: Array<{ code: BadgeAward['badgeCode']; rule: (userId: string) => Promise<boolean> }> = [
  {
    code: 'first_book',
    rule: async (userId) => Boolean(await prisma.readingProgress.findFirst({ where: { userId, completed: true } }))
  },
  {
    code: 'seven_day_streak',
    rule: async (userId) => ((await prisma.user.findUnique({ where: { id: userId } }))?.streakCount ?? 0) >= 7
  },
  {
    code: 'thirty_chapters',
    rule: async (userId) => {
      const progress = await prisma.readingProgress.findMany({ where: { userId }, select: { completedChapterIds: true } });
      const count = progress.reduce((sum, item) => sum + item.completedChapterIds.length, 0);
      return count >= 30;
    }
  }
];

export const applyChapterCompletion = async (
  userId: string,
  bookId: string,
  chapterId: string,
  readingSeconds: number
) => {
  const [user, progress, distillation] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.readingProgress.findUnique({ where: { userId_bookId: { userId, bookId } } }),
    prisma.distillation.findFirst({ where: { bookId, status: 'published' } })
  ]);

  if (!user || !progress || !distillation) {
    throw new Error('Missing user/progress/distillation');
  }

  const chapterAlreadyCompleted = progress.completedChapterIds.includes(chapterId);
  const completedChapterIds = chapterAlreadyCompleted ? progress.completedChapterIds : [...progress.completedChapterIds, chapterId];

  const totalChapters = await prisma.distilledChapter.count({ where: { distillationId: distillation.id } });
  const completedBook = !progress.completed && completedChapterIds.length >= totalChapters;

  let nextXp = user.xp + (chapterAlreadyCompleted ? 0 : 20) + (completedBook ? 100 : 0);
  let nextStreak = user.streakCount;
  let nextLastStreakAt = user.lastStreakAt;

  const qualifiesForStreak = readingSeconds >= 900 || !chapterAlreadyCompleted;
  if (qualifiesForStreak) {
    const shouldIncrement = !user.lastStreakAt || isNewDay(user.lastStreakAt.toISOString(), user.timezone);
    if (shouldIncrement) {
      nextStreak += 1;
      nextLastStreakAt = new Date();
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.readingProgress.update({
      where: { userId_bookId: { userId, bookId } },
      data: {
        completedChapterIds,
        readingSeconds: progress.readingSeconds + Math.max(readingSeconds, 0),
        currentChapter: completedChapterIds.length + 1,
        completed: progress.completed || completedBook
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        xp: nextXp,
        streakCount: nextStreak,
        lastStreakAt: nextLastStreakAt ?? undefined
      }
    });

    if (completedBook) {
      const assignment = await tx.dailyAssignment.findFirst({ where: { userId, bookId, locked: false } });
      if (assignment) {
        await tx.dailyAssignment.update({ where: { id: assignment.id }, data: { locked: true } });
      }
    }

    await tx.gamificationEvent.create({
      data: {
        userId,
        type: 'chapter_completed',
        deltaXp: chapterAlreadyCompleted ? 0 : 20
      }
    });
  });

  const unlocked = await unlockBadges(userId);

  return {
    xp: nextXp,
    streak_count: nextStreak,
    completion_percent: Math.min(100, Math.round((completedChapterIds.length / Math.max(totalChapters, 1)) * 100)),
    unlocked_badges: unlocked
  };
};

export const unlockBadges = async (userId: string): Promise<BadgeAward[]> => {
  const unlocked: BadgeAward[] = [];

  for (const badge of BADGES) {
    const already = await prisma.badgeAward.findUnique({ where: { userId_badgeCode: { userId, badgeCode: badge.code } } });
    if (already) continue;

    const shouldUnlock = await badge.rule(userId);
    if (!shouldUnlock) continue;

    const award = await prisma.badgeAward.create({
      data: {
        userId,
        badgeCode: badge.code,
        claimed: false
      }
    });

    unlocked.push({
      id: award.id,
      userId: award.userId,
      badgeCode: award.badgeCode,
      claimed: award.claimed,
      earnedAt: award.earnedAt.toISOString()
    });
  }

  return unlocked;
};

export const claimBadge = async (userId: string, badgeCode: BadgeAward['badgeCode']): Promise<BadgeAward | null> => {
  const badge = await prisma.badgeAward.findUnique({ where: { userId_badgeCode: { userId, badgeCode } } });
  if (!badge) return null;

  const updated = await prisma.badgeAward.update({
    where: { id: badge.id },
    data: { claimed: true }
  });

  await prisma.gamificationEvent.create({
    data: {
      userId,
      type: 'badge_claimed',
      deltaXp: 0
    }
  });

  return {
    id: updated.id,
    userId: updated.userId,
    badgeCode: updated.badgeCode,
    claimed: updated.claimed,
    earnedAt: updated.earnedAt.toISOString()
  };
};
