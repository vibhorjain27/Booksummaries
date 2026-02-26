import { Router } from 'express';
import { z } from 'zod';
import type { CompleteChapterRequest } from '@distill/contracts';
import { authRequired } from '../auth/middleware.js';
import { getActiveDaily } from '../../services/daily.service.js';
import { applyChapterCompletion } from '../../services/gamification.service.js';

const completeSchema = z.object({
  book_id: z.string().min(1),
  chapter_id: z.string().min(1),
  reading_seconds: z.number().int().nonnegative()
});

export const dailyRoutes = Router();

dailyRoutes.get('/active', authRequired, (req, res) => {
  const userId = req.userId as string;
  res.json(getActiveDaily(userId));
});

dailyRoutes.post('/complete-chapter', authRequired, (req, res) => {
  const parsed = completeSchema.safeParse(req.body as CompleteChapterRequest);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    return;
  }

  try {
    const userId = req.userId as string;
    const result = applyChapterCompletion(
      userId,
      parsed.data.book_id,
      parsed.data.chapter_id,
      parsed.data.reading_seconds
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
});
