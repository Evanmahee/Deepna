"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, X } from "lucide-react";
import type { TimeBlockRow } from "@/types/today";
import {
  groupTemplatesBySection,
  TEMPLATE_TABS,
  templatesForCategory,
  type HabitTemplate,
  type TemplateCategory,
} from "@/lib/habit-templates";
import { CreateHabitModalSheet } from "@/components/today/CreateHabitModalSheet";

type CreateHabitModalProps = {
  open: boolean;
  onClose: () => void;
  timeBlocks: TimeBlockRow[];
};

type ModalView = "templates" | "custom";

export function CreateHabitModal({
  open,
  onClose,
  timeBlocks,
}: CreateHabitModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ModalView>("templates");
  const [category, setCategory] = useState<TemplateCategory>("bonnes");
  const [query, setQuery] = useState("");
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [customDefaults, setCustomDefaults] = useState<{
    name: string;
    emoji: string;
    type: "good" | "bad" | "neutral";
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setView("templates");
      setCategory("bonnes");
      setQuery("");
      setErr(null);
      setCustomDefaults(null);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const base = templatesForCategory(category);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((t) => t.name.toLowerCase().includes(q));
  }, [category, query]);

  const sections = useMemo(
    () => groupTemplatesBySection(filtered),
    [filtered],
  );

  const createLabel =
    category === "afaire" ? "Créer une tâche" : "Créer une habitude";

  async function createFromTemplate(template: HabitTemplate) {
    setCreatingId(template.id);
    setErr(null);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          icon_emoji: template.emoji,
          habit_type: template.habit_type,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Création impossible");
      onClose();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCreatingId(null);
    }
  }

  function openCustomForm(defaults?: {
    name: string;
    emoji: string;
    type: "good" | "bad" | "neutral";
  }) {
    setCustomDefaults(
      defaults ?? {
        name: "",
        emoji: "⭐",
        type:
          category === "mauvaises"
            ? "bad"
            : category === "afaire"
              ? "neutral"
              : "good",
      },
    );
    setView("custom");
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 glass-overlay"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="glass-sheet-dark relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px]">
        {view === "custom" ? (
          <CreateHabitModalSheet
            variant="dark"
            embedded
            onClose={onClose}
            onBack={() => setView("templates")}
            timeBlocks={timeBlocks}
            initialName={customDefaults?.name ?? ""}
            initialEmoji={customDefaults?.emoji ?? "⭐"}
            initialType={customDefaults?.type ?? "good"}
          />
        ) : (
          <>
            <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center px-4 pb-4 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="glass-dark flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 active:scale-95"
                aria-label="Fermer"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </button>
              <h2 className="text-center text-lg font-semibold text-white">
                Modèles
              </h2>
              <span aria-hidden className="h-11 w-11" />
            </header>
            <div className="shrink-0 overflow-x-auto px-4 pb-3 pt-4">
            <div className="flex w-max gap-2">
              {TEMPLATE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCategory(tab.id);
                    setQuery("");
                  }}
                  className={[
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    category === tab.id
                      ? "bg-neutral-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            <button
              type="button"
              onClick={() => openCustomForm()}
              className="glass-dark-subtle mb-4 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/10"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-2xl font-light leading-none text-white shadow-md shadow-neutral-900/15">
                +
              </span>
              <span className="flex-1 text-base font-medium text-white">
                {createLabel}
              </span>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>

            {sections.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">
                Aucun modèle trouvé.
              </p>
            ) : (
              sections.map(({ section, items }) => (
                <section key={section} className="mb-4">
                  <h3 className="mb-2 px-1 text-sm font-medium text-neutral-500">
                    {section}
                  </h3>
                  <ul className="glass-dark-subtle overflow-hidden rounded-2xl">
                    {items.map((template) => (
                      <li key={template.id}>
                        <button
                          type="button"
                          disabled={creatingId === template.id}
                          onClick={() => void createFromTemplate(template)}
                          className="flex w-full items-center gap-3 border-b border-neutral-700/50 px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-neutral-700/30 disabled:opacity-50"
                        >
                          <span
                            className="text-xl leading-none"
                            aria-hidden
                          >
                            {template.emoji}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-base text-white">
                            {creatingId === template.id
                              ? "Création…"
                              : template.name}
                          </span>
                          <ChevronRight className="h-5 w-5 shrink-0 text-neutral-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}

            {err ? (
              <p className="mt-3 text-center text-sm text-rose-400">{err}</p>
            ) : null}
          </div>

          <div className="relative z-10 -mt-3 shrink-0 px-3 pb-6 pt-0">
            <label className="glass-dark flex h-10 items-center gap-2 rounded-full px-4">
              <Search className="h-4 w-4 shrink-0 text-white" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Recherche"
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
            </label>
          </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
