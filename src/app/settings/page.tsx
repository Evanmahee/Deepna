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

  return (
    <div className="min-h-full flex-1">
      <PageHeader title="Paramètres" />
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        <Suspense fallback={<p className="text-sm text-neutral-500">…</p>}>
          <SettingsClient />
        </Suspense>
      </div>
    </div>
  );
}
