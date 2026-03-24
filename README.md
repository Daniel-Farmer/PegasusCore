# Pegasus Starter Pack

A production-ready full-stack starter template for **any project**. Fork it, configure it, ship it.

## Stack

| Layer | Tool | What it does |
|-------|------|-------------|
| **AI Gateway** | [Bifrost](https://github.com/maximhq/bifrost) | Routes models, caches, optimises — 15+ providers via one OpenAI-compatible API |
| **AI Agents** | [Flowise](https://github.com/FlowiseAI/Flowise) | Visual AI pipelines — drag-and-drop agents, RAG, multi-step workflows |
| **Backend** | [Supabase](https://supabase.com) | Database (Postgres), auth, storage, and vector DB (pgvector) |
| **Frontend** | [Next.js](https://nextjs.org) + [Tailwind](https://tailwindcss.com) | React server components, TypeScript, shadcn/ui |
| **Hosting** | [Vercel](https://vercel.com) | Zero-config deployment with edge functions |

## What's Included

- **Auth flow** — Sign up, sign in, sign out, email confirmation, protected routes
- **Database CRUD** — Notes demo with Row Level Security (RLS)
- **File storage** — Upload, download, list, delete files via Supabase Storage
- **Vector search** — Store embeddings and semantic similarity search via pgvector
- **AI chat** — Streaming chat via Bifrost gateway (OpenAI-compatible)
- **AI agents** — Interact with Flowise chatflows from the app

## Prerequisites

- Node.js 18+
- A [Supabase](https://database.new) project
- (Optional) An AI provider API key (OpenAI, Anthropic, etc.) for Bifrost

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/pegasus-starter-pack.git
cd pegasus-starter-pack
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL and publishable key from your [Supabase dashboard](https://supabase.com/dashboard).

### 3. Run database migrations

Run the SQL files in `supabase/migrations/` in your Supabase SQL editor (Dashboard > SQL Editor), in order:

1. `00001_create_notes_table.sql` — Notes table with RLS
2. `00002_create_documents_table.sql` — Documents table with pgvector for embeddings

### 4. Create a storage bucket

In your Supabase dashboard, go to Storage and create a bucket called `files`. Enable RLS policies as needed.

### 5. Start services

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Bifrost AI gateway
npx -y @maximhq/bifrost
# Open http://localhost:8080 to configure AI providers

# Terminal 3 — Flowise (optional)
npx flowise start
# Open http://localhost:3000 to build chatflows
```

### 6. Open the app

Visit [http://localhost:3000](http://localhost:3000) (or port 3001 if Flowise is on 3000).

## Project Structure

```
├── app/
│   ├── (auth)/              # Public auth pages (login, signup, email confirm)
│   ├── (protected)/         # Auth-required pages
│   │   ├── dashboard/       # Overview of all integrations
│   │   ├── notes/           # CRUD demo (Supabase DB)
│   │   ├── files/           # File upload demo (Supabase Storage)
│   │   ├── search/          # Semantic search (pgvector)
│   │   ├── chat/            # AI chat (Bifrost streaming)
│   │   └── agents/          # AI agents (Flowise)
│   └── api/                 # API routes (chat, embeddings, agents)
├── lib/
│   ├── supabase/            # Supabase client (browser, server, middleware)
│   ├── bifrost.ts           # Bifrost client (OpenAI SDK with baseURL)
│   ├── flowise.ts           # Flowise client
│   ├── storage.ts           # Supabase Storage helpers
│   └── types/               # TypeScript types
├── components/              # shadcn/ui + shared components
├── middleware.ts             # Auth session refresh
└── supabase/migrations/     # SQL migrations
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com/new)
3. Set environment variables in Vercel dashboard
4. Deploy

Bifrost and Flowise need separate hosting (Docker, Railway, etc.) for production.

## Customization

- **Add a new protected page**: Create a folder in `app/(protected)/your-page/page.tsx`
- **Add a database table**: Create a migration in `supabase/migrations/`, add types to `lib/types/database.ts`
- **Change AI model**: Update the `model` field in `app/api/chat/route.ts`, or configure in Bifrost UI
- **Add a new Flowise agent**: Build it in the Flowise UI, grab the chatflow ID, use it in the agents page

## License

MIT
