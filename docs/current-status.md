# Astrolis.space — Current Status

> Snapshot updated: 2026-04-08 (Iteration 2 complete — full frontend built)

## Project Phase: **Phase 1 — Social Core (Posts + Feed)**

## Service Status

| Service | Status | Notes |
|---------|--------|-------|
| `web/` (Next.js 16) | **Built** | 7 pages, 6 components, Supabase auth, API client, middleware. Dark space theme. |
| `api/` (Node.js/Express) | **Built** | Full REST API: auth, profiles, posts, comments, feed, likes, follows. |
| `ai-service/` (Python/FastAPI) | Parked | Functional but frozen per ADR-005. Phase 3. |
| `supabase/` (Postgres) | Migration ready | 5 tables, RLS, indexes, triggers. Needs Supabase instance. |
| Docker | Ready | docker-compose.yml + 3 Dockerfiles. |

## Frontend Pages

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page (unauth) / Feed (auth) | Done |
| `/login` | Email/password login | Done |
| `/signup` | Registration with username | Done |
| `/post/[id]` | Single post + comments | Done |
| `/profile/[username]` | Public profile | Done |
| `/settings` | Edit profile + logout | Done |

## What Needs to Happen to See It Running

1. **Install Node.js** on this machine (required for npm)
2. Run `cd web && npm install` and `cd api && npm install`
3. Create a Supabase project at supabase.com
4. Run `001_initial_schema.sql` in the Supabase SQL editor
5. Copy `.env.example` files and fill in real keys
6. Start services: `cd api && npm run dev` + `cd web && npm run dev`

## What's Next

### Phase 1 remaining
- [ ] Install deps and test end-to-end
- [ ] Run Supabase migration
- [ ] Integration tests
- [ ] Error/loading/not-found pages
- [ ] Follow/unfollow button on profile page

### Phase 2 (upcoming)
- Communities
- Messaging
- Notifications

### Phase 3
- AI assistant integration
- Recommendation engine
