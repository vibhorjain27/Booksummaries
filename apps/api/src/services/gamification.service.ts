import type { BadgeAward } from '@distill/contracts';
import { ids, store } from '../db/store.js';
import { isNewDay, nowIso } from '../utils/time.js';

const BADGES: Array<{ code: BadgeAward['badgeCode']; rule: (userId: string) => boolean }> = [
  {
    code: 'first_book',
    rule: (userId) => store.progress.some((p) => p.userId === userId && p.completed)
  },
  {
    code: 'seven_day_streak',
    rule: (userId) => (store.users.find((u) => u.id === userId)?.streakCount ?? 0) >= 7
  },
  {
    code: 'thirty_chapters',
    rule: (userId) => {
      const chapterCount = store.progress
        .filter((p) => p.userId === userId)
        .reduce((sum, p) => sum + p.completedChapterIds.length, 0);
      return chapterCount >= 30;
    }
  }
];

export const applyChapterCompletion = (userId: string, bookId: string, chapterId: string, readingSeconds: number) => {
  const user = store.users.find((item) => item.id === userId);
  const progress = store.progress.find((item) => item.userId === userId && item.bookId === bookId);
  const distillation = store.distillations.find((item) => item.bookId === bookId && item.status === 'published');

  if (!user || !progress || !distillation) {
    throw new Error('Missing user/progress/distillation');
  }

  const chapterAlreadyCompleted = progress.completedChapterIds.includes(chapterId);

  if (!chapterAlreadyCompleted) {
    progress.completedChapterIds.push(chapterId);
    user.xp += 20;
  }

  progress.readingSeconds += Math.max(readingSeconds, 0);
  progress.currentChapter = progress.completedChapterIds.length + 1;
  progress.updatedAt = nowIso();

  const totalChapters = store.chapters.filter((c) => c.distillationId === distillation.id).length;
  if (progress.completedChapterIds.length >= totalChapters) {
    if (!progress.completed) {
      progress.completed = true;
      user.xp += 100;
      const assignment = store.assignments.find((a) => a.userId === userId && a.bookId === bookId && !a.locked);
      if (assignment) assignment.locked = true;
    }
  }

  const qualifiesForStreak = readingSeconds >= 900 || !chapterAlreadyCompleted;
  if (qualifiesForStreak) {
    if (!user.lastStreakAt || isNewDay(user.lastStreakAt, user.timezone)) {
      user.streakCount += 1;
      user.lastStreakAt = nowIso();
    }
  }

  store.gamificationEvents.push({
    id: ids.event(),
    userId,
    type: 'chapter_completed',
    deltaXp: 20,
    createdAt: nowIso()
  });

  const unlocked = unlockBadges(userId);

  return {
    xp: user.xp,
    streak_count: user.streakCount,
    completion_percent: Math.min(100, Math.round((progress.completedChapterIds.length / totalChapters) * 100)),
    unlocked_badges: unlocked
  };
};

export const unlockBadges = (userId: string): BadgeAward[] => {
  const now = nowIso();
  const unlocked: BadgeAward[] = [];

  for (const badge of BADGES) {
    const already = store.badges.find((b) => b.userId === userId && b.badgeCode === badge.code);
    if (already || !badge.rule(userId)) continue;

    const award: BadgeAward = {
      id: ids.badge(),
      userId,
      badgeCode: badge.code,
      claimed: false,
      earnedAt: now
    };

    store.badges.push(award);
    unlocked.push(award);
  }

  return unlocked;
};

export const claimBadge = (userId: string, badgeCode: BadgeAward['badgeCode']): BadgeAward | null => {
  const badge = store.badges.find((item) => item.userId === userId && item.badgeCode === badgeCode);
  if (!badge) return null;
  badge.claimed = true;
  store.gamificationEvents.push({
    id: ids.event(),
    userId,
    type: 'badge_claimed',
    deltaXp: 0,
    createdAt: nowIso()
  });
  return badge;
};
