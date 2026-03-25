# CLAUDE.md — AI Development Guide

## Project Overview
Pegasus Starter Pack — a universal full-stack starter template.

## Tech Stack
- Next.js 15 (App Router, Server Components, TypeScript strict)
- Supabase self-hosted (`@supabase/ssr` + `@supabase/supabase-js`) — auth, DB, storage, pgvector
- Bifrost (github.com/maximhq/bifrost) — AI gateway, OpenAI-compatible API
- Flowise (`flowise-sdk`) — visual AI agent builder
- Coolify — self-hosted PaaS (deployment, management)
- Tailwind CSS + shadcn/ui

## Key Patterns

### Authentication
- Use `getUser()` for server-side auth validation (validates JWT against Supabase)
- Browser client: `lib/supabase/client.ts` (singleton via createBrowserClient)
- Server client: `lib/supabase/server.ts` (per-request via createServerClient with cookies)
- Session refresh: `middleware.ts` → `lib/supabase/middleware.ts`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Database
- All tables must have RLS enabled
- Use `(select auth.uid())` in RLS policies for performance (cached per-statement)
- Types in `lib/types/database.ts`

### Storage
- Helpers in `lib/storage.ts` — upload, download, list, delete
- Uses `files` bucket — create it in Supabase dashboard with RLS

### Vector Search (pgvector)
- `supabase/migrations/00002_create_documents_table.sql` — documents table with vector(1536) column
- `match_documents` Postgres function for similarity search via `supabase.rpc()`
- Embeddings generated via Bifrost (`openai.embeddings.create`)

### AI Integration
- Bifrost: `lib/bifrost.ts` — OpenAI SDK with `baseURL` override
- Flowise: `lib/flowise.ts` — FlowiseClient SDK
- All AI calls are server-side only and auth-gated
- Chat streaming via ReadableStream in `app/api/chat/route.ts`

### File Conventions
- Server Components by default; `'use client'` only when needed
- Server Actions in `actions.ts` files
- Route groups: `(auth)` = public auth pages, `(protected)` = auth-required
- API routes in `app/api/`

## Commands
- `./install.sh` — interactive installer (Ubuntu VPS)
- `npm run dev` — start all services in dev mode
- `npm run build` — build Next.js for production
- `npm run prod` — start all services with PM2
- `pm2 status` / `pm2 logs` — check service status

## Optional Modules
Enabled via `./install.sh` interactive menu. Configs pre-shipped in `modules/`.

| Module | Purpose | Requires |
|--------|---------|----------|
| Redis | Caching layer | Docker |
| Qdrant | Vector DB (alternative to pgvector) | Docker |
| BullMQ | Job queues for async AI pipelines | Redis |
| Sentry | Error tracking + performance monitoring | — |
| Traefik | Reverse proxy + automatic SSL | Docker, domain |

### Module file locations
- `modules/redis/docker-compose.yml` — Redis container
- `modules/qdrant/docker-compose.yml` — Qdrant container
- `modules/bullmq/worker.template.ts` — BullMQ worker example
- `modules/bullmq/queue.template.ts` — Queue setup helper
- `modules/sentry/sentry.client.config.ts` — Sentry browser init
- `modules/sentry/sentry.server.config.ts` — Sentry server init
- `modules/traefik/` — Traefik reverse proxy + SSL configs
