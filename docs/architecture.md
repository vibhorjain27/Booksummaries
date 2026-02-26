# Architecture Overview

- Mobile: React Native + Expo, onboarding plus five-tab shell.
- API: Node + TypeScript + Express with Prisma/Postgres.
- Queue: BullMQ worker for ingest and distillation pipeline.
- Storage: Postgres now; object storage adapter pending next iteration.
- Shared contracts in `packages/contracts`.

## Content policy
`CONTENT_POLICY_MODE` supports:
- `unrestricted` (MVP default)
- `rights_gated` (future mode)

## DB-backed modules
- Auth login and user provisioning.
- Daily active assignment + queued next book logic.
- Library and progress tracking.
- Gamification XP, streak, and badge awards.
- Book ingest metadata and admin snapshot metrics.
