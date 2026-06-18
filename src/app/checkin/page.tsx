import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/nav/PageHeader";
import { CheckinPageClient } from "@/app/checkin/CheckinPageClient";
import type { HourlyCheckinRow } from "@/types/hourly";

export const metadata: Metadata = {
  title: "Check-in horaire — Deepna",
};

export default async function CheckinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: hist }, profileRes] = await Promise.all([
    supabase
      .from("hourly_checkins")
      .select("id, user_id, slot_hour, note, mood")
      .eq("user_id", user.id)
      .order("slot_hour", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const rows = (hist ?? []) as HourlyCheckinRow[];
  const firstName = profileRes.data?.display_name?.trim() ?? null;

  return (
    <div className="min-h-full flex-1 bg-[#0a0a0f] text-white">
      <PageHeader title="Check-in horaire" firstName={firstName} />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6 pb-28">
        <CheckinPageClient rows={rows} />
      </div>
    </div>
  );
}
