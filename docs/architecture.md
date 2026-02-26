# Architecture Overview

- Mobile: React Native + Expo with five-tab navigation.
- API: Node + TypeScript modular services aligned to endpoints.
- Queue: BullMQ worker for ingest and distillation pipeline.
- Storage: Postgres + object storage abstraction.
- Shared contracts in `packages/contracts`.

## Content policy
`CONTENT_POLICY_MODE` supports:
- `unrestricted` (MVP default)
- `rights_gated` (future mode)
