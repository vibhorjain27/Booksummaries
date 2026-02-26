# One-Hour Book Distillation

Monorepo implementation for a mobile-first app that delivers one active one-hour book distillation per day.

## Structure
- `apps/api`: Node.js API with Prisma/Postgres and ingest queue worker.
- `apps/mobile`: Expo React Native app with onboarding and five-tab shell.
- `packages/contracts`: shared API DTOs and domain types.

## Cloud-first deployment (recommended)
If you want a no-terminal workflow, use:
- Render for backend + Postgres + Redis (from GitHub)
- Expo EAS dashboard for iOS cloud builds + TestFlight

Step-by-step: `docs/cloud-deploy.md`

## Local setup (optional)
1. Start infra:
   - `docker compose up -d`
2. Install dependencies:
   - `npm install`
3. Configure API env:
   - `cp apps/api/.env.example apps/api/.env`
4. Generate Prisma client + schema:
   - `npm --workspace @distill/api run db:generate`
   - `npm --workspace @distill/api run db:push`
5. Seed initial catalog:
   - `npm --workspace @distill/api run db:seed`
6. Start API:
   - `npm run dev:api`
7. Start mobile:
   - `npm run dev:mobile`

## Current status
- Backend persistence is DB-backed via Prisma/Postgres.
- Daily assignment, progress, badges, and ingest metadata are persisted.
- Ingest worker queue is deployed separately and generates placeholder chapter content.
- Next major step: real PDF parsing + hosted LLM summarization pipeline.
