import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/nav/PageHeader";
import { ShareClient } from "@/components/share/ShareClient";

export const metadata: Metadata = {
  title: "Partage — Deepna",
};

export default async function SharePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full flex-1">
      <PageHeader title="Partage" subtitle="Montre ta progression" />
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        <ShareClient />
      </div>
    </div>
  );
}
