# Cloud-Only Deploy Guide (No Terminal Workflow)

This guide uses web dashboards so you can avoid local terminal complexity.

## 1) Backend on Render from GitHub
1. Open Render Dashboard.
2. Click `New +` -> `Blueprint`.
3. Connect GitHub repo: `vibhorjain27/Booksummaries`.
4. Render detects `render.yaml` and creates:
   - `booksummaries-api` (web service)
   - `booksummaries-worker` (background worker)
   - `booksummaries-postgres` (database)
   - `booksummaries-redis` (cache/queue)
5. In `booksummaries-worker` service env vars, set:
   - `JWT_SECRET` exactly same as API service JWT_SECRET value.
6. Wait for deploy to complete.
7. Open API URL and verify: `/health` returns `{ "ok": true, ... }`.

## 2) Point mobile app to cloud API
1. In Expo dashboard create a project for this app.
2. Set these environment variables in Expo project settings:
   - `EXPO_PUBLIC_API_BASE_URL=https://<your-render-api-domain>/v1`
   - `EXPO_PROJECT_ID=<project-id-from-expo>`
3. Commit already includes app config that reads these values.

## 3) iOS build and TestFlight
1. In Expo dashboard, create an iOS production build.
2. Connect your Apple Developer account in Expo credentials section.
3. Run cloud build for iOS (`production` profile).
4. Submit build to App Store Connect/TestFlight from Expo dashboard.
5. Install TestFlight app on iPhone and test the build.

## 4) Day-to-day updates
1. Push code changes to GitHub main.
2. Render auto-deploys backend.
3. Trigger new iOS cloud build from Expo dashboard when needed.
