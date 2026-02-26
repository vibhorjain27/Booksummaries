import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import { ids, store } from '../db/store.js';

export interface IngestJobPayload {
  sourceUrl: string;
  titleHint?: string;
  authorHint?: string;
}

let queue: Queue<IngestJobPayload> | null = null;

const getQueue = (): Queue<IngestJobPayload> => {
  if (!queue) {
    queue = new Queue<IngestJobPayload>('ingest-book', {
      connection: { url: env.REDIS_URL }
    });
  }
  return queue;
};

export const enqueueIngest = async (payload: IngestJobPayload): Promise<string> => {
  const ingestId = ids.ingest();
  store.bookSources.push({
    id: ids.source(),
    sourceUrl: payload.sourceUrl,
    titleHint: payload.titleHint,
    authorHint: payload.authorHint,
    fetchStatus: 'queued'
  });

  try {
    await getQueue().add(
      'process-pdf',
      payload,
      {
        jobId: ingestId,
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3_000 }
      }
    );
  } catch {
    // Keep ingest queued; worker can be unavailable in local dev.
  }

  return ingestId;
};

export const validateContentPolicy = (url: string): { allowed: boolean; reason?: string } => {
  if (env.CONTENT_POLICY_MODE === 'unrestricted') {
    return { allowed: true };
  }

  const trusted = ['gutenberg.org', 'archive.org'];
  const isTrusted = trusted.some((domain) => url.includes(domain));
  if (!isTrusted) {
    return {
      allowed: false,
      reason: 'CONTENT_POLICY_MODE=rights_gated permits only trusted public-domain sources.'
    };
  }

  return { allowed: true };
};
