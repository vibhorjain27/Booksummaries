import { Router } from 'express';
import { z } from 'zod';
import type { IngestBookRequest } from '@distill/contracts';
import { authRequired } from '../auth/middleware.js';
import { enqueueIngest, validateContentPolicy } from '../../services/pipeline.service.js';
import { prisma } from '../../db/prisma.js';

const ingestSchema = z.object({
  source_url: z.string().url(),
  title_hint: z.string().optional(),
  author_hint: z.string().optional()
});

export const booksRoutes = Router();

booksRoutes.post('/ingest', authRequired, async (req, res) => {
  const parsed = ingestSchema.safeParse(req.body as IngestBookRequest);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    return;
  }

  const policy = validateContentPolicy(parsed.data.source_url);
  if (!policy.allowed) {
    res.status(403).json({ message: policy.reason });
    return;
  }

  const ingest_job_id = await enqueueIngest({
    sourceUrl: parsed.data.source_url,
    titleHint: parsed.data.title_hint,
    authorHint: parsed.data.author_hint
  });

  res.status(202).json({ ingest_job_id, status: 'queued' });
});

booksRoutes.get('/:id/distillation', authRequired, async (req, res) => {
  const bookId = req.params.id;
  const distillation = await prisma.distillation.findFirst({
    where: { bookId, status: 'published' },
    orderBy: { version: 'desc' }
  });

  if (!distillation) {
    res.status(404).json({ message: 'Distillation not found' });
    return;
  }

  const chapterSummaries = await prisma.distilledChapter.findMany({
    where: { distillationId: distillation.id },
    orderBy: { chapterNumber: 'asc' }
  });

  res.json({
    book_summary: distillation.bookSummary,
    chapter_summaries: chapterSummaries.map((chapter) => ({
      id: chapter.id,
      distillationId: chapter.distillationId,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      summary: chapter.summary,
      contextWhyItMatters: chapter.contextWhyItMatters,
      estimatedMinutes: chapter.estimatedMinutes,
      sourceSpanRefs: chapter.sourceSpanRefs
    })),
    context_threads: distillation.contextThreads,
    total_estimated_minutes: distillation.totalEstimatedMinutes
  });
});
