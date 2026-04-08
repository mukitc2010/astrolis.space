# Astrolis.space — Handoff Notes

> Each work session leaves notes for the next.

---

## Session: 2026-04-07 — Initial Setup

**Agent:** Backend (AI Service)

### What was done
- Created `ai-service/` with FastAPI + Anthropic SDK
- Single `/chat` POST endpoint calls Claude Opus 4.6
- Astrology-focused system prompt baked into `claude.py`
- CORS allows `localhost:3000` (Next.js dev server)

### Key files
| File | Purpose |
|------|---------|
| `ai-service/app/main.py` | FastAPI routes |
| `ai-service/app/claude.py` | Claude client + `chat()` function |
| `ai-service/app/config.py` | Env config via pydantic-settings |
| `ai-service/app/schemas.py` | Request/response models |

### What the next agent needs to know
- The Anthropic client in `claude.py` is **synchronous** (`anthropic.Anthropic()`). If adding streaming, you'll need `client.messages.stream()` — see the streaming pattern in the SDK docs.
- `DEFAULT_SYSTEM` prompt in `claude.py` is a placeholder — refine it when building specific features (birth charts, horoscopes, etc.)
- CORS origins list (`main.py`) will need updating for production domains.
- No auth middleware yet — add before exposing publicly.

### Pending for QA
- ~~Review error paths~~ DONE — errors now caught and mapped to HTTP codes
- ~~Review input validation~~ DONE — prompt/system length limits added
- Verify response schema matches what frontend will expect

---

## Session: 2026-04-07 — QA Review & Fixes

**Agent:** QA + Backend (fixes)

### What was done
- Full QA review of ai-service (security, errors, correctness, best practices)
- Fixed 3 critical issues:
  1. **Sync→Async client** — `anthropic.Anthropic` replaced with `AsyncAnthropic` + `await`
  2. **Error handling** — `try/except` for `AuthenticationError`, `RateLimitError`, `APIStatusError`, `APIConnectionError` → proper HTTP status codes
  3. **Input validation** — prompt capped at 10k chars, system at 2k chars
- Fixed 2 warnings:
  1. Config modernized (`SettingsConfigDict`, removed redundant `load_dotenv`)
  2. CORS now env-configurable, methods/headers scoped

### What the next agent needs to know
- Client is now `AsyncAnthropic` — use `await client.messages.stream()` for the streaming endpoint
- CORS origins come from `settings.cors_origins` (comma-separated string in `.env`)
- **Still no auth** — this is the next priority before any public exposure
- System prompt override is still possible via the `system` field — decide if this should be locked down or kept for flexibility
- No tests exist yet — write tests before adding more endpoints

### Open QA items (deferred)
- Add auth middleware (API key header)
- Add rate limiting (e.g., `slowapi`)
- Add tests (`pytest` + `httpx` for async FastAPI testing)
- Remove or restrict `system` field from public API

---

## Session: 2026-04-08 — Node.js API Scaffolding

**Agent:** Backend (Social APIs)

### What was done
- Created full `api/` service: Express app on port 4000 with helmet, CORS, morgan, rate limiting
- Dual Supabase clients (anon for RLS-aware ops, service role for admin ops)
- JWT auth middleware (`requireAuth`) verifies token via `supabase.auth.getUser()`
- Auth routes: signup (creates auth user + profile row), login, logout, get current user
- Profile routes: get by username (with follower/following counts), update own profile, follow/unfollow
- Post routes: create, get (with comments), delete (ownership check), like toggle (with count sync)
- Feed route: cursor-based pagination, shows posts from followed users + own posts
- Comment routes: create on a post (with optional parent_id for threading), delete (ownership check)
- Cursor-based pagination helper in `lib/pagination.js`

### Key files
| File | Purpose |
|------|---------|
| `api/src/index.js` | Express app entry, middleware stack, route mounting |
| `api/src/config.js` | Env var config |
| `api/src/supabase.js` | Supabase client instances (anon + admin) |
| `api/src/middleware/auth.js` | JWT verification middleware |
| `api/src/routes/auth.js` | Signup, login, logout, me |
| `api/src/routes/profiles.js` | Profile get/update/follow/unfollow |
| `api/src/routes/posts.js` | Posts CRUD + feed + like toggle |
| `api/src/routes/comments.js` | Comment create + delete |
| `api/src/lib/pagination.js` | Cursor-based pagination |

