import { Router } from 'express';
import { authRequired } from '../auth/middleware.js';
import { prisma } from '../../db/prisma.js';

export const adminRoutes = Router();

adminRoutes.get('/pipeline/jobs', authRequired, async (_req, res) => {
  const [queuedSources, failedSources, totalSources] = await Promise.all([
    prisma.bookSource.count({ where: { fetchStatus: 'queued' } }),
    prisma.bookSource.count({ where: { fetchStatus: 'failed' } }),
    prisma.bookSource.count()
  ]);

  res.json({
    queued_sources: queuedSources,
    failed_sources: failedSources,
    total_sources: totalSources,
    notes: 'MVP admin snapshot. Integrate persistent job metrics in production.'
  });
});
