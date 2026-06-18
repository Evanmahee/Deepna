"use client";

import { Archive, SquarePen, Trash2 } from "lucide-react";
import type { HabitRowData } from "@/types/today";

type HabitContextMenuProps = {
  habit: HabitRowData | null;
  onClose: () => void;
  onEdit: () => void;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
};

export function HabitContextMenu({
  habit,
  onClose,
  onEdit,
  onArchive,
  onDelete,
}: HabitContextMenuProps) {
  if (!habit) return null;

  async function run(action: () => void | Promise<void>) {
    await action();
    onClose();
  }

  const items: {
    label: string;
    icon: typeof SquarePen;
    danger?: boolean;
    onClick: () => void;
  }[] = [
    {
      label: "Modifier",
      icon: SquarePen,
      onClick: () => {
        onClose();
        onEdit();
      },
    },
    {
      label: "Archiver",
      icon: Archive,
      onClick: () => void run(onArchive),
    },
    {
      label: "Supprimer",
      icon: Trash2,
      danger: true,
      onClick: () => void run(onDelete),
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
      <div className="glass-sheet-dark w-full rounded-t-[32px] px-4 pb-8 pt-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {habit.icon_emoji || "•"}
          </span>
          <p className="truncate text-base font-semibold text-white">
            {habit.name}
          </p>
        </div>
        <ul className="overflow-hidden rounded-2xl bg-white/5">
          {items.map(({ label, icon: Icon, danger, onClick }) => (
            <li key={label}>
              <button
                type="button"
                onClick={onClick}
                className="flex w-full items-center gap-3 border-b border-white/10 px-4 py-3.5 text-left last:border-b-0 hover:bg-white/5"
              >
                <Icon
                  className={`h-5 w-5 ${danger ? "text-red-400" : "text-white/70"}`}
                  strokeWidth={1.75}
                />
                <span
                  className={`text-sm font-medium ${danger ? "text-red-400" : "text-white"}`}
                >
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
