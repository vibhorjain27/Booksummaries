import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';

export const startIngestWorker = (): Worker | null => {
  try {
    const worker = new Worker(
      'ingest-book',
      async (job) => {
        const sourceUrl = job.data.sourceUrl;

        await prisma.bookSource.updateMany({
          where: { sourceUrl, fetchStatus: 'queued' },
          data: { fetchStatus: 'fetched' }
        });

        const title = job.data.titleHint ?? `Imported Book ${Date.now()}`;
        const author = job.data.authorHint ?? 'Unknown';

        const book = await prisma.book.create({
          data: {
            title,
            author,
            totalEstimatedMinutes: 60
          }
        });

        const distillation = await prisma.distillation.create({
          data: {
            bookId: book.id,
            version: 1,
            bookSummary: 'Auto-generated one-hour distillation from imported PDF source.',
            contextThreads: [
              'Core thesis across all chapters',
              'Counterpoints and nuance',
              'Practical takeaway for long-term retention'
            ],
            totalEstimatedMinutes: 60,
            status: 'published'
          }
        });

        const chapters = Array.from({ length: 10 }).map((_, i) => ({
          distillationId: distillation.id,
          chapterNumber: i + 1,
          title: `Chapter ${i + 1}`,
          summary: `Generated chapter summary ${i + 1}.`,
          contextWhyItMatters: 'This chapter is connected to the whole-book argument.',
          estimatedMinutes: 6,
          sourceSpanRefs: [`span-${i + 1}`]
        }));

        await prisma.distilledChapter.createMany({ data: chapters });
      },
      { connection: { url: env.REDIS_URL } }
    );

    worker.on('failed', async (job, err) => {
      if (job?.data.sourceUrl) {
        await prisma.bookSource.updateMany({
          where: { sourceUrl: job.data.sourceUrl },
          data: { fetchStatus: 'failed' }
        });
      }
      console.error('ingest job failed', err.message);
    });

    return worker;
  } catch {
    return null;
  }
};