### What the next agent needs to know
- **`npm install` has NOT been run** — Node.js was not on PATH in the build environment. Run `npm install` before starting the server.
- The service expects a Supabase instance with the schema from `supabase/migrations/001_initial_schema.sql` (profiles, posts, comments, likes, follows tables).
- Comments router exports two sub-routers: `commentsOnPost` (mounted at `/posts/:postId/comments`) and `commentsRoot` (mounted at `/comments`). This keeps the clean REST URL structure.
- The feed query uses `.in('author_id', feedUserIds)` — for users following many accounts, this could get slow. Consider a materialized feed table or a DB function for scale.
- Rate limiter is global at 100 req/min/IP. Consider route-specific limits for auth endpoints (e.g., 10/min for login).
- No input sanitization beyond length checks — consider adding HTML/XSS sanitization before production.
- No tests yet — add integration tests next.

### Pending for QA
- Review all error paths and edge cases
- Verify Supabase query patterns match the DB schema
- Test follow/unfollow idempotency
- Verify cursor pagination with empty results

---

## Session: 2026-04-08 — Frontend Build (Iteration 2)

**Agent:** Frontend + Architect

### What was done
- Designed complete Phase 1 architecture (ADR-004, ADR-005)
- Built full Next.js 16 frontend with dark space theme
- Created Supabase integration layer (browser client, server client, middleware)
- Created API client helper for Node.js backend
- Built 7 pages: landing, login, signup, feed, post detail, profile, settings
- Built 6 components: navbar, post-card, like-button, create-post, feed, comment-section

### Key architectural decisions
- Server Components by default, `'use client'` only for interactive parts
- Supabase handles auth (JWT), Node.js API validates tokens server-side
- Dark theme: `#0a0f1a` bg, `#111827` cards, `#3b82f6` accent blue
- Cursor-based feed pagination
- AI features deferred to Phase 3 (ADR-005)

### File structure
```
web/src/
├── app/
│   ├── layout.tsx          # Root layout (server) — reads auth, renders Navbar
│   ├── page.tsx            # Landing (unauth) or Feed (auth)
│   ├── login/page.tsx      # Email/password login
│   ├── signup/page.tsx     # Registration
│   ├── post/[id]/page.tsx  # Post detail + comments
│   ├── profile/[username]/page.tsx  # Public profile
│   └── settings/page.tsx   # Edit profile + logout
├── components/
│   ├── navbar.tsx           # Server component
│   ├── post-card.tsx        # Server component
│   ├── like-button.tsx      # Client component
│   ├── create-post.tsx      # Client component
│   ├── feed.tsx             # Client component
│   └── comment-section.tsx  # Client component
├── lib/
│   ├── api.ts              # Typed API client for backend
│   ├── types.ts            # Profile, Post, Comment interfaces
│   └── supabase/
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client (async cookies)
│       └── middleware.ts   # Session refresh + auth redirect
└── middleware.ts            # Root middleware
```

### What the next agent needs to know
- **Node.js is not installed** on this machine — can't run `npm install` or `npm run dev`
- The frontend calls `localhost:4000` for API requests — both api and web must run simultaneously
- Supabase project needs to be created and `001_initial_schema.sql` run before anything works
- The signup flow calls the Node.js API (which creates the profile row), then auto-logs in via Supabase client
- `router.refresh()` is used after auth state changes — this is the Next.js 16 pattern
- Follow/unfollow button is not yet on the profile page — the backend endpoint exists but the UI button wasn't wired up

### Pending for QA
- Verify all pages render without errors (need Node.js to run `next dev`)
- Check TypeScript strict mode compliance
- Verify Supabase server client cookie handling works in production
- Test the full auth flow: signup → login → create post → view feed → comment → logout
