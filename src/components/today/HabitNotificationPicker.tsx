"use client";

import { Bell } from "lucide-react";
import { formatNotifyTime } from "@/lib/habit-emojis";
import { FormIconBox, FormSection, IosSwitch, SheetHeader } from "@/components/today/HabitFormUi";
import { glassInputDarkClass } from "@/lib/glass";

type Props = {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  time: string;
  onTimeChange: (v: string) => void;
  onBack: () => void;
};

export function HabitNotificationPicker({
  enabled,
  onEnabledChange,
  time,
  onTimeChange,
  onBack,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SheetHeader title="Notifications" onLeft={onBack} leftLabel="Retour" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <FormSection title="Rappel push">
          <div className="flex items-center justify-between gap-3 px-3 py-3">
            <div className="flex items-center gap-3">
              <FormIconBox>
                <Bell className="h-4 w-4" strokeWidth={2} />
              </FormIconBox>
              <div>
                <p className="text-base text-white">Activer le rappel</p>
                <p className="text-xs text-neutral-500">Notification quotidienne</p>
              </div>
            </div>
            <IosSwitch
              checked={enabled}
              onChange={onEnabledChange}
              ariaLabel={enabled ? "Désactiver le rappel" : "Activer le rappel"}
            />
          </div>
          {enabled ? (
            <div className="border-t border-white/[0.06] px-3 py-3">
              <label className="mb-2 block text-xs text-neutral-500">
                Heure · {formatNotifyTime(time)}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                className={glassInputDarkClass}
              />
              <p className="mt-2 text-[11px] text-neutral-600">
                Tu recevras un rappel push à cette heure, tous les jours.
              </p>
            </div>
          ) : null}
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
