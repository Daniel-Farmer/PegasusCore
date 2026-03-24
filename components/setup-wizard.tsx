"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Step = "name" | "supabase" | "database" | "account" | "ai" | "save";

const STEPS: Step[] = ["name", "supabase", "database", "account", "ai", "save"];

type MigrateResult = {
  step: string;
  status: "ok" | "error";
  message?: string;
};

function Mascot({ size = 80 }: { size?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    // Center of the mascot's face in screen coords
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.35;
    // Direction from center to mouse
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Max pupil travel (in SVG units, scaled by size)
    const maxTravel = 4;
    const factor = Math.min(dist / 200, 1);
    setPupilOffset({
      x: (dx / (dist || 1)) * maxTravel * factor,
      y: (dy / (dist || 1)) * maxTravel * factor,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Base pupil positions (highlights in the original SVG)
  const leftPupilBase = { cx: 58, cy: 46 };
  const rightPupilBase = { cx: 88, cy: 46 };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <path d="M70 8 C92 8, 110 22, 110 50 L110 85 C110 100, 100 108, 95 108 L92 108 L92 125 C92 129, 89 132, 85 132 C81 132, 78 129, 78 125 L78 108 L62 108 L62 125 C62 129, 59 132, 55 132 C51 132, 48 129, 48 125 L48 108 L45 108 C40 108, 30 100, 30 85 L30 50 C30 22, 48 8, 70 8Z" fill="#8b5cf6" />
      {/* Body highlight */}
      <path d="M50 18 C43 25, 38 40, 38 55 L38 70 C38 65, 40 40, 50 22Z" fill="white" opacity="0.2" />
      {/* Left arm */}
      <rect x="14" y="55" width="16" height="30" rx="8" fill="#8b5cf6" />
      <rect x="14" y="55" width="16" height="30" rx="8" fill="black" opacity="0.1" />
      {/* Right arm (waving) */}
      <rect x="112" y="28" width="16" height="32" rx="8" fill="#8b5cf6" transform="rotate(-25, 120, 44)" />
      <rect x="112" y="28" width="16" height="32" rx="8" fill="black" opacity="0.1" transform="rotate(-25, 120, 44)" />
      {/* Wave lines */}
      <path d="M134 22 Q138 18, 136 14" stroke="#8b5cf6" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M138 28 Q142 24, 140 20" stroke="#8b5cf6" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Eye sockets */}
      <ellipse cx="55" cy="50" rx="9" ry="12" fill="#111" />
      <ellipse cx="85" cy="50" rx="9" ry="12" fill="#111" />
      {/* Pupils (follow mouse) */}
      <ellipse
        cx={leftPupilBase.cx + pupilOffset.x}
        cy={leftPupilBase.cy + pupilOffset.y}
        rx="3.15"
        ry="2.64"
        fill="#444"
        style={{ transition: "cx 0.08s ease-out, cy 0.08s ease-out" }}
      />
      <ellipse
        cx={rightPupilBase.cx + pupilOffset.x}
        cy={rightPupilBase.cy + pupilOffset.y}
        rx="3.15"
        ry="2.64"
        fill="#444"
        style={{ transition: "cx 0.08s ease-out, cy 0.08s ease-out" }}
      />
      {/* Mouth */}
      <path d="M54 74 Q70 90, 86 74" stroke="#111" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-sm text-white/40">
        Step {current} of {total}
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors ${
              i < current ? "bg-violet-500" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function SetupWizard() {
  const [step, setStep] = useState<Step>("name");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Name
  const [userName, setUserName] = useState("");

  // Supabase
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [supabaseValid, setSupabaseValid] = useState(false);

  // Database
  const [migrateResults, setMigrateResults] = useState<MigrateResult[]>([]);
  const [dbReady, setDbReady] = useState(false);

  // Account
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);

  // AI
  const [bifrostUrl, setBifrostUrl] = useState("http://localhost:8080/openai");
  const [bifrostKey, setBifrostKey] = useState("bifrost-internal");
  const [flowiseUrl, setFlowiseUrl] = useState("http://localhost:3001");
  const [flowiseChatflowId, setFlowiseChatflowId] = useState("");
  const [flowiseKey, setFlowiseKey] = useState("");

  // Save
  const [saved, setSaved] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  function goNext() {
    if (stepIndex < STEPS.length - 1) {
      setError("");
      setStep(STEPS[stepIndex + 1]);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setError("");
      setStep(STEPS[stepIndex - 1]);
    }
  }

  async function validateSupabase() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseUrl, supabaseKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setSupabaseValid(true);
      } else {
        setError(data.error || "Connection failed");
      }
    } catch {
      setError("Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  async function runMigrationCheck() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseUrl, serviceRoleKey: serviceRoleKey || supabaseKey }),
      });
      const data = await res.json();
      setMigrateResults(data.results || []);
      setDbReady(data.allOk);
    } catch {
      setError("Migration check failed");
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl,
          serviceRoleKey: serviceRoleKey || supabaseKey,
          email: accountEmail,
          password: accountPassword,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setAccountCreated(true);
      } else {
        setError(data.error || "Failed to create account");
      }
    } catch {
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl,
          supabaseKey,
          bifrostUrl,
          bifrostKey,
          flowiseUrl,
          flowiseChatflowId,
          flowiseKey,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSaved(true);
      } else {
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  }

  function extractProjectRef() {
    try {
      const url = new URL(supabaseUrl);
      return url.hostname.split(".")[0];
    } catch {
      return "";
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div
          className="h-[700px] w-[700px] opacity-[0.15]"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 45% 55%, #8b5cf6 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 60% 40%, #6d28d9 0%, transparent 60%)",
            filter: "blur(80px)",
            borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
            animation: "ambientDrift 8s ease-in-out infinite",
          }}
        />
      </div>
      <style jsx>{`
        @keyframes ambientDrift {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          25% {
            transform: translate(30px, -20px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 15px) scale(0.95);
          }
          75% {
            transform: translate(15px, 25px) scale(1.02);
          }
        }
      `}</style>


      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
        {/* Progress bar */}
        <div className="mb-16">
          <ProgressBar current={stepIndex + 1} total={STEPS.length} />
        </div>

        {/* ── Step 1: Name ── */}
        {step === "name" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Mascot size={96} />

            {/* Dots */}
            <div className="mt-4 flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>

            <h1 className="mt-8 text-3xl font-bold tracking-tight">
              First things first! What should I call you?
            </h1>

            <div className="mt-8 flex w-full max-w-sm gap-3">
              <Input
                placeholder="Your name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && userName.trim()) goNext(); }}
                className="flex-1 border-white/10 bg-white/[0.04] text-base placeholder:text-white/25"
                autoFocus
              />
              <Button
                onClick={goNext}
                disabled={!userName.trim()}
                className="bg-violet-600 px-6 hover:bg-violet-500"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Supabase ── */}
        {step === "supabase" && (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/15">
                <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 109 113" fill="currentColor">
                  <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" />
                  <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fillOpacity="0.4" />
                  <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Connect Supabase</h2>
                <p className="text-sm text-white/40">
                  {userName ? `Nice to meet you, ${userName}!` : ""} Let&apos;s connect your backend.
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-white/50">
              Find these in your{" "}
              <a
                href="https://supabase.com/dashboard/project/_/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 underline underline-offset-2"
              >
                Supabase dashboard
              </a>{" "}
              under Settings &rarr; API.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="supabase-url" className="text-sm text-white/60">Project URL</Label>
                <Input
                  id="supabase-url"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => { setSupabaseUrl(e.target.value); setSupabaseValid(false); }}
                  className="mt-1.5 border-white/10 bg-white/[0.04]"
                />
              </div>
              <div>
                <Label htmlFor="supabase-key" className="text-sm text-white/60">Publishable Key (anon key)</Label>
                <Input
                  id="supabase-key"
                  placeholder="sb_publishable_..."
                  value={supabaseKey}
                  onChange={(e) => { setSupabaseKey(e.target.value); setSupabaseValid(false); }}
                  className="mt-1.5 border-white/10 bg-white/[0.04]"
                />
              </div>
              <div>
                <Label htmlFor="service-role-key" className="text-sm text-white/60">
                  Service Role Key <span className="text-white/25">(for migrations — not saved)</span>
                </Label>
                <Input
                  id="service-role-key"
                  type="password"
                  placeholder="eyJhbGci..."
                  value={serviceRoleKey}
                  onChange={(e) => setServiceRoleKey(e.target.value)}
                  className="mt-1.5 border-white/10 bg-white/[0.04]"
                />
              </div>
            </div>

            {supabaseValid && (
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Connected successfully
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-auto flex items-center justify-between pt-10">
              <Button onClick={goBack} variant="ghost" className="text-white/40 hover:text-white/60">
                Back
              </Button>
              <div className="flex gap-3">
                {!supabaseValid ? (
                  <Button
                    onClick={validateSupabase}
                    disabled={loading || !supabaseUrl || !supabaseKey}
                    className="bg-violet-600 hover:bg-violet-500"
                  >
                    {loading ? "Testing..." : "Test Connection"}
                  </Button>
                ) : (
                  <Button onClick={goNext} className="bg-violet-600 hover:bg-violet-500">
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Database ── */}
        {step === "database" && (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/15">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Database Setup</h2>
                <p className="text-sm text-white/40">
                  We&apos;ll automatically create the required tables and storage bucket.
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-white/50">
              This will create the <strong className="text-white/70">notes</strong> table,{" "}
              <strong className="text-white/70">documents</strong> table with pgvector, the{" "}
              <strong className="text-white/70">match_documents</strong> function, and a{" "}
              <strong className="text-white/70">files</strong> storage bucket &mdash; all with RLS enabled.
            </p>

            {migrateResults.length > 0 && (
              <div className="mt-8 space-y-3">
                {migrateResults.map((r) => (
                  <div key={r.step} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm">
                    {r.status === "ok" ? (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600/20">
                        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600/20">
                        <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )}
                    <div>
                      <span className="font-medium text-white/80">{r.step}</span>
                      {r.message && <span className="ml-2 text-white/30">&mdash; {r.message}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-auto flex items-center justify-between pt-10">
              <Button onClick={goBack} variant="ghost" className="text-white/40 hover:text-white/60">
                Back
              </Button>
              <div className="flex gap-3">
                {!dbReady && migrateResults.length === 0 && (
                  <Button
                    onClick={runMigrationCheck}
                    disabled={loading}
                    className="bg-violet-600 hover:bg-violet-500"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Setting up...
                      </span>
                    ) : "Set up database"}
                  </Button>
                )}
                {!dbReady && migrateResults.length > 0 && (
                  <Button onClick={runMigrationCheck} disabled={loading} variant="ghost" className="border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white">
                    Retry
                  </Button>
                )}
                {dbReady && (
                  <Button onClick={goNext} className="bg-violet-600 hover:bg-violet-500">Continue</Button>
                )}
                {!dbReady && (
                  <Button onClick={goNext} variant="ghost" className="text-white/30 hover:text-white/50">
                    Skip
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Create Account ── */}
        {step === "account" && (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/15">
                <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create Your Account</h2>
                <p className="text-sm text-white/40">
                  Set up your first admin user to sign in with.
                </p>
              </div>
            </div>

            {!accountCreated ? (
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="account-email" className="text-sm text-white/60">Email</Label>
                  <Input
                    id="account-email"
                    type="email"
                    placeholder="you@example.com"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        document.getElementById("account-password")?.focus();
                      }
                    }}
                    className="mt-1.5 border-white/10 bg-white/[0.04]"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="account-password" className="text-sm text-white/60">Password</Label>
                  <Input
                    id="account-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && accountEmail && accountPassword.length >= 6) {
                        e.preventDefault();
                        createAccount();
                      }
                    }}
                    className="mt-1.5 border-white/10 bg-white/[0.04]"
                  />
                </div>
                <p className="text-xs text-white/25">
                  This creates a user in your Supabase Auth. You can add more users later from the Supabase dashboard.
                </p>
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600/20">
                  <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <p className="mt-4 text-lg font-medium">Account created!</p>
                <p className="mt-1 text-sm text-white/40">
                  You can sign in with <strong className="text-white/60">{accountEmail}</strong> after setup.
                </p>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-auto flex items-center justify-between pt-10">
              <Button onClick={goBack} variant="ghost" className="text-white/40 hover:text-white/60">
                Back
              </Button>
              <div className="flex gap-3">
                {!accountCreated ? (
                  <>
                    <Button onClick={goNext} variant="ghost" className="text-white/30 hover:text-white/50">
                      Skip
                    </Button>
                    <Button
                      onClick={createAccount}
                      disabled={loading || !accountEmail || accountPassword.length < 6}
                      className="bg-violet-600 hover:bg-violet-500"
                    >
                      {loading ? "Creating..." : "Create Account"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={goNext} className="bg-violet-600 hover:bg-violet-500">
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: AI (Bifrost + Flowise) ── */}
        {step === "ai" && (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/15">
                <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Configure AI</h2>
                <p className="text-sm text-white/40">Bifrost gateway &amp; Flowise agents. Both optional.</p>
              </div>
            </div>

            {/* Bifrost section */}
            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                <span className="h-px flex-1 bg-white/[0.06]" />
                Bifrost
                <span className="h-px flex-1 bg-white/[0.06]" />
              </h3>
              <p className="mt-2 text-xs text-white/30">
                AI gateway for 15+ providers.{" "}
                <code className="rounded bg-white/[0.06] px-1 py-0.5 font-mono">npx -y @maximhq/bifrost</code>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-white/40">Base URL</Label>
                  <Input
                    placeholder="http://localhost:8080/openai"
                    value={bifrostUrl}
                    onChange={(e) => setBifrostUrl(e.target.value)}
                    className="mt-1 border-white/10 bg-white/[0.04] text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-white/40">API Key</Label>
                  <Input
                    placeholder="bifrost-internal"
                    value={bifrostKey}
                    onChange={(e) => setBifrostKey(e.target.value)}
                    className="mt-1 border-white/10 bg-white/[0.04] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Flowise section */}
            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                <span className="h-px flex-1 bg-white/[0.06]" />
                Flowise
                <span className="h-px flex-1 bg-white/[0.06]" />
              </h3>
              <p className="mt-2 text-xs text-white/30">
                Visual AI pipeline builder.{" "}
                <code className="rounded bg-white/[0.06] px-1 py-0.5 font-mono">npx flowise start --port 3001</code>
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <Label className="text-xs text-white/40">Base URL</Label>
                  <Input
                    placeholder="http://localhost:3001"
                    value={flowiseUrl}
                    onChange={(e) => setFlowiseUrl(e.target.value)}
                    className="mt-1 border-white/10 bg-white/[0.04] text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-white/40">Chatflow ID <span className="text-white/20">(optional)</span></Label>
                    <Input
                      placeholder="From Flowise UI"
                      value={flowiseChatflowId}
                      onChange={(e) => setFlowiseChatflowId(e.target.value)}
                      className="mt-1 border-white/10 bg-white/[0.04] text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-white/40">API Key <span className="text-white/20">(optional)</span></Label>
                    <Input
                      placeholder="If auth is enabled"
                      value={flowiseKey}
                      onChange={(e) => setFlowiseKey(e.target.value)}
                      className="mt-1 border-white/10 bg-white/[0.04] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-auto flex items-center justify-between pt-10">
              <Button onClick={goBack} variant="ghost" className="text-white/40 hover:text-white/60">
                Back
              </Button>
              <div className="flex gap-3">
                <Button onClick={goNext} variant="ghost" className="text-white/30 hover:text-white/50">
                  Skip
                </Button>
                <Button onClick={goNext} className="bg-violet-600 hover:bg-violet-500">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Save ── */}
        {step === "save" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            {!saved ? (
              <>
                <Mascot size={72} />
                <h2 className="mt-6 text-2xl font-bold">
                  {userName ? `All set, ${userName}!` : "All set!"}
                </h2>
                <p className="mt-2 text-white/40">
                  This will create <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs">.env.local</code> with
                  your configuration.
                </p>

                <Card className="mx-auto mt-8 w-full max-w-md border-white/[0.06] bg-white/[0.02] text-left">
                  <CardContent className="space-y-1.5 pt-6 font-mono text-xs leading-relaxed">
                    <p className="text-white/25"># Supabase</p>
                    <p className="truncate text-white/50">NEXT_PUBLIC_SUPABASE_URL={supabaseUrl || <span className="text-white/15">not set</span>}</p>
                    <p className="truncate text-white/50">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY={supabaseKey ? "***" : <span className="text-white/15">not set</span>}</p>
                    <p className="mt-3 text-white/25"># Bifrost</p>
                    <p className="truncate text-white/50">BIFROST_BASE_URL={bifrostUrl}</p>
                    <p className="mt-3 text-white/25"># Flowise</p>
                    <p className="truncate text-white/50">FLOWISE_BASE_URL={flowiseUrl}</p>
                  </CardContent>
                </Card>

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <div className="mt-8 flex items-center gap-3">
                  <Button onClick={goBack} variant="ghost" className="text-white/40 hover:text-white/60">
                    Back
                  </Button>
                  <Button onClick={saveConfig} disabled={loading} className="bg-violet-600 px-8 hover:bg-violet-500">
                    {loading ? "Saving..." : "Save & Finish"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/20">
                  <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">
                  {userName ? `You're all set, ${userName}!` : "You're all set!"}
                </h2>
                <p className="mt-2 text-white/40">
                  Your <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs">.env.local</code> has been created.
                  Restart your dev server to apply.
                </p>
                <Card className="mt-8 border-white/[0.06] bg-white/[0.02]">
                  <CardContent className="pt-6">
                    <p className="text-sm text-white/30">Run this in your terminal:</p>
                    <code className="mt-2 block rounded bg-black/40 px-4 py-2 font-mono text-sm text-white/60">
                      npm run dev
                    </code>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
