"use client";

import { useCallback, useEffect, useState } from "react";
import { glassSectionClass } from "@/lib/glass";
import { useToast } from "@/components/ui/ToastProvider";

type ShareState = {
  share_token: string | null;
  share_public: boolean;
  share_url: string | null;
  display_name: string | null;
};

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

export function ShareClient() {
  const { showToast } = useToast();
  const [data, setData] = useState<ShareState | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/share");
    const j = (await res.json()) as ShareState & { error?: string };
    if (!res.ok) throw new Error(j.error ?? "Erreur");
    setData(j);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  async function generateLink() {
    setGenerating(true);
    setErr(null);
    try {
      const res = await fetch("/api/share", { method: "POST" });
      const j = (await res.json()) as {
        share_token?: string;
        share_url?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(j.error ?? "Génération impossible");
      await load();
      showToast("Lien de partage créé");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setGenerating(false);
    }
  }

  async function togglePublic(next: boolean) {
    setToggling(true);
    setErr(null);
    try {
      const res = await fetch("/api/share", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share_public: next }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Mise à jour impossible");
      await load();
      showToast(
        next ? "Habitudes rendues publiques" : "Habitudes en privé",
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setToggling(false);
    }
  }

  async function copyUrl() {
    if (!data?.share_url) return;
    try {
      await navigator.clipboard.writeText(data.share_url);
      showToast("Lien copié");
    } catch {
      setErr("Copie impossible — sélectionne le lien manuellement.");
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Chargement…</p>;
  }

  return (
    <div className="space-y-6">
      <section className={glassSectionClass}>
        <h2 className="text-sm font-semibold text-white">Lien de partage</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Partage tes streaks avec tes proches — lecture seule, sans données
          privées.
        </p>

        {data?.share_url ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
              <p className="break-all text-sm text-indigo-300">{data.share_url}</p>
            </div>
            <button
              type="button"
              onClick={() => void copyUrl()}
              className="btn-primary w-full px-4 py-2.5 text-sm"
            >
              Copier le lien
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={generating}
            onClick={() => void generateLink()}
            className="btn-primary mt-4 w-full px-4 py-2.5 text-sm disabled:opacity-50"
          >
            {generating ? "…" : "Générer mon lien de partage"}
          </button>
        )}
      </section>

      <section className={glassSectionClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Rendre mes habitudes publiques
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Visible sur ton lien public (nom, icône, streak).
            </p>
          </div>
          <IosSwitch
            label="Habitudes publiques"
            checked={data?.share_public ?? false}
            disabled={toggling || !data?.share_token}
            onChange={(v) => void togglePublic(v)}
          />
        </div>
        {!data?.share_token ? (
          <p className="mt-2 text-xs text-neutral-600">
            Génère d&apos;abord un lien de partage.
          </p>
        ) : null}
      </section>

      {err ? <p className="text-sm text-red-400">{err}</p> : null}
    </div>
  );
}
