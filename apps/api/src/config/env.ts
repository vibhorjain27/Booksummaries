import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  PORT: z.string().default('4000'),
  JWT_SECRET: z.string().default('dev-secret'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  DATABASE_URL: z.string().url().or(z.string().startsWith('postgresql://')),
  CONTENT_POLICY_MODE: z.enum(['unrestricted', 'rights_gated']).default('unrestricted'),
  DEFAULT_TIMEZONE: z.string().default('America/Los_Angeles'),
  RUN_INGEST_WORKER: z.enum(['true', 'false']).default('false')
});

export const env = schema.parse(process.env);
