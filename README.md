# One-Hour Book Distillation

Monorepo implementation for a mobile-first app that delivers one active one-hour book distillation per day.

## Structure
- `apps/api`: Node.js API with job pipeline and gamification logic.
- `apps/mobile`: Expo React Native mobile app shell and core pages.
- `packages/contracts`: shared API DTOs and domain types.

## Quick start
1. Start infra: `docker compose up -d`
2. Install dependencies: `npm install`
3. Run API: `npm run dev:api`
4. Run mobile app: `npm run dev:mobile`

## Environment
See `apps/api/.env.example`.
