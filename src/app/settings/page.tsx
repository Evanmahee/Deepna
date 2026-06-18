import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/nav/PageHeader";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata: Metadata = {
  title: "Paramètres — Deepna",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-full flex-1 bg-[#0a0a0f] text-white">
      <PageHeader
        title="Paramètres"
        firstName={profile?.display_name?.trim() ?? null}
      />
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        <Suspense fallback={<p className="text-sm text-zinc-500">…</p>}>
          <SettingsClient />
        </Suspense>
      </div>
    </div>
  );
}
