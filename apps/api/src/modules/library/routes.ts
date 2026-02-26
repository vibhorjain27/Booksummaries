import { Router } from 'express';
import { z } from 'zod';
import { authRequired } from '../auth/middleware.js';
import { prisma } from '../../db/prisma.js';

const querySchema = z.object({
  status: z.enum(['in_progress', 'completed', 'saved']).optional()
});

export const libraryRoutes = Router();

libraryRoutes.get('/', authRequired, async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid query', errors: parsed.error.flatten() });
    return;
  }

  const userId = req.userId as string;
  const userProgress = await prisma.readingProgress.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { updatedAt: 'desc' }
  });

  const items = userProgress.map((progress) => ({
    status: progress.completed ? 'completed' : 'in_progress',
    progress: {
      id: progress.id,
      userId: progress.userId,
      bookId: progress.bookId,
      currentChapter: progress.currentChapter,
      completedChapterIds: progress.completedChapterIds,
      readingSeconds: progress.readingSeconds,
      completed: progress.completed,
      updatedAt: progress.updatedAt.toISOString()
    },
    book: {
      id: progress.book.id,
      title: progress.book.title,
      author: progress.book.author,
      totalEstimatedMinutes: progress.book.totalEstimatedMinutes,
      coverUrl: progress.book.coverUrl ?? undefined
    }
  }));

  const filtered = parsed.data.status ? items.filter((item) => item.status === parsed.data.status) : items;

  res.json({
    page: 1,
    total: filtered.length,
    items: parsed.data.status === 'saved' ? [] : filtered
  });
});
