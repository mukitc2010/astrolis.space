# Astrolis.space — Changelog

All notable changes to this project.

---

## [0.1.0] — 2026-04-07

### Added
- **ai-service/**: Python FastAPI microservice scaffolding
  - `app/main.py` — FastAPI app with CORS, `/health` and `/chat` endpoints
  - `app/claude.py` — Anthropic SDK client using Claude Opus 4.6
  - `app/schemas.py` — Pydantic models for chat request/response
  - `app/config.py` — Environment variable management via pydantic-settings
  - `requirements.txt` — Python dependencies
  - `.env.example` — API key template
  - `.gitignore` — Python-specific ignores
### Fixed (QA Review Pass 1)
- `app/claude.py` — Switched from sync `Anthropic` to `AsyncAnthropic` client (was blocking event loop)
- `app/claude.py` — Added try/except for all Anthropic API errors (auth, rate limit, connection, status)
- `app/schemas.py` — Added `Field(min_length=1, max_length=10000)` on prompt, `max_length=2000` on system
- `app/config.py` — Replaced deprecated `class Config` with `SettingsConfigDict`, removed redundant `load_dotenv()`
- `app/config.py` — Added `cors_origins` setting (env-configurable for production)
- `app/main.py` — CORS origins now loaded from config, scoped methods/headers
- `.env.example` — Added `CORS_ORIGINS` variable

---

## [0.2.0] — 2026-04-08

### Added
- **Root `.gitignore`** — ignores node_modules, .env, __pycache__, .venv, dist, .next
- **`docker-compose.yml`** — orchestrates web (3000), api (4000), ai-service (8000) with env vars
- **`api/Dockerfile`** — Node 20 Alpine, production npm ci
- **`web/Dockerfile`** — Multi-stage Next.js build (builder + runner)
- **`ai-service/Dockerfile`** — Python 3.12-slim, uvicorn
- **`supabase/migrations/001_initial_schema.sql`** — Full initial database schema:
  - Tables: profiles, posts, comments, likes, follows
  - RLS policies for all tables
  - Performance indexes
  - Auto-updating `updated_at` triggers
- **`.env.example`** — Root environment variable template (Supabase + Anthropic)

---

## [0.3.0] — 2026-04-08

### Added
- **`api/`**: Node.js Express social API service (port 4000)
  - `src/index.js` — Express app with helmet, CORS, morgan, rate limiting, health check
  - `src/config.js` — Environment variable management (PORT, Supabase keys, CORS)
  - `src/supabase.js` — Dual Supabase clients (anon for RLS, service role for admin ops)
  - `src/middleware/auth.js` — JWT verification via `supabase.auth.getUser()`, attaches user to req
  - `src/routes/auth.js` — POST /auth/signup, /auth/login, /auth/logout, GET /auth/me
  - `src/routes/profiles.js` — GET /profiles/:username, PATCH /profiles/me, POST/DELETE /profiles/:id/follow
  - `src/routes/posts.js` — POST /posts, GET /posts/:id, DELETE /posts/:id, POST /posts/:id/like, GET /posts/feed (cursor-paginated)
  - `src/routes/comments.js` — POST /posts/:postId/comments, DELETE /comments/:id
  - `src/lib/pagination.js` — Cursor-based pagination helper (created_at cursor)
  - `package.json` — Dependencies: express, cors, helmet, morgan, @supabase/supabase-js, dotenv, express-rate-limit; dev: nodemon
  - `.env.example` — Environment variable template
  - `.gitignore` — node_modules, .env, dist

---

- **docs/**: Project management docs
  - `task-board.md` — Kanban-style task tracker
  - `decisions.md` — Architecture decision records
  - `changelog.md` — This file
  - `current-status.md` — Project status snapshot
  - `blockers.md` — Blocker log
  - `handoff-notes.md` — Agent handoff notes

---

## [0.4.0] — 2026-04-08

### Added
- **`web/src/lib/supabase/client.ts`** — Browser-side Supabase client using `@supabase/ssr` `createBrowserClient`
- **`web/src/lib/supabase/server.ts`** — Server-side Supabase client using `createServerClient` with Next.js `cookies()`
- **`web/src/lib/supabase/middleware.ts`** — Auth session refresh helper for middleware (redirects unauthenticated users to `/login`)
- **`web/src/middleware.ts`** — Root Next.js middleware wiring up the session refresh on every request
- **`web/src/lib/api.ts`** — API client helper for the Node.js backend (auth, posts, comments, profiles, feed)
- **`web/src/lib/types.ts`** — Shared TypeScript types (Profile, Post, Comment)
- **`web/.env.local.example`** — Environment variable template for the frontend

---

## [0.5.0] — 2026-04-08

### Added
- **`web/src/components/navbar.tsx`** — Top navigation bar (server component): logo, nav links, user avatar/login
- **`web/src/components/post-card.tsx`** — Post card display (server component): author info, content, tags, relative time, like/comment actions
- **`web/src/components/like-button.tsx`** — Interactive like toggle (client component): optimistic state, API integration
- **`web/src/components/create-post.tsx`** — Post creation form (client component): textarea, post type pills, tag input, submit
- **`web/src/components/feed.tsx`** — Paginated feed (client component): loads posts, infinite scroll with "Load more", integrates CreatePost and PostCard
- **`web/src/components/comment-section.tsx`** — Comment section (client component): displays comments, add new comment form
