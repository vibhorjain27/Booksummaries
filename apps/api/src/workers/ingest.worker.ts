import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { store, ids } from '../db/store.js';

export const startIngestWorker = (): Worker | null => {
  try {
    const worker = new Worker(
      'ingest-book',
      async (job) => {
        const source = store.bookSources.find((s) => s.sourceUrl === job.data.sourceUrl && s.fetchStatus === 'queued');
        if (source) source.fetchStatus = 'fetched';

        const title = job.data.titleHint ?? `Imported Book ${Date.now()}`;
        const author = job.data.authorHint ?? 'Unknown';

        const bookId = ids.book();
        const distillationId = ids.distillation();

        store.books.push({
          id: bookId,
          title,
          author,
          totalEstimatedMinutes: 60
        });

        store.distillations.push({
          id: distillationId,
          bookId,
          version: 1,
          bookSummary: 'Auto-generated one-hour distillation from imported PDF source.',
          contextThreads: [
            'Core thesis across all chapters',
            'Counterpoints and nuance',
            'Practical takeaway for long-term retention'
          ],
          totalEstimatedMinutes: 60,
          status: 'published'
        });

        for (let i = 1; i <= 10; i += 1) {
          store.chapters.push({
            id: ids.chapter(),
            distillationId,
            chapterNumber: i,
            title: `Chapter ${i}`,
            summary: `Generated chapter summary ${i}.`,
            contextWhyItMatters: 'This chapter is connected to the whole-book argument.',
            estimatedMinutes: 6,
            sourceSpanRefs: [`span-${i}`]
          });
        }
      },
      { connection: { url: env.REDIS_URL } }
    );

    worker.on('failed', (job, err) => {
      const source = store.bookSources.find((s) => s.sourceUrl === job?.data.sourceUrl);
      if (source) source.fetchStatus = 'failed';
      console.error('ingest job failed', err.message);
    });

    return worker;
  } catch {
    return null;
  }
};
