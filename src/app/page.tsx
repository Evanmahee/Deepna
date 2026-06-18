import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/LandingPage";
import { TodayPage } from "@/components/today/TodayPage";

export const metadata: Metadata = {
  title: "Deepna — Deviens qui tu veux être",
  description: "Habitudes, identité et suivi personnel avec Deepna.",
};

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  return <TodayPage searchParams={searchParams} />;
}
