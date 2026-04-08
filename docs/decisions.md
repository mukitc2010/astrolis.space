# Astrolis.space — Architecture Decisions

> Living document. Updated whenever architecture changes.

---

## ADR-001: Multi-Service Architecture
**Date:** 2026-04-07
**Status:** Accepted

**Context:** Astrolis.space needs AI capabilities, social features, and a modern frontend.

**Decision:** Split into three services:
| Service | Stack | Port | Purpose |
|---------|-------|------|---------|
| `web/` | Next.js | 3000 | Frontend SSR + client |
| `api/` | Node.js/Express | 4000 | Social APIs, auth, user data |
| `ai-service/` | Python/FastAPI | 8000 | AI endpoints powered by Claude |

**Rationale:**
- Python has the best Anthropic SDK support and AI/ML ecosystem
- Node.js handles real-time social features well
- Next.js provides SSR for SEO (horoscope pages) and React DX
- Services can scale independently

---

## ADR-002: Claude Opus 4.6 as AI Model
**Date:** 2026-04-07
**Status:** Accepted

**Decision:** Use `claude-opus-4-6` with adaptive thinking for AI features.

**Rationale:** Most capable model for nuanced astrology interpretations. Can downgrade to Sonnet 4.6 for high-volume, simpler tasks (e.g., daily horoscopes) later.

---

## ADR-003: Supabase for Database & Auth
**Date:** 2026-04-07
**Status:** Accepted

**Decision:** Use Supabase (hosted Postgres) for database and authentication.

**Rationale:** Built-in auth, real-time subscriptions, and Postgres power without managing infra. Good free tier for MVP.

---

## ADR-004: Phase 1 Social Core — Posts & Feed System
**Date:** 2026-04-08
**Status:** Accepted

**Context:** Astrolis is a professional social network for the space community. Social features are the highest priority. AI features deferred to Phase 3.

**Decision:** Build the social core in this order: Auth → Profiles → Posts → Comments → Feed.

### Database Schema (Supabase Postgres)

```sql
-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  role text default 'member' check (role in ('member', 'researcher', 'engineer', 'educator', 'organization')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  post_type text default 'text' check (post_type in ('text', 'article', 'question', 'project_update')),
  tags text[] default '{}',
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now()
);

-- Likes
create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- Follows
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);
```

### API Endpoints (Node.js — `api/`)

```
Auth (Supabase handles directly):
  POST   /auth/signup
  POST   /auth/login
  POST   /auth/logout
  GET    /auth/me

Profiles:
  GET    /profiles/:username
  PATCH  /profiles/me
  POST   /profiles/:id/follow
  DELETE /profiles/:id/follow

Posts:
  POST   /posts              — create post
  GET    /posts/:id          — single post with comments
  DELETE /posts/:id          — delete own post
  POST   /posts/:id/like     — toggle like
  GET    /feed               — paginated feed (followed users + recent)

Comments:
  POST   /posts/:id/comments — add comment
  DELETE /comments/:id       — delete own comment
```

### Frontend Routes (Next.js — `web/`)

```
/              — Feed (home, requires auth)
/login         — Login page
/signup        — Signup page
/profile/:username — Public profile
/post/:id      — Single post view
/settings      — Edit own profile
```

### Tech Stack Choices for Iteration 2

| Layer | Choice | Reason |
|-------|--------|--------|
| Node.js framework | Express | Simple, well-known, sufficient for REST |
| Supabase client | `@supabase/supabase-js` | Official SDK, handles auth + DB |
| Auth strategy | Supabase Auth (JWT) | Built-in, handles email/password, magic link, OAuth |
| API auth middleware | Verify Supabase JWT on each request | Stateless, no session store needed |
| Frontend state | React context + `@supabase/auth-helpers-nextjs` | Lightweight, no Redux needed at this scale |
| CSS | Tailwind CSS | Fast to build, consistent design system |
| Pagination | Cursor-based (created_at + id) | Better than offset for feeds |

**Rationale:** Minimal complexity. Use Supabase for everything it's good at (auth, DB, realtime). Keep the Node.js API thin — it's mostly a validated gateway to Postgres. The frontend is server-rendered where SEO matters (profiles, posts) and client-rendered for interactive feeds.

---

## ADR-005: Priority Order — Social Before AI
**Date:** 2026-04-08
**Status:** Accepted

**Decision:** AI features (ai-service) are frozen until Phase 1 social core is complete. The `ai-service/` code remains in the repo but receives no new development until Phase 3.

**Rationale:** A social network must have working social features before layering on AI. Users need to post, comment, follow, and browse before they can benefit from AI recommendations or assistants.
