import { startIngestWorker } from './workers/ingest.worker.js';
import { prisma } from './db/prisma.js';

const worker = startIngestWorker();

if (!worker) {
  console.error('Failed to start ingest worker.');
  process.exit(1);
}

console.log('Ingest worker started.');

const shutdown = async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
