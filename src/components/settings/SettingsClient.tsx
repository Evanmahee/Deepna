"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensurePushSubscription } from "@/lib/push-client";
import { glassInputClass, glassSectionClass } from "@/lib/glass";

type ProfileData = {
  email: string | null;
  display_name: string | null;
  subscription_status: string;
  has_stripe_customer: boolean;
};

type NotifData = {
  enabled: boolean;
  scheduled_time: string;
  has_push_subscription: boolean;
};

const inputClass = glassInputClass;

function IosSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-state={checked ? "on" : "off"}
      className="ios-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="ios-switch-thumb" />
    </button>
  );
}

export function SettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [profRes, notifRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/notifications/daily"),
        ]);
        const prof = (await profRes.json()) as ProfileData & { error?: string };
        const notif = (await notifRes.json()) as NotifData & { error?: string };
        if (!profRes.ok) throw new Error(prof.error ?? "Erreur profil");
        setProfile(prof);
        setDisplayName(prof.display_name ?? "");
        if (notifRes.ok) {
          setNotifEnabled(notif.enabled);
          setReminderTime(notif.scheduled_time ?? "09:00");
        }
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

  async function saveNotifSettings(next: {
    enabled?: boolean;
    scheduled_time?: string;
  }) {
    setNotifSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/notifications/daily", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const j = (await res.json()) as {
        error?: string;
        enabled?: boolean;
        scheduled_time?: string;
      };
      if (!res.ok) throw new Error(j.error ?? "Erreur notifications");
      if (typeof j.enabled === "boolean") setNotifEnabled(j.enabled);
      if (j.scheduled_time) setReminderTime(j.scheduled_time);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
      throw e;
    } finally {
      setNotifSaving(false);
    }
  }

  async function toggleNotifications(enabled: boolean) {
    if (enabled) {
      const ok = await ensurePushSubscription();
      if (!ok) {
        setErr(
          "Autorise les notifications dans ton navigateur pour activer les rappels.",
        );
        return;
      }
    }
    try {
      await saveNotifSettings({ enabled, scheduled_time: reminderTime });
      setMsg(enabled ? "Notifications activées." : "Notifications désactivées.");
    } catch {
      setNotifEnabled(!enabled);
    }
  }

  async function onReminderTimeChange(time: string) {
    setReminderTime(time);
    if (notifEnabled) {
      try {
        await saveNotifSettings({ enabled: true, scheduled_time: time });
      } catch {
        /* err affiché */
      }
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
    return <p className="text-sm text-neutral-500">Chargement…</p>;
  }

  const isPro = profile?.subscription_status === "active";

  return (
    <div className="space-y-6">
      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-white">Compte</h2>
        <label className="mt-4 block space-y-1">
          <span className="text-xs font-medium text-neutral-400">Prénom</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block space-y-1">
          <span className="text-xs font-medium text-neutral-400">Email</span>
          <input
            value={profile?.email ?? ""}
            readOnly
            className={`${inputClass} cursor-not-allowed opacity-60`}
          />
        </label>
        <button
          type="button"
          disabled={saving || !displayName.trim()}
          onClick={() => void saveName()}
          className="btn-primary mt-3 px-4 py-2 text-sm disabled:opacity-50"
        >
          {saving ? "…" : "Enregistrer le prénom"}
        </button>
      </section>

      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-white">Notifications</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Rappel push quotidien pour tes habitudes.
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-neutral-300">Notifications push</span>
          <IosSwitch
            label="Activer les notifications push"
            checked={notifEnabled}
            disabled={notifSaving}
            onChange={(v) => void toggleNotifications(v)}
          />
        </div>
        <label className="mt-4 block space-y-1">
          <span className="text-xs font-medium text-neutral-400">
            Heure du rappel quotidien
          </span>
          <input
            type="time"
            value={reminderTime}
            disabled={!notifEnabled || notifSaving}
            onChange={(e) => void onReminderTimeChange(e.target.value)}
            className={`${inputClass} disabled:opacity-40`}
          />
        </label>
      </section>

      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-white">Abonnement Deepna Pro</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Statut :{" "}
          <span className={isPro ? "font-medium text-indigo-300" : ""}>
            {isPro ? "Actif" : "Gratuit"}
          </span>
        </p>
        {isPro ? (
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void portal()}
            className="glass-pill mt-3 rounded-xl px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Gérer l&apos;abonnement
          </button>
        ) : (
          <button
            type="button"
            disabled={billingLoading}
            onClick={() => void checkout()}
            className="btn-primary mt-3 px-4 py-2 text-sm disabled:opacity-50"
          >
            {billingLoading ? "…" : "Passer à Pro"}
          </button>
        )}
      </section>

      <button
        type="button"
        onClick={() => void logout()}
        className="w-full rounded-xl border border-white/15 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
      >
        Se déconnecter
      </button>

      <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <h2 className="text-sm font-semibold text-red-400">Zone de danger</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Supprime définitivement ton compte et toutes tes données.
        </p>
        <button
          type="button"
          onClick={() => {
            setDeleteConfirm("");
            setDeleteModalOpen(true);
          }}
          className="mt-3 rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          Supprimer mon compte
        </button>
      </section>

      <p className="text-center text-xs text-neutral-500">
        <Link href="/legal/privacy" className="hover:text-neutral-300">
          Confidentialité
        </Link>
        {" · "}
        <Link href="/legal/terms" className="hover:text-neutral-300">
          CGU
        </Link>
      </p>

      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      {deleteModalOpen ? (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="glass-sheet-dark w-full max-w-md rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white">
              Supprimer le compte ?
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Cette action est irréversible. Toutes tes habitudes, logs et
              objectifs seront effacés.
            </p>
            <p className="mt-4 text-xs text-neutral-500">
              Tape <strong className="text-white">SUPPRIMER</strong> pour
              confirmer :
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              className={`mt-2 ${inputClass}`}
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-neutral-300"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleting || deleteConfirm !== "SUPPRIMER"}
                onClick={() => void deleteAccount()}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {deleting ? "…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
