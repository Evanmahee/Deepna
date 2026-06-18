"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, GripHorizontal, Minus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { HabitRowData, TimeBlockRow } from "@/types/today";

type SortGroup = {
  timeBlockId: string | null;
  block: TimeBlockRow | null;
  habits: HabitRowData[];
};

type SortHabitsModalProps = {
  open: boolean;
  onClose: () => void;
};

type ViewMode = "habits" | "groups";

type DragTarget =
  | { kind: "habit"; groupIdx: number; habitIdx: number }
  | { kind: "group"; groupIdx: number };

const BLOCK_COLORS = [
  "bg-neutral-600",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-blue-500",
] as const;

const HABIT_NAME_CLASS: Record<HabitRowData["habit_type"], string> = {
  good: "text-emerald-400",
  bad: "text-rose-400",
  neutral: "text-violet-400",
};

function formatBlockTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(11, 16);
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function blockTimeLabel(block: TimeBlockRow): string {
  const start = formatBlockTime(block.starts_at);
  const end = formatBlockTime(block.ends_at);
  return `${start}–${end}`;
}

function DeleteButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition-transform active:scale-95"
      aria-label={label}
    >
      <Minus className="h-3.5 w-3.5" strokeWidth={3} />
    </button>
  );
}

function DragHandle() {
  return (
    <GripHorizontal
      className="h-5 w-5 shrink-0 text-neutral-500"
      strokeWidth={2}
      aria-hidden
    />
  );
}

