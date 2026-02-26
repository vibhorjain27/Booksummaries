import { Router } from 'express';
import { authRequired } from '../auth/middleware.js';
import { store } from '../../db/store.js';

export const adminRoutes = Router();

adminRoutes.get('/pipeline/jobs', authRequired, (_req, res) => {
  const queuedSources = store.bookSources.filter((s) => s.fetchStatus === 'queued').length;
  const failedSources = store.bookSources.filter((s) => s.fetchStatus === 'failed').length;

  res.json({
    queued_sources: queuedSources,
    failed_sources: failedSources,
    total_sources: store.bookSources.length,
    notes: 'MVP admin snapshot. Integrate persistent job metrics in production.'
  });
});
