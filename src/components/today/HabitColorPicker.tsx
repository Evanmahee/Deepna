"use client";

import { useEffect, useState } from "react";
import {
  HABIT_COLORS,
  habitColorLabel,
  normalizeHabitColor,
} from "@/lib/habit-colors";
import { HabitCardPreview } from "@/components/today/HabitCardPreview";
import { FormSection, SheetHeader } from "@/components/today/HabitFormUi";

type Props = {
  color: string;
  emoji: string;
  name?: string;
  onSelect: (hex: string) => void;
  onBack: () => void;
};

export function HabitColorPicker({
  color,
  emoji,
  name,
  onSelect,
  onBack,
}: Props) {
  const [draft, setDraft] = useState(() => normalizeHabitColor(color));
  const previewEmoji = emoji || "⭐";
  const previewName = name?.trim() || "Nom de l'habitude";

  useEffect(() => {
    setDraft(normalizeHabitColor(color));
  }, [color]);

  function confirm() {
    onSelect(draft);
    onBack();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SheetHeader title="Couleur" onLeft={onBack} leftLabel="Retour" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <div className="mb-6">
          <HabitCardPreview emoji={previewEmoji} name={previewName} color={draft} />
          <p className="mt-3 text-center text-sm text-neutral-500">
            Aperçu de la carte · {habitColorLabel(draft)}
          </p>
        </div>

        <FormSection title="Palette">
          <div className="grid grid-cols-6 gap-3 px-3 py-4">
            {HABIT_COLORS.map((c) => {
              const selected = c.hex.toUpperCase() === draft.toUpperCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.label}
                  aria-pressed={selected}
                  onClick={() => setDraft(c.hex)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className={`h-11 w-11 rounded-full border transition-transform active:scale-95 ${
                      selected
                        ? "border-white ring-2 ring-white ring-offset-2 ring-offset-black"
                        : "border-white/20"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              );
            })}
          </div>
        </FormSection>

        <button
          type="button"
          onClick={confirm}
          className="mt-6 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 active:scale-[0.99]"
        >
          Terminé
        </button>
      </div>
    </div>
  );
}