export function SortHabitsModal({ open, onClose }: SortHabitsModalProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<SortGroup[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("habits");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragTarget | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const supabase = createClient();
      const [tbRes, habitsRes] = await Promise.all([
        supabase
          .from("time_blocks")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("habits")
          .select("*")
          .eq("archived", false)
          .order("name", { ascending: true }),
      ]);

      const blocks = (tbRes.data ?? []) as TimeBlockRow[];
      const habits = ((habitsRes.data ?? []) as HabitRowData[]).sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          a.name.localeCompare(b.name, "fr"),
      );

      const byBlock = new Map<string | null, HabitRowData[]>();
      for (const h of habits) {
        const key = h.time_block_id;
        const arr = byBlock.get(key) ?? [];
        arr.push(h);
        byBlock.set(key, arr);
      }

      const next: SortGroup[] = blocks.map((block) => ({
        timeBlockId: block.id,
        block,
        habits: byBlock.get(block.id) ?? [],
      }));

      const unassigned = byBlock.get(null) ?? [];
      if (unassigned.length > 0) {
        next.push({ timeBlockId: null, block: null, habits: unassigned });
      }

      setGroups(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setViewMode("habits");
      void load();
    }
  }, [open, load]);

  function moveHabit(
    fromGroup: number,
    fromIdx: number,
    toGroup: number,
    toIdx: number,
  ) {
    setGroups((prev) => {
      const copy = prev.map((g) => ({
        ...g,
        habits: [...g.habits],
      }));
      const [item] = copy[fromGroup].habits.splice(fromIdx, 1);
      if (!item) return prev;
      copy[toGroup].habits.splice(toIdx, 0, item);
      return copy;
    });
  }

  function moveGroup(fromIdx: number, toIdx: number) {
    setGroups((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIdx, 1);
      if (!item?.block) return prev;
      copy.splice(toIdx, 0, item);
      return copy;
    });
  }

  async function deleteHabit(groupIdx: number, habitIdx: number) {
    const habit = groups[groupIdx]?.habits[habitIdx];
    if (!habit) return;

    setErr(null);
    try {
      const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Suppression impossible");

      setGroups((prev) => {
        const copy = prev.map((g) => ({
          ...g,
          habits: [...g.habits],
        }));
        copy[groupIdx].habits.splice(habitIdx, 1);
        return copy;
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function deleteBlock(groupIdx: number) {
    const block = groups[groupIdx]?.block;
    if (!block) return;

    setErr(null);
    try {
      const res = await fetch(`/api/time-blocks/${block.id}`, {
        method: "DELETE",
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Suppression impossible");

      setGroups((prev) => {
        const copy = prev.map((g) => ({
          ...g,
          habits: [...g.habits],
        }));
        const unassigned = copy.find((g) => g.block === null);
        const habits = copy[groupIdx].habits;
        if (unassigned) {
          unassigned.habits.push(...habits);
        } else if (habits.length > 0) {
          copy.push({ timeBlockId: null, block: null, habits });
        }
        copy.splice(groupIdx, 1);
        return copy;
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      if (viewMode === "groups") {
        const blockIds = groups
          .map((g) => g.block?.id)
          .filter((id): id is string => Boolean(id));

        const res = await fetch("/api/time-blocks/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ block_ids: blockIds }),
        });
        const j = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? "Enregistrement impossible");
      } else {
        const res = await fetch("/api/habits/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groups: groups.map((g) => ({
              time_block_id: g.timeBlockId,
              habit_ids: g.habits.map((h) => h.id),
            })),
          }),
        });
        const j = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? "Enregistrement impossible");
      }

      onClose();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !mounted) return null;

  const blockGroups = groups.filter((g) => g.block);
  const totalHabits = groups.reduce((n, g) => n + g.habits.length, 0);
  const canSave =
    viewMode === "groups" ? blockGroups.length > 0 : totalHabits > 0;

  const habitRows = groups.flatMap((group, groupIdx) => {
    const rows = [];

    if (group.block) {
      const color = BLOCK_COLORS[groupIdx % BLOCK_COLORS.length];
      rows.push(
        <li
          key={`block-${group.block.id}`}
          className={[
            "flex items-center gap-3 border-b border-black/10 px-3 py-3",
            color,
          ].join(" ")}
        >
          <DeleteButton
            label={`Supprimer le groupe ${blockTimeLabel(group.block)}`}
            onClick={() => void deleteBlock(groupIdx)}
          />
          <span className="text-lg leading-none" aria-hidden>
            {group.block.icon_emoji ?? "📁"}
          </span>
          <p className="min-w-0 flex-1 truncate text-base font-medium text-white">
            {blockTimeLabel(group.block)}
          </p>
          <DragHandle />
        </li>,
      );
    }

    for (let habitIdx = 0; habitIdx < group.habits.length; habitIdx++) {
      const habit = group.habits[habitIdx];
      rows.push(
        <li
          key={habit.id}
          draggable
          onDragStart={() => setDrag({ kind: "habit", groupIdx, habitIdx })}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (!drag || drag.kind !== "habit") return;
            moveHabit(drag.groupIdx, drag.habitIdx, groupIdx, habitIdx);
            setDrag(null);
          }}
          onDragEnd={() => setDrag(null)}
          className="flex cursor-grab items-center gap-3 border-b border-neutral-700/50 px-3 py-3 last:border-b-0 active:cursor-grabbing"
        >
          <DeleteButton
            label={`Supprimer ${habit.name}`}
            onClick={() => void deleteHabit(groupIdx, habitIdx)}
          />
          <span className="text-lg leading-none" aria-hidden>
            {habit.icon_emoji ?? "•"}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={[
                "truncate text-base font-medium",
                HABIT_NAME_CLASS[habit.habit_type],
              ].join(" ")}
            >
              {habit.name}
            </p>
            <p className="text-xs text-neutral-500">Chaque jour</p>
          </div>
          <DragHandle />
        </li>,
      );
    }

    return rows;
  });

  return createPortal(
    <div className="glass-sheet-dark fixed inset-0 z-[200] flex flex-col">
      <header className="grid shrink-0 grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="glass-dark flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 active:scale-95"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" strokeWidth={2.2} />
        </button>

        <h2 className="truncate text-center text-lg font-semibold text-white">
          Trier les habitudes
        </h2>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={saving || !canSave}
            onClick={() => void save()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-transform active:scale-95 disabled:opacity-40"
            aria-label="Enregistrer"
          >
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() =>
              setViewMode((m) => (m === "groups" ? "habits" : "groups"))
            }
            className={[
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "groups"
                ? "border-sky-400/60 bg-neutral-800 text-sky-400"
                : "border-neutral-600 bg-neutral-800/80 text-sky-400/80",
            ].join(" ")}
          >
            Groupes
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {loading ? (
          <p className="py-12 text-center text-sm text-neutral-400">
            Chargement…
          </p>
        ) : viewMode === "groups" ? (
          blockGroups.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-400">
              Aucun groupe à organiser.
            </p>
          ) : (
            <ul className="glass-dark-subtle overflow-hidden rounded-3xl">
              {blockGroups.map((group) => {
                const groupIdx = groups.indexOf(group);
                const block = group.block!;
                const color = BLOCK_COLORS[groupIdx % BLOCK_COLORS.length];

                return (
                  <li
                    key={block.id}
                    draggable
                    onDragStart={() =>
                      setDrag({ kind: "group", groupIdx })
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!drag || drag.kind !== "group") return;
                      moveGroup(drag.groupIdx, groupIdx);
                      setDrag(null);
                    }}
                    onDragEnd={() => setDrag(null)}
                    className={[
                      "flex cursor-grab items-center gap-3 border-b border-black/10 px-3 py-3 last:border-b-0 active:cursor-grabbing",
                      color,
                    ].join(" ")}
                  >
                    <DeleteButton
                      label={`Supprimer le groupe ${blockTimeLabel(block)}`}
                      onClick={() => void deleteBlock(groupIdx)}
                    />
                    <span className="text-lg leading-none" aria-hidden>
                      {block.icon_emoji ?? "📁"}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-base font-medium text-white">
                      {blockTimeLabel(block)}
                    </p>
                    <DragHandle />
                  </li>
                );
              })}
            </ul>
          )
        ) : totalHabits === 0 && blockGroups.length === 0 ? (
          <div className="glass-dark-subtle rounded-3xl px-4 py-12 text-center text-sm text-neutral-400">
            Aucune habitude à organiser.
            <p className="mt-2 text-xs text-neutral-500">
              Crée une habitude avec le bouton + pour commencer.
            </p>
          </div>
        ) : habitRows.length === 0 ? (
          <div className="glass-dark-subtle rounded-3xl px-4 py-12 text-center text-sm text-neutral-400">
            Aucune habitude dans ces groupes.
          </div>
        ) : (
          <ul className="glass-dark-subtle overflow-hidden rounded-3xl">
            {habitRows}
          </ul>
        )}

        {err ? (
          <p className="mt-4 text-center text-sm text-rose-400">{err}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
