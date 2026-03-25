"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  getWhitelist,
  addIpToWhitelist,
  removeIpFromWhitelist,
  getMyIp,
} from "./actions";
import type { IpWhitelistEntry } from "@/lib/types/database";

const SERVICES = [
  { id: "nextjs", label: "Next.js", color: "bg-white/10 text-white/70" },
  { id: "bifrost", label: "Bifrost", color: "bg-blue-500/10 text-blue-400" },
  { id: "flowise", label: "Flowise", color: "bg-amber-500/10 text-amber-400" },
] as const;

export default function SettingsPage() {
  const [entries, setEntries] = useState<IpWhitelistEntry[]>([]);
  const [ip, setIp] = useState("");
  const [label, setLabel] = useState("");
  const [services, setServices] = useState<string[]>(["nextjs", "bifrost", "flowise"]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [myIp, setMyIp] = useState<string | null>(null);

  useEffect(() => {
    loadWhitelist();
    getMyIp().then(setMyIp);
  }, []);

  function loadWhitelist() {
    startTransition(async () => {
      const data = await getWhitelist();
      setEntries(data);
    });
  }

  function toggleService(id: string) {
    setServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.set("ip", ip);
    formData.set("label", label);
    services.forEach((s) => formData.append("services", s));

    startTransition(async () => {
      const result = await addIpToWhitelist(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIp("");
        setLabel("");
        setServices(["nextjs", "bifrost", "flowise"]);
        loadWhitelist();
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await removeIpFromWhitelist(id);
      loadWhitelist();
    });
  }

  function handleAddMyIp() {
    if (myIp) {
      setIp(myIp);
      setLabel("My IP");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-white/40">
          Manage IP whitelist for secure access to all services.
        </p>
      </div>

      {/* Add IP form */}
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">Add IP Address</h2>
          <p className="mt-1 text-sm text-white/40">
            Only whitelisted IPs can access your app. Your current IP is{" "}
            {myIp ? (
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-white/60">
                {myIp}
              </code>
            ) : (
              "unknown"
            )}
          </p>

          <form onSubmit={handleAdd} className="mt-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="ip" className="text-sm text-white/50">
                  IP Address
                </Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    id="ip"
                    placeholder="1.2.3.4"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="border-white/10 bg-white/[0.04] font-mono"
                    required
                  />
                  {myIp && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMyIp}
                      className="shrink-0 border-white/10 bg-white/[0.04] text-xs text-white/50 hover:text-white"
                    >
                      Use My IP
                    </Button>
                  )}
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="label" className="text-sm text-white/50">
                  Label
                </Label>
                <Input
                  id="label"
                  placeholder="e.g. Office"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="mt-1.5 border-white/10 bg-white/[0.04]"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-white/50">Allowed Services</Label>
              <div className="mt-2 flex gap-2">
                {SERVICES.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      services.includes(svc.id)
                        ? `${svc.color} border-white/20`
                        : "border-white/5 text-white/20"
                    }`}
                  >
                    {svc.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              disabled={isPending || !ip}
              className="bg-violet-600 px-6 hover:bg-violet-500"
            >
              {isPending ? "Adding..." : "Add to Whitelist"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Whitelist table */}
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">Whitelisted IPs</h2>
          <p className="mt-1 text-sm text-white/40">
            {entries.length === 0
              ? "No IPs whitelisted yet. All traffic is currently allowed."
              : `${entries.length} IP${entries.length === 1 ? "" : "s"} whitelisted.`}
          </p>

          {entries.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-lg border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-4 py-2.5 text-left font-medium text-white/40">
                      IP Address
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-white/40">
                      Label
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-white/40">
                      Services
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-white/40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-white/70">
                        {entry.ip_address}
                        {myIp && entry.ip_address === myIp && (
                          <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/40">
                        {entry.label || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {entry.allowed_services.map((svc) => {
                            const meta = SERVICES.find((s) => s.id === svc);
                            return (
                              <span
                                key={svc}
                                className={`rounded px-2 py-0.5 text-xs ${
                                  meta?.color || "bg-white/5 text-white/30"
                                }`}
                              >
                                {meta?.label || svc}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          disabled={isPending}
                          className="text-red-400/60 hover:text-red-400"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lockout recovery info */}
      <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-4 text-xs text-white/30">
        <strong className="text-white/50">Locked out?</strong> Set{" "}
        <code className="rounded bg-white/[0.06] px-1 py-0.5 font-mono">
          IP_WHITELIST_DISABLED=true
        </code>{" "}
        in your <code className="font-mono">.env.local</code> and restart, or insert your IP directly
        in the Supabase SQL editor.
      </div>
    </div>
  );
}
