"use server";

import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/ip";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { IpWhitelistEntry } from "@/lib/types/database";

// Invalidate middleware cache by touching a global
// (The middleware cache auto-expires in 60s anyway)

export async function getWhitelist(): Promise<IpWhitelistEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ip_whitelist")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as IpWhitelistEntry[]) ?? [];
}

export async function addIpToWhitelist(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const ip = formData.get("ip") as string;
  const label = (formData.get("label") as string) || "";
  const services = formData.getAll("services") as string[];

  if (!ip) return { error: "IP address is required" };

  const { error } = await supabase.from("ip_whitelist").upsert(
    {
      ip_address: ip,
      label,
      allowed_services: services.length > 0 ? services : ["nextjs", "bifrost", "flowise"],
      created_by: user.id,
    },
    { onConflict: "ip_address" }
  );

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}

export async function removeIpFromWhitelist(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("ip_whitelist").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}

export async function getMyIp(): Promise<string | null> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0].trim();
    return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  }
  const realIp = h.get("x-real-ip");
  if (realIp) {
    const ip = realIp.trim();
    return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  }
  return null;
}
