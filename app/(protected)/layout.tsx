import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { signout } from "../(auth)/actions";
import { Button } from "@/components/ui/button";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold tracking-tight">
              Pegasus <span className="text-white/50">Core</span>
            </span>
            <Nav />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40">{user.email}</span>
            <form>
              <Button
                type="submit"
                formAction={signout}
                variant="ghost"
                size="sm"
                className="border border-white/10 bg-white/[0.04] text-xs text-white/50 hover:bg-white/[0.08] hover:text-white"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
