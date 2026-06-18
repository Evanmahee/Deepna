import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayUtcString } from "@/lib/dates";
import { IdentityClient } from "@/components/identity/IdentityClient";
import { PageHeader } from "@/components/nav/PageHeader";
import type { IdentityCheckinRow } from "@/types/identity";

export const metadata: Metadata = {
  title: "Identité — Deepna",
};

export default async function IdentityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const today = todayUtcString();

  const [profileRes, checkinsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("identity_statement, display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("identity_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_on", today),
  ]);

  const initialStatement = profileRes.data?.identity_statement ?? null;
  const checkins = (checkinsRes.data ?? []) as IdentityCheckinRow[];
  const firstName = profileRes.data?.display_name?.trim() ?? null;
  const greeting = firstName ? `Bonjour ${firstName} 👋` : null;

  return (
    <div className="min-h-full flex-1 bg-[#0a0a0f] text-white">
      <PageHeader
        title="Identité"
        greeting={greeting}
        subtitle={`Check-ins du jour (UTC ${today})`}
      />
      <IdentityClient
        initialStatement={initialStatement}
        checkins={checkins}
      />
    </div>
  );
}
