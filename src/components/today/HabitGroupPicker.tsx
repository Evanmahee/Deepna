"use client";

import { Plus } from "lucide-react";
import type { TimeBlockRow } from "@/types/today";
import { NEW_TIME_BLOCK } from "@/components/today/habit-form-constants";
import { CreateHabitNewSlotFields } from "@/components/today/CreateHabitNewSlotFields";
import { FormIconBox, FormRow, FormSection, SheetHeader } from "@/components/today/HabitFormUi";

type Props = {
  timeBlocks: TimeBlockRow[];
  blockId: string;
  onBlockIdChange: (id: string) => void;
  newLabel: string;
  setNewLabel: (v: string) => void;
  newStart: string;
  setNewStart: (v: string) => void;
  newEnd: string;
  setNewEnd: (v: string) => void;
  onBack: () => void;
};

export function HabitGroupPicker({
  timeBlocks,
  blockId,
  onBlockIdChange,
  newLabel,
  setNewLabel,
  newStart,
  setNewStart,
  newEnd,
  setNewEnd,
  onBack,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SheetHeader title="Groupe" onLeft={onBack} leftLabel="Retour" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <FormSection title="Assigner à">
          <button
            type="button"
            onClick={() => {
              onBlockIdChange("");
              onBack();
            }}
            className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.04] ${
              blockId === "" ? "bg-white/[0.06]" : ""
            }`}
          >
            <FormIconBox>
              <span className="text-sm text-neutral-400">—</span>
            </FormIconBox>
            <span className="flex-1 text-base text-white">Aucun groupe</span>
            {blockId === "" ? (
              <span className="text-sm text-white">✓</span>
            ) : null}
          </button>
          {timeBlocks.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                onBlockIdChange(b.id);
                onBack();
              }}
              className={`flex w-full items-center gap-3 border-t border-white/[0.06] px-3 py-3 text-left transition-colors hover:bg-white/[0.04] ${
                blockId === b.id ? "bg-white/[0.06]" : ""
              }`}
            >
              <FormIconBox>
                <span className="text-lg leading-none">{b.icon_emoji || "📁"}</span>
              </FormIconBox>
              <span className="min-w-0 flex-1 truncate text-base text-white">
                {b.title}
              </span>
              {blockId === b.id ? (
                <span className="text-sm text-white">✓</span>
              ) : null}
            </button>
          ))}
        </FormSection>

        <FormSection title="Nouveau">
          <FormRow
            icon={<Plus className="h-4 w-4" strokeWidth={2.5} />}
            label="Créer un groupe"
            showChevron={false}
            onClick={() => onBlockIdChange(NEW_TIME_BLOCK)}
          />
        </FormSection>

        {blockId === NEW_TIME_BLOCK ? (
          <div className="mt-4">
            <CreateHabitNewSlotFields
              newLabel={newLabel}
              setNewLabel={setNewLabel}
              newStart={newStart}
              setNewStart={setNewStart}
              newEnd={newEnd}
              setNewEnd={setNewEnd}
              variant="dark"
            />
            <button
              type="button"
              onClick={onBack}
              className="mt-4 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black"
            >
              Valider le groupe
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
