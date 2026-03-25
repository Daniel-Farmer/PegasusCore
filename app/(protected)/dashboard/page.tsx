import Link from "next/link";

const tools = [
  {
    title: "Bifrost",
    description: "AI gateway — manage providers, models, and API keys",
    href: "/bifrost",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#6366f1" />
        <path d="M12 28V12h4.5c2.5 0 4.2 1.2 4.2 3.3 0 1.6-1 2.7-2.4 3.1 1.7.3 2.9 1.7 2.9 3.5 0 2.4-1.8 3.8-4.5 3.8H12Z" fill="white" />
        <path d="M24 14l4 6-4 6M28 20H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-indigo-400 bg-indigo-600/15",
  },
  {
    title: "Flowise",
    description: "Build and manage AI agent flows visually",
    href: "/flowise",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#2563eb" />
        <circle cx="14" cy="14" r="3" stroke="white" strokeWidth="2" />
        <circle cx="26" cy="14" r="3" stroke="white" strokeWidth="2" />
        <circle cx="20" cy="26" r="3" stroke="white" strokeWidth="2" />
        <path d="M16.5 16l2.5 8M23.5 16l-2.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    color: "text-blue-400 bg-blue-600/15",
  },
  {
    title: "AI Chat",
    description: "Streaming chat powered by Bifrost",
    href: "/chat",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
    color: "text-violet-400 bg-violet-600/15",
  },
  {
    title: "Files",
    description: "Upload and manage files via Supabase Storage",
    href: "/files",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    ),
    color: "text-amber-400 bg-amber-600/15",
  },
  {
    title: "Settings",
    description: "IP whitelist and access control",
    href: "/settings",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    color: "text-white/50 bg-white/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-white/40">
          Manage your services and tools.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <div className="group h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}>
                {tool.icon}
              </div>
              <h3 className="text-lg font-semibold text-white/90 group-hover:text-white">
                {tool.title}
              </h3>
              <p className="mt-1 text-sm text-white/35 group-hover:text-white/50">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
