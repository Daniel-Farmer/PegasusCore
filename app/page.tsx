import Link from "next/link";
import { SetupWizard } from "@/components/setup-wizard";

const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

/* ── Inline SVG logos ── */

function BifrostLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#6366f1" />
      <path
        d="M12 28V12h4.5c2.5 0 4.2 1.2 4.2 3.3 0 1.6-1 2.7-2.4 3.1 1.7.3 2.9 1.7 2.9 3.5 0 2.4-1.8 3.8-4.5 3.8H12Zm3 5.3h1.8c1.2 0 1.9-.6 1.9-1.6s-.7-1.6-1.9-1.6H15v3.2Zm0 5.4h2c1.3 0 2.1-.7 2.1-1.8 0-1-.8-1.7-2.1-1.7h-2v3.5Z"
        fill="white"
      />
      <path d="M24 14l4 6-4 6M28 20H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlowiseLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#2563eb" />
      <circle cx="14" cy="14" r="3" stroke="white" strokeWidth="2" />
      <circle cx="26" cy="14" r="3" stroke="white" strokeWidth="2" />
      <circle cx="20" cy="26" r="3" stroke="white" strokeWidth="2" />
      <path d="M16.5 16l2.5 8M23.5 16l-2.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SupabaseLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#3ECF8E" />
      <path
        d="M22.3 29.2c-.4.5-1.3.2-1.3-.5V21h8.2c.9 0 1.4 1 .8 1.7l-7.7 6.5Z"
        fill="white"
        fillOpacity=".8"
      />
      <path
        d="M17.7 10.8c.4-.5 1.3-.2 1.3.5V19H10.8c-.9 0-1.4-1-.8-1.7l7.7-6.5Z"
        fill="white"
      />
    </svg>
  );
}

function NextjsLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="white" />
      <circle cx="20" cy="20" r="10" fill="black" />
      <path d="M16 14v12l10-12" fill="white" />
      <circle cx="25" cy="15" r="1.5" fill="white" />
    </svg>
  );
}

function VercelLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="white" />
      <path d="M20 12L30 28H10L20 12Z" fill="black" />
    </svg>
  );
}

/* ── Data ── */

const stack = [
  {
    Logo: BifrostLogo,
    title: "Bifrost",
    description: "AI gateway — routes to 15+ providers, caches, failover",
  },
  {
    Logo: FlowiseLogo,
    title: "Flowise",
    description: "Visual builder for AI agents, RAG, and workflows",
  },
  {
    Logo: SupabaseLogo,
    title: "Supabase",
    description: "Postgres, auth, storage, and vector DB (pgvector)",
  },
  {
    Logo: NextjsLogo,
    title: "Next.js",
    description: "React server components, TypeScript, and Tailwind",
  },
  {
    Logo: VercelLogo,
    title: "Vercel",
    description: "Zero-config deploy, edge functions, global CDN",
  },
];

const included = [
  {
    icon: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
    title: "Authentication",
    description:
      "Sign up, sign in, email confirmation, protected routes, and Row Level Security — ready to use.",
  },
  {
    icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
    title: "AI integrations",
    description:
      "Streaming chat, embeddings, vector search, and visual agent pipelines — all pre-wired.",
  },
  {
    icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75",
    title: "Database & storage",
    description:
      "Postgres CRUD, file uploads, and pgvector semantic search — with migrations included.",
  },
];

const pages = [
  { name: "/dashboard", description: "Overview of all integrations" },
  { name: "/notes", description: "CRUD demo with Supabase" },
  { name: "/files", description: "File upload with Supabase Storage" },
  { name: "/search", description: "Semantic search with pgvector" },
  { name: "/chat", description: "Streaming AI chat via Bifrost" },
  { name: "/agents", description: "Flowise agent pipelines" },
];

export default function HomePage() {
  if (!isConfigured) {
    return <SetupWizard />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] font-[var(--font-sans)] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">Pegasus Core</span>
          <nav className="hidden items-center gap-6 text-sm text-white/60 md:flex">
            <a href="#stack" className="transition-colors hover:text-white">Stack</a>
            <a href="#included" className="transition-colors hover:text-white">Included</a>
            <a href="#pages" className="transition-colors hover:text-white">Pages</a>
          </nav>
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,80,255,0.08)_0%,_transparent_70%)]" />
          <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-28 text-center md:pt-36">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              You&apos;re running Pegasus Core
            </div>
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
              <span className="text-white/50">Your app </span>
              starts here.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/50">
              This is your starter pack. Auth, database, storage, AI chat, vector
              search, and agent pipelines are already wired up. Edit this page to
              make it yours.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold tracking-wide uppercase transition-colors hover:bg-indigo-500"
              >
                Explore the demo
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3 text-sm font-semibold tracking-wide uppercase text-white/70 transition-colors hover:bg-white/[0.04]"
              >
                Create account
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/30">
              Edit <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs">app/page.tsx</code> to replace this page
            </p>
          </div>
        </section>

        {/* Stack — 5 items, single row */}
        <section id="stack" className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-28">
            <h2 className="text-center text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-white/40">Powered by </span>the best tools.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-white/40">
              Five battle-tested technologies, pre-configured and ready to go.
            </p>
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {stack.map((item) => (
                <div
                  key={item.title}
                  className="group flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-8 text-center transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <item.Logo className="mb-4 h-12 w-12" />
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/40">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's included */}
        <section id="included" className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-28">
            <h2 className="text-center text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-white/40">What&apos;s </span>included.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-white/40">
              Everything is pre-configured. Just add your API keys and start building.
            </p>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {included.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                    <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo pages */}
        <section id="pages" className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-28">
            <h2 className="text-center text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-white/40">Demo </span>pages.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-white/40">
              Each integration has a working demo page. Try them out, then customize.
            </p>
            <div className="mx-auto mt-16 grid max-w-3xl gap-3 sm:grid-cols-2">
              {pages.map((page) => (
                <Link
                  key={page.name}
                  href={page.name}
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <code className="rounded bg-white/[0.06] px-2 py-1 font-mono text-sm text-indigo-400">
                    {page.name}
                  </code>
                  <span className="text-sm text-white/40 group-hover:text-white/60">
                    {page.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Customize CTA */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-32 text-center">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06]">
              <svg className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Make it
              <br />
              <span className="text-white/40">yours.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/40">
              This landing page is a placeholder. Replace it with your own design,
              keep the parts you need, and delete the rest.
            </p>
            <div className="mt-8">
              <code className="rounded-lg bg-white/[0.06] px-4 py-2 font-mono text-sm text-white/60">
                app/page.tsx
              </code>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/30">
        Pegasus Core — Open Source, MIT Licensed
      </footer>
    </div>
  );
}
