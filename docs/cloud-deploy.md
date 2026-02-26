# Cloud-Only Deploy Guide (No Card Required Path)

This path avoids paid infra and avoids local tunnel setup.

## Stack
- Render Free Web Service (API only)
- Supabase Free Postgres (database)
- Expo EAS Dashboard (iOS build/TestFlight)

## 1) Create free Supabase database
1. Open Supabase dashboard.
2. Create a new free project.
3. Go to `Project Settings` -> `Database`.
4. Copy the Postgres connection string (URI format).
5. Ensure it includes SSL mode required by Supabase.

## 2) Deploy API on Render (Blueprint)
1. In Render click `New +` -> `Blueprint`.
2. Select repo `vibhorjain27/Booksummaries`, branch `main`.
3. Apply blueprint.
4. Open service `booksummaries-api` -> `Environment`.
5. Set `DATABASE_URL` to your Supabase Postgres URI.
6. Save and trigger deploy.
7. Verify `https://<render-service>/health` returns `{ "ok": true }`.

## 3) Connect Expo project (dashboard)
1. In Expo dashboard create/select project.
2. Set env vars:
   - `EXPO_PUBLIC_API_BASE_URL=https://<render-service>/v1`
   - `EXPO_PROJECT_ID=<expo-project-id>`

## 4) Build iOS and TestFlight
1. In Expo dashboard run iOS build (`production` profile).
2. Connect Apple Developer account when prompted.
3. Submit build to App Store Connect/TestFlight.
4. Install via TestFlight on iPhone.

## Notes
- Background ingest worker and Redis are disabled in this free path.
- Core app APIs (auth, daily active, library, progress) work on single API service.
