import Link from "next/link";
import { signup } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <svg width="48" height="48" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            <path d="M70 8 C92 8, 110 22, 110 50 L110 85 C110 100, 100 108, 95 108 L92 108 L92 125 C92 129, 89 132, 85 132 C81 132, 78 129, 78 125 L78 108 L62 108 L62 125 C62 129, 59 132, 55 132 C51 132, 48 129, 48 125 L48 108 L45 108 C40 108, 30 100, 30 85 L30 50 C30 22, 48 8, 70 8Z" fill="#8b5cf6" />
            <ellipse cx="55" cy="50" rx="9" ry="12" fill="#111" />
            <ellipse cx="58" cy="46" rx="3.15" ry="2.64" fill="#444" />
            <ellipse cx="85" cy="50" rx="9" ry="12" fill="#111" />
            <ellipse cx="88" cy="46" rx="3.15" ry="2.64" fill="#444" />
            <path d="M54 74 Q70 90, 86 74" stroke="#111" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
          <h1 className="mt-4 text-2xl font-bold text-white">Create Account</h1>
          <p className="mt-1 text-sm text-white/40">Sign up to get started with Pegasus</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-white/60">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-white/60">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
              className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {message && (
            <p className="text-sm text-emerald-400">{message}</p>
          )}
          <Button type="submit" formAction={signup} className="w-full bg-violet-600 text-white hover:bg-violet-500">
            Sign Up
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-white/30">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
