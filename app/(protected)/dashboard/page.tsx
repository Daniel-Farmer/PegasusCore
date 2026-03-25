"use client";

import Link from "next/link";

const tools = [
  {
    title: "Bifrost",
    description: "AI gateway — manage providers, models, and API keys",
    href: "/bifrost",
    port: 8081,
    color: "text-indigo-400 bg-indigo-600/15",
    external: true,
  },
  {
    title: "Flowise",
    description: "Build and manage AI agent flows visually",
    href: "/flowise",
    port: 3001,
    color: "text-blue-400 bg-blue-600/15",
    external: true,
  },
  {
    title: "AI Chat",
    description: "Streaming chat powered by Bifrost",
    href: "/chat",
    color: "text-violet-400 bg-violet-600/15",
  },
  {
    title: "Files",
    description: "Upload and manage files via Supabase Storage",
    href: "/files",
    color: "text-amber-400 bg-amber-600/15",
  },
  {
    title: "Settings",
    description: "IP whitelist and access control",
    href: "/settings",
    color: "text-white/50 bg-white/10",
  },
];

function getExternalUrl(port: number) {
  if (typeof window === "undefined") return "#";
  return `${window.location.protocol}//${window.location.hostname}:${port}`;
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-white/40">Manage your services and tools.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const inner = (
            <div className="group h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}>
                <span className="text-sm font-bold">{tool.title[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white/90 group-hover:text-white">
                  {tool.title}
                </h3>
                {tool.external && (
                  <svg className="h-3.5 w-3.5 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                )}
              </div>
              <p className="mt-1 text-sm text-white/35 group-hover:text-white/50">
                {tool.description}
              </p>
            </div>
          );

          if (tool.external && tool.port) {
            return (
              <a key={tool.href} href={getExternalUrl(tool.port)} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            );
          }

          return (
            <Link key={tool.href} href={tool.href}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
