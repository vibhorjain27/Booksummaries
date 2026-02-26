# One-Hour Book Distillation

Monorepo implementation for a mobile-first app that delivers one active one-hour book distillation per day.

## Structure
- `apps/api`: Node.js API with PostgreSQL persistence and queue worker pipeline.
- `apps/mobile`: Expo React Native app with onboarding and five-tab shell.
- `packages/contracts`: shared API DTOs and domain types.

## Setup
1. Start infra:
   - `docker compose up -d`
2. Install dependencies:
   - `npm install`
3. Configure API env:
   - `cp apps/api/.env.example apps/api/.env`
4. Generate Prisma client + schema:
   - `npm --workspace @distill/api run db:generate`
   - `npm --workspace @distill/api run db:push`
5. Seed initial catalog (Harari books):
   - `npm --workspace @distill/api run db:seed`

## Run
1. Start API:
   - `npm run dev:api`
2. Start mobile:
   - `npm run dev:mobile`

## Run on iPhone (Expo)
1. Find your Mac LAN IP (example `192.168.1.45`).
2. Launch Expo with API base URL:
   - `EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:4000/v1 npm run dev:mobile`
3. Open Expo Go on iPhone and scan QR.
4. Ensure iPhone and Mac are on same Wi-Fi.

## Current status
- Backend persistence moved to Prisma/Postgres.
- Daily assignment, progress, library, badges, and ingest metadata are DB-backed.
- Ingest worker is scaffolded for PDF pipeline and currently emits generated chapter content.
