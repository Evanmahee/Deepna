"use client";

import { FileText } from "lucide-react";
import { FormIconBox, FormSection, SheetHeader } from "@/components/today/HabitFormUi";

const textareaClass =
  "glass-dark w-full min-h-[10rem] resize-y rounded-xl px-3 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none";

type Props = {
  description: string;
  onChange: (v: string) => void;
  onBack: () => void;
};

export function HabitDescriptionPicker({
  description,
  onChange,
  onBack,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SheetHeader title="Description" onLeft={onBack} leftLabel="Retour" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <FormSection>
          <div className="px-3 py-3">
            <div className="mb-3 flex items-center gap-3">
              <FormIconBox>
                <FileText className="h-4 w-4" strokeWidth={2} />
              </FormIconBox>
              <div>
                <p className="text-sm text-white">Pourquoi cette habitude ?</p>
                <p className="text-xs text-neutral-500">
                  Visible uniquement via « Inspecter »
                </p>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => onChange(e.target.value.slice(0, 500))}
              className={textareaClass}
              placeholder="Une anecdote, une raison de commencer ou d'arrêter…"
              rows={6}
              maxLength={500}
              autoFocus
            />
            <p className="mt-2 text-right text-[11px] tabular-nums text-neutral-600">
              {description.length}/500
            </p>
          </div>
        </FormSection>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black"
        >
          Terminé
        </button>
      </div>
    </div>
  );
}
