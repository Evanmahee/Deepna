"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Archive,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Eraser,
  FastForward,
  Flag,
  LineChart,
  MoreHorizontal,
  NotebookPen,
  Repeat,
  SquarePen,
  StickyNote,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { HabitRowData } from "@/types/today";

type HabitActionSheetProps = {
  habit: HabitRowData | null;
  logDate: string;
  completed: boolean;
  onClose: () => void;
  onComplete: () => Promise<void>;
  onFail: () => Promise<void>;
  onSkip: () => Promise<void>;
  onEdit: () => void;
  onAddNote: () => void;
  onInspect: () => void;
  onDuplicate: () => Promise<void>;
  onResetHistory: () => Promise<void>;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
};

type GridAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  onClick: () => void | Promise<void>;
};

function ActionGridItem({
  label,
  icon: Icon,
  danger,
  onClick,
}: Omit<GridAction, "id">) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className="flex flex-col items-center gap-2 px-1 py-2 text-center transition active:opacity-70"
    >
      <Icon
        className={`h-6 w-6 ${danger ? "text-red-400" : "text-amber-400"}`}
        strokeWidth={1.75}
      />
      <span
        className={`text-[11px] leading-tight ${
          danger ? "text-red-400" : "text-neutral-300"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function ListRow({
  label,
  icon: Icon,
  onClick,
  chevron = false,
}: {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  chevron?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-1 py-3 text-left transition active:opacity-70"
    >
      <Icon className="h-5 w-5 shrink-0 text-amber-400" strokeWidth={1.75} />
      <span className="flex-1 text-sm text-white">{label}</span>
      {chevron ? (
        <ChevronRight className="h-4 w-4 text-neutral-500" strokeWidth={2} />
      ) : null}
    </button>
  );
}

export function HabitActionSheet({
  habit,
  logDate,
  completed,
  onClose,
  onComplete,
  onFail,
  onSkip,
  onEdit,
  onAddNote,
  onInspect,
  onDuplicate,
  onResetHistory,
  onArchive,
  onDelete,
}: HabitActionSheetProps) {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!habit) {
    return null;
  }

  async function run(action: () => void | Promise<void>) {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  const todayActions: GridAction[] = [
    {
      id: "skip",
      label: "Sauter",
      icon: FastForward,
      onClick: () => run(async () => {
        await onSkip();
        onClose();
      }),
    },
    {
      id: "fail",
      label: "Échouer",
      icon: X,
      onClick: () => run(async () => {
        await onFail();
        onClose();
      }),
    },
    {
      id: "complete",
      label: "Terminer",
      icon: Check,
      onClick: () => run(async () => {
        if (!completed) {
          await onComplete();
        }
        onClose();
      }),
    },
    {
      id: "duplicate",
      label: "Dupliquer",
      icon: Copy,
      onClick: () => run(async () => {
        await onDuplicate();
        onClose();
      }),
    },
    {
      id: "note",
      label: "Ajouter une note",
      icon: NotebookPen,
      onClick: () => {
        onClose();
        onAddNote();
      },
    },
    {
      id: "reset",
      label: "Réinitialiser l'historique",
      icon: Eraser,
      onClick: () => run(async () => {
        await onResetHistory();
        onClose();
      }),
    },
    {
      id: "edit",
      label: "Modifier",
      icon: SquarePen,
      onClick: () => {
        onClose();
        onEdit();
      },
    },
    {
      id: "archive",
      label: "Archiver",
      icon: Archive,
      onClick: () => run(async () => {
        await onArchive();
        onClose();
      }),
    },
    {
      id: "delete",
      label: "Supprimer",
      icon: Trash2,
      danger: true,
      onClick: () => run(async () => {
        await onDelete();
        onClose();
      }),
    },
  ];

  return (
    <div className="fixed inset-0 z-[260] flex flex-col justify-end">
      <button
        type="button"
        className="flex-1 bg-black/60"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="glass-sheet-dark relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[32px] px-4 pb-8 pt-5">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20" />

        <div className="mb-3 flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {habit.icon_emoji || "•"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">
              {habit.name}
            </p>
            <p className="text-xs text-neutral-500">{logDate}</p>
          </div>
        </div>

        <p className="mb-2 text-sm font-medium text-neutral-400">Aujourd&apos;hui</p>
        <div className="grid grid-cols-3 gap-1 border-b border-white/10 pb-4">
          {todayActions.map((action) => (
            <ActionGridItem key={action.id} {...action} />
          ))}
        </div>

        <ListRow
          label="Statistiques"
          icon={LineChart}
          onClick={() => {
            onClose();
            router.push("/stats");
          }}
        />

        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className="flex w-full items-center gap-3 border-b border-white/10 px-1 py-3 text-left"
        >
          <MoreHorizontal className="h-5 w-5 shrink-0 text-amber-400" strokeWidth={1.75} />
          <span className="flex-1 text-sm text-white">Plus</span>
          <ChevronDown
            className={`h-4 w-4 text-neutral-500 transition ${moreOpen ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>

        {moreOpen ? (
          <div className="border-b border-white/10 pb-2 pl-2">
            <ListRow
              label="Historique"
              icon={BookOpen}
              onClick={() => {
                onClose();
                router.push("/stats");
              }}
            />
            <ListRow
              label="Plan d'objectifs"
              icon={Flag}
              onClick={() => {
                onClose();
                router.push("/profile#goals");
              }}
            />
            <ListRow
              label="Plan de Répétition"
              icon={Repeat}
              onClick={() => {
                onClose();
                onEdit();
              }}
            />
            <ListRow
              label="Notes"
              icon={StickyNote}
              onClick={() => {
                onClose();
                onInspect();
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
