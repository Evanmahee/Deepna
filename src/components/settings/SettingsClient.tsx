"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  email: string | null;
  display_name: string | null;
  subscription_status: string;
  has_stripe_customer: boolean;
};

export function SettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/profile");
        const j = (await res.json()) as ProfileData & { error?: string };
        if (!res.ok) throw new Error(j.error ?? "Erreur");
        setProfile(j);
        setDisplayName(j.display_name ?? "");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      setMsg("Abonnement activé — merci !");
    }
  }, [searchParams]);

  async function saveName() {
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName.trim() }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Erreur");
      setMsg("Prénom enregistré.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function checkout() {
    setBillingLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? "Checkout impossible");
      window.location.assign(j.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
      setBillingLoading(false);
    }
  }

  async function portal() {
    setBillingLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? "Portail impossible");
      window.location.assign(j.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
      setBillingLoading(false);
    }
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function deleteAccount() {
    if (deleteConfirm !== "SUPPRIMER") {
      setErr('Tape « SUPPRIMER » pour confirmer.');
      return;
    }
    setDeleting(true);
    setErr(null);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "SUPPRIMER" }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Suppression impossible");
      await createClient().auth.signOut();
      router.push("/");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Chargement…</p>;
  }

  const isPro = profile?.subscription_status === "active";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#333] bg-[#111] p-4">
        <h2 className="text-sm font-semibold text-white">Profil</h2>
        <p className="mt-1 text-xs text-zinc-500">{profile?.email}</p>
        <label className="mt-4 block space-y-1">
          <span className="text-xs text-zinc-400">Prénom</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-[#333] bg-[#0a0a0f] px-3 py-2 text-sm text-white"
          />
        </label>
        <button
          type="button"
          disabled={saving || !displayName.trim()}
          onClick={() => void saveName()}
          className="mt-3 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "…" : "Enregistrer"}
        </button>
      </section>

      <section className="rounded-xl border border-[#333] bg-[#111] p-4">
        <h2 className="text-sm font-semibold text-white">Abonnement Deepna Pro</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Statut :{" "}
          <span className={isPro ? "text-emerald-400" : "text-zinc-400"}>
            {isPro ? "Actif" : "Gratuit"}
          </span>
        </p>
        {isPro ? (
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void portal()}
            className="mt-3 rounded-lg border border-[#6366f1]/50 px-4 py-2 text-sm text-[#a5b4fc] disabled:opacity-50"
          >
            Gérer l&apos;abonnement
          </button>
        ) : (
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void checkout()}
            className="mt-3 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {billingLoading ? "…" : "Passer à Pro"}
          </button>
        )}
      </section>

      <section className="rounded-xl border border-[#333] bg-[#111] p-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="text-sm text-zinc-300 hover:text-white"
        >
          Se déconnecter
        </button>
      </section>

      <section className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
        <h2 className="text-sm font-semibold text-red-300">Zone de danger</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Supprime définitivement ton compte et toutes tes données.
        </p>
        <input
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder='Tape "SUPPRIMER"'
          className="mt-3 w-full rounded-lg border border-[#333] bg-[#0a0a0f] px-3 py-2 text-sm text-white"
        />
        <button
          type="button"
          disabled={deleting}
          onClick={() => void deleteAccount()}
          className="mt-3 rounded-lg border border-red-600 px-4 py-2 text-sm text-red-400 disabled:opacity-50"
        >
          {deleting ? "…" : "Supprimer mon compte"}
        </button>
      </section>

      <p className="text-center text-xs text-zinc-600">
        <Link href="/legal/privacy" className="hover:text-zinc-400">
          Confidentialité
        </Link>
        {" · "}
        <Link href="/legal/terms" className="hover:text-zinc-400">
          CGU
        </Link>
      </p>

      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
    </div>
  );
}
