import { prisma } from '../db/prisma.js';

const ensureQueuedNextBook = async (userId: string, currentBookId: string): Promise<void> => {
  const queuedExists = await prisma.dailyAssignment.findFirst({ where: { userId, locked: true } });
  if (queuedExists) return;

  const progressed = await prisma.readingProgress.findMany({ where: { userId }, select: { bookId: true } });
  const progressedIds = progressed.map((item) => item.bookId);

  const nextBook = await prisma.book.findFirst({
    where: {
      id: { not: currentBookId, notIn: progressedIds }
    },
    orderBy: { createdAt: 'asc' }
  });

  if (!nextBook) return;

  await prisma.dailyAssignment.create({
    data: {
      userId,
      bookId: nextBook.id,
      assignedAt: new Date(),
      locked: true
    }
  });
};

export const ensureActiveAssignment = async (userId: string): Promise<void> => {
  const existing = await prisma.dailyAssignment.findFirst({ where: { userId, locked: false } });
  if (existing) {
    await ensureQueuedNextBook(userId, existing.bookId);
    return;
  }

  const openProgress = await prisma.readingProgress.findFirst({ where: { userId, completed: false } });
  if (openProgress) {
    await prisma.dailyAssignment.create({
      data: {
        userId,
        bookId: openProgress.bookId,
        assignedAt: new Date(),
        locked: false
      }
    });

    await ensureQueuedNextBook(userId, openProgress.bookId);
    return;
  }

  const lockedNext = await prisma.dailyAssignment.findFirst({ where: { userId, locked: true }, orderBy: { assignedAt: 'asc' } });
  if (lockedNext) {
    await prisma.dailyAssignment.update({ where: { id: lockedNext.id }, data: { locked: false } });

    await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId, bookId: lockedNext.bookId } },
      update: {},
      create: {
        userId,
        bookId: lockedNext.bookId,
        currentChapter: 1,
        completedChapterIds: [],
        readingSeconds: 0,
        completed: false
      }
    });

    await ensureQueuedNextBook(userId, lockedNext.bookId);
    return;
  }

  const progressed = await prisma.readingProgress.findMany({ where: { userId }, select: { bookId: true } });
  const progressedIds = progressed.map((item) => item.bookId);

  const nextBook = await prisma.book.findFirst({
    where: { id: { notIn: progressedIds } },
    orderBy: { createdAt: 'asc' }
  });

  if (!nextBook) return;

  await prisma.$transaction([
    prisma.dailyAssignment.create({
      data: {
        userId,
        bookId: nextBook.id,
        assignedAt: new Date(),
        locked: false
      }
    }),
    prisma.readingProgress.create({
      data: {
        userId,
        bookId: nextBook.id,
        currentChapter: 1,
        completedChapterIds: [],
        readingSeconds: 0,
        completed: false
      }
    })
  ]);

  await ensureQueuedNextBook(userId, nextBook.id);
};

export const getActiveDaily = async (userId: string) => {
  await ensureActiveAssignment(userId);

  const active = await prisma.dailyAssignment.findFirst({ where: { userId, locked: false } });
  if (!active) {
    return { active_assignment: null, book: null, progress: null };
  }

  const [book, progress] = await Promise.all([
    prisma.book.findUnique({ where: { id: active.bookId } }),
    prisma.readingProgress.findUnique({ where: { userId_bookId: { userId, bookId: active.bookId } } })
  ]);

  return {
    active_assignment: {
      id: active.id,
      userId: active.userId,
      bookId: active.bookId,
      assignedAt: active.assignedAt.toISOString(),
      locked: active.locked
    },
    book: book
      ? {
          id: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl ?? undefined,
          totalEstimatedMinutes: book.totalEstimatedMinutes
        }
      : null,
    progress: progress
      ? {
          id: progress.id,
          userId: progress.userId,
          bookId: progress.bookId,
          currentChapter: progress.currentChapter,
          completedChapterIds: progress.completedChapterIds,
          readingSeconds: progress.readingSeconds,
          completed: progress.completed,
          updatedAt: progress.updatedAt.toISOString()
        }
      : null
  };
};
