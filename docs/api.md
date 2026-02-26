# API Surface (MVP)

Base path: `/v1`

## Auth
- `POST /auth/login`
  - body: `{ "email": "demo@distill.app" }`

## Books
- `POST /books/ingest`
  - body: `{ "source_url": "https://...pdf", "title_hint": "...", "author_hint": "..." }`
  - returns `{ ingest_job_id, status }`
- `GET /books/:id/distillation`
  - returns `{ book_summary, chapter_summaries[], context_threads[], total_estimated_minutes }`

## Daily
- `GET /daily/active`
- `POST /daily/complete-chapter`
  - body: `{ "book_id": "...", "chapter_id": "...", "reading_seconds": 900 }`

## Library
- `GET /library?status=in_progress|completed|saved`

## Gamification
- `GET /gamification/summary`
- `POST /gamification/claim`
  - body: `{ "badge_code": "first_book|seven_day_streak|thirty_chapters" }`

## Admin
- `GET /admin/pipeline/jobs`
