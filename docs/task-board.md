# Astrolis.space — Task Board

> Last updated: 2026-04-08

## Legend
- [ ] Not started
- [~] In progress
- [x] Done
- [!] Blocked

---

## Phase 1: Social Core

### Database (Supabase)
- [x] Schema design (profiles, posts, comments, likes, follows)
- [x] Migration SQL with RLS policies
- [x] Performance indexes
- [x] Auto-updating triggers
- [!] Run migration on Supabase instance (needs project setup)

### Backend API (Node.js/Express — `api/`)
- [x] Project structure + Express app
- [x] Supabase client setup (anon + service role)
- [x] Auth middleware (JWT verification)
- [x] Auth routes (signup, login, logout, me)
- [x] Profile routes (get, update, follow, unfollow)
- [x] Post routes (create, get, delete, like toggle)
- [x] Feed endpoint (cursor-paginated)
- [x] Comment routes (create, delete)
- [x] Pagination helper
- [x] Rate limiting
- [!] `npm install` (Node.js not on machine)
- [ ] Integration tests

### Frontend (Next.js 16 — `web/`)
- [x] Project scaffolding (create-next-app)
- [x] Supabase client (browser + server)
- [x] Auth middleware (session refresh)
- [x] API client helper
- [x] TypeScript types
- [x] Root layout with Navbar
- [x] Landing page (unauthenticated)
- [x] Feed page (authenticated)
- [x] Login page
- [x] Signup page
- [x] Post detail page with comments
- [x] Profile page
- [x] Settings page (edit profile + logout)
- [x] Post card component
- [x] Like button component
- [x] Create post form
- [x] Feed component (paginated)
- [x] Comment section component
- [ ] Follow/unfollow button on profile
- [ ] Error/loading/not-found pages
- [ ] Responsive mobile tweaks

### AI Service (Python/FastAPI — `ai-service/`)
- [x] FastAPI app + Claude SDK
- [x] Async client + error handling
- [x] Input validation
- [ ] Deferred to Phase 3

### DevOps
- [x] Dockerfiles (web, api, ai-service)
- [x] docker-compose.yml
- [x] Root .gitignore
- [x] .env.example files (root, api, web, ai-service)
- [ ] CI/CD pipeline

### QA
- [x] Architecture review
- [x] ai-service QA pass 1
- [ ] End-to-end testing
- [ ] Load testing plan

---

## Phase 2: Community Features (planned)
- [ ] Communities (create, join, post)
- [ ] Direct messaging
- [ ] Notifications

## Phase 3: AI Integration (planned)
- [ ] AI assistant (Claude-powered)
- [ ] Recommendation engine
- [ ] Content moderation

## Phase 4: Scale & Polish (planned)
- [ ] Performance optimization
- [ ] SEO & meta tags
- [ ] Analytics
- [ ] Production deployment
