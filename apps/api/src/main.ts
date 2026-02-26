import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { authRoutes } from './modules/auth/routes.js';
import { booksRoutes } from './modules/books/routes.js';
import { dailyRoutes } from './modules/daily/routes.js';
import { libraryRoutes } from './modules/library/routes.js';
import { gamificationRoutes } from './modules/gamification/routes.js';
import { adminRoutes } from './modules/admin/routes.js';
import { startIngestWorker } from './workers/ingest.worker.js';
import { prisma } from './db/prisma.js';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'distill-api' });
});

app.use('/v1/auth', authRoutes);
app.use('/v1/books', booksRoutes);
app.use('/v1/daily', dailyRoutes);
app.use('/v1/library', libraryRoutes);
app.use('/v1/gamification', gamificationRoutes);
app.use('/v1/admin', adminRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

startIngestWorker();

const server = app.listen(Number(env.PORT), () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
