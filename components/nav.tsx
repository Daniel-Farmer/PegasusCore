"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/bifrost", label: "Bifrost" },
  { href: "/flowise", label: "Flowise" },
  { href: "/chat", label: "Chat" },
  { href: "/files", label: "Files" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            pathname === link.href
              ? "bg-violet-600/20 text-violet-400"
              : "text-white/40 hover:bg-white/[0.06] hover:text-white/70"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
