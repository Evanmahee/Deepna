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

import { glassInputClass, glassSectionClass } from "@/lib/glass";

const inputClass = glassInputClass;

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
    return <p className="text-sm text-slate-500">Chargement…</p>;
  }

  const isPro = profile?.subscription_status === "active";

  return (
    <div className="space-y-6">
      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-slate-900">Profil</h2>
        <p className="mt-1 text-xs text-slate-500">{profile?.email}</p>
        <label className="mt-4 block space-y-1">
          <span className="text-xs font-medium text-slate-600">Prénom</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass}
          />
        </label>
        <button
          type="button"
          disabled={saving || !displayName.trim()}
          onClick={() => void saveName()}
          className="mt-3 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "…" : "Enregistrer"}
        </button>
      </section>

      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-slate-900">Abonnement Deepna Pro</h2>
        <p className="mt-1 text-xs text-slate-500">
          Statut :{" "}
          <span className={isPro ? "font-medium text-neutral-900" : "text-slate-500"}>
            {isPro ? "Actif" : "Gratuit"}
          </span>
        </p>
        {isPro ? (
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void portal()}
            className="glass-pill mt-3 rounded-xl px-4 py-2 text-sm text-neutral-900 disabled:opacity-50"
          >
            Gérer l&apos;abonnement
          </button>
        ) : (
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void checkout()}
            className="mt-3 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
          >
            {billingLoading ? "…" : "Passer à Pro"}
          </button>
        )}
      </section>

      <section className={glassSectionClass}>
        <button
          type="button"
          onClick={() => void logout()}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Se déconnecter
        </button>
      </section>

      <section className="glass-subtle rounded-xl p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Zone de danger</h2>
        <p className="mt-1 text-xs text-slate-600">
          Supprime définitivement ton compte et toutes tes données.
        </p>
        <input
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder='Tape "SUPPRIMER"'
          className={`mt-3 ${inputClass}`}
        />
        <button
          type="button"
          disabled={deleting}
          onClick={() => void deleteAccount()}
          className="mt-3 rounded-xl border border-neutral-400 px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-200 disabled:opacity-50"
        >
          {deleting ? "…" : "Supprimer mon compte"}
        </button>
      </section>

      <p className="text-center text-xs text-slate-500">
        <Link href="/legal/privacy" className="hover:text-slate-800">
          Confidentialité
        </Link>
        {" · "}
        <Link href="/legal/terms" className="hover:text-slate-800">
          CGU
        </Link>
      </p>

      {msg ? <p className="text-sm text-neutral-900">{msg}</p> : null}
      {err ? <p className="text-sm text-neutral-700">{err}</p> : null}
    </div>
  );
}
