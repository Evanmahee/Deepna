"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensurePushSubscription } from "@/lib/push-client";
import { glassInputClass, glassSectionClass } from "@/lib/glass";
import {
  ALL_NOTIFICATION_DAYS,
  NOTIFICATION_DAYS,
  type NotificationDayId,
} from "@/lib/notification-days";

type ProfileData = {
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  subscription_status: string;
  has_stripe_customer: boolean;
};

type NotifData = {
  enabled: boolean;
  scheduled_time: string;
  days: NotificationDayId[];
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [notifDays, setNotifDays] = useState<NotificationDayId[]>([
    ...ALL_NOTIFICATION_DAYS,
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
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
        setAvatarUrl(prof.avatar_url ?? null);
        if (notifRes.ok) {
          setNotifEnabled(notif.enabled);
          setReminderTime(notif.scheduled_time ?? "09:00");
          setNotifDays(notif.days ?? [...ALL_NOTIFICATION_DAYS]);
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

  async function uploadAvatar(file: File) {
    setAvatarUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const j = (await res.json()) as { avatar_url?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Upload impossible");
      setAvatarUrl(j.avatar_url ?? null);
      setMsg("Photo mise à jour.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function saveNotifSettings(next: {
    enabled?: boolean;
    scheduled_time?: string;
    days?: NotificationDayId[];
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
        days?: NotificationDayId[];
      };
      if (!res.ok) throw new Error(j.error ?? "Erreur notifications");
      if (typeof j.enabled === "boolean") setNotifEnabled(j.enabled);
      if (j.scheduled_time) setReminderTime(j.scheduled_time);
      if (j.days) setNotifDays(j.days);
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
        setErr("Autorise les notifications dans ton navigateur.");
        return;
      }
    }
    try {
      await saveNotifSettings({
        enabled,
        scheduled_time: reminderTime,
        days: notifDays,
      });
      setMsg(enabled ? "Notifications activées." : "Notifications désactivées.");
    } catch {
      setNotifEnabled(!enabled);
    }
  }

  function toggleNotifDay(id: NotificationDayId) {
    const next = notifDays.includes(id)
      ? notifDays.filter((d) => d !== id)
      : [...notifDays, id];
    setNotifDays(next);
    if (notifEnabled) {
      void saveNotifSettings({
        enabled: true,
        scheduled_time: reminderTime,
        days: next,
      });
    }
  }

  async function exportData() {
    setExporting(true);
    setErr(null);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Export impossible");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deepna-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Export téléchargé.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setExporting(false);
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
    await createClient().auth.signOut();
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
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            disabled={avatarUploading}
            onClick={() => fileRef.current?.click()}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white/10"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl text-neutral-500">
                👤
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadAvatar(f);
            }}
          />
          <div>
            <p className="text-sm text-white">Photo de profil</p>
            <p className="text-xs text-neutral-500">JPG ou PNG, max 2 Mo</p>
          </div>
        </div>
        <label className="mt-4 block space-y-1">
          <span className="text-xs font-medium text-neutral-400">Prénom</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
        </label>
        <label className="mt-3 block space-y-1">
          <span className="text-xs font-medium text-neutral-400">Email</span>
          <input value={profile?.email ?? ""} readOnly className={`${inputClass} cursor-not-allowed opacity-60`} />
        </label>
        <button type="button" disabled={saving || !displayName.trim()} onClick={() => void saveName()} className="btn-primary mt-3 px-4 py-2 text-sm disabled:opacity-50">
          {saving ? "…" : "Enregistrer"}
        </button>
      </section>

      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-white">Apparence</h2>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-300">Thème sombre</p>
            <p className="text-xs text-neutral-500">Actif</p>
          </div>
          <IosSwitch label="Thème sombre" checked disabled onChange={() => {}} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 opacity-50">
          <div>
            <p className="text-sm text-neutral-300">Thème clair</p>
            <p className="text-xs text-neutral-500">Bientôt disponible</p>
          </div>
          <IosSwitch label="Thème clair" checked={false} disabled onChange={() => {}} />
        </div>
        <div className="mt-3">
          <p className="text-sm text-neutral-300">Langue</p>
          <p className="mt-1 text-xs text-neutral-500">Français (EN bientôt disponible)</p>
        </div>
      </section>

      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-white">Notifications</h2>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-neutral-300">Notifications push</span>
          <IosSwitch label="Push" checked={notifEnabled} disabled={notifSaving} onChange={(v) => void toggleNotifications(v)} />
        </div>
        <label className="mt-4 block space-y-1">
          <span className="text-xs font-medium text-neutral-400">Heure du rappel</span>
          <input type="time" value={reminderTime} disabled={!notifEnabled || notifSaving} onChange={(e) => { setReminderTime(e.target.value); if (notifEnabled) void saveNotifSettings({ enabled: true, scheduled_time: e.target.value, days: notifDays }); }} className={`${inputClass} disabled:opacity-40`} />
        </label>
        <p className="mt-4 text-xs font-medium text-neutral-400">Jours actifs</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {NOTIFICATION_DAYS.map((d) => (
            <button key={d.id} type="button" disabled={!notifEnabled || notifSaving} onClick={() => toggleNotifDay(d.id)} className={`h-9 w-9 rounded-full text-xs font-medium disabled:opacity-40 ${notifDays.includes(d.id) ? "bg-indigo-500 text-white" : "bg-white/10 text-neutral-400"}`}>
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-white">Données</h2>
        <p className="mt-1 text-xs text-neutral-500">Télécharge toutes tes habitudes et logs en JSON.</p>
        <button type="button" disabled={exporting} onClick={() => void exportData()} className="glass-pill mt-3 rounded-xl px-4 py-2 text-sm text-white disabled:opacity-50">
          {exporting ? "…" : "Exporter mes données"}
        </button>
      </section>

      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-white">Abonnement</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Plan actuel :{" "}
          <span className={isPro ? "font-medium text-indigo-300" : "text-white"}>
            {isPro ? "Pro" : "Gratuit"}
          </span>
        </p>
        {isPro ? (
          <button type="button" disabled={billingLoading} onClick={() => void portal()} className="glass-pill mt-3 rounded-xl px-4 py-2 text-sm text-white disabled:opacity-50">
            Gérer l&apos;abonnement
          </button>
        ) : (
          <button type="button" disabled={billingLoading} onClick={() => void checkout()} className="btn-primary mt-3 px-4 py-2 text-sm disabled:opacity-50">
            {billingLoading ? "…" : "Passer à Pro"}
          </button>
        )}
      </section>

      <button type="button" onClick={() => void logout()} className="w-full rounded-xl border border-white/15 py-3 text-sm font-medium text-white hover:bg-white/5">
        Se déconnecter
      </button>

      <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <h2 className="text-sm font-semibold text-red-400">Zone de danger</h2>
        <p className="mt-1 text-xs text-neutral-400">Supprime définitivement ton compte et toutes tes données.</p>
        <button type="button" onClick={() => { setDeleteConfirm(""); setDeleteModalOpen(true); }} className="mt-3 rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
          Supprimer mon compte
        </button>
      </section>

      <p className="text-center text-xs text-neutral-500">
        <Link href="/legal/privacy" className="hover:text-neutral-300">Confidentialité</Link>
        {" · "}
        <Link href="/legal/terms" className="hover:text-neutral-300">CGU</Link>
      </p>

      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      {deleteModalOpen ? (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="glass-sheet-dark w-full max-w-md rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white">Supprimer le compte ?</h3>
            <p className="mt-2 text-sm text-neutral-400">Cette action est irréversible.</p>
            <p className="mt-4 text-xs text-neutral-500">Tape <strong className="text-white">SUPPRIMER</strong> :</p>
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="SUPPRIMER" className={`mt-2 ${inputClass}`} autoFocus />
            <div className="mt-4 flex gap-2">
              <button type="button" disabled={deleting} onClick={() => setDeleteModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-neutral-300">Annuler</button>
              <button type="button" disabled={deleting || deleteConfirm !== "SUPPRIMER"} onClick={() => void deleteAccount()} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white disabled:opacity-50">
                {deleting ? "…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
