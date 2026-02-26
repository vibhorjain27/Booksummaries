import { Router } from 'express';
import { z } from 'zod';
import { authRequired } from '../auth/middleware.js';
import { store } from '../../db/store.js';

const querySchema = z.object({
  status: z.enum(['in_progress', 'completed', 'saved']).optional()
});

export const libraryRoutes = Router();

libraryRoutes.get('/', authRequired, (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid query', errors: parsed.error.flatten() });
    return;
  }

  const userId = req.userId as string;
  const userProgress = store.progress.filter((p) => p.userId === userId);

  const items = userProgress
    .map((progress) => {
      const book = store.books.find((b) => b.id === progress.bookId);
      if (!book) return null;
      const status = progress.completed ? 'completed' : 'in_progress';
      return {
        status,
        progress,
        book
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const filtered = parsed.data.status
    ? items.filter((item) => item.status === parsed.data.status)
    : items;

  res.json({
    page: 1,
    total: filtered.length,
    items: filtered
  });
});
