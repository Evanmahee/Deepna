"use client";

import { Bell } from "lucide-react";
import { formatNotifyTime } from "@/lib/habit-emojis";
import {
  NOTIFICATION_DAYS,
  type NotificationDayId,
} from "@/lib/notification-days";
import {
  FormIconBox,
  FormSection,
  IosSwitch,
  SheetHeader,
} from "@/components/today/HabitFormUi";
import { glassInputDarkClass } from "@/lib/glass";

type Props = {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  time: string;
  onTimeChange: (v: string) => void;
  days: NotificationDayId[];
  onDaysChange: (days: NotificationDayId[]) => void;
  message: string;
  onMessageChange: (v: string) => void;
  habitName?: string;
  onBack: () => void;
};

export function HabitNotificationPicker({
  enabled,
  onEnabledChange,
  time,
  onTimeChange,
  days,
  onDaysChange,
  message,
  onMessageChange,
  habitName,
  onBack,
}: Props) {
  function toggleDay(id: NotificationDayId) {
    if (days.includes(id)) {
      onDaysChange(days.filter((d) => d !== id));
    } else {
      onDaysChange([...days, id]);
    }
  }

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
                <p className="text-xs text-neutral-500">Pour cette habitude</p>
              </div>
            </div>
            <IosSwitch
              checked={enabled}
              onChange={onEnabledChange}
              ariaLabel={enabled ? "Désactiver le rappel" : "Activer le rappel"}
            />
          </div>
          {enabled ? (
            <>
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
              </div>
              <div className="border-t border-white/[0.06] px-3 py-3">
                <p className="mb-2 text-xs text-neutral-500">Jours actifs</p>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_DAYS.map((d) => {
                    const active = days.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDay(d.id)}
                        className={[
                          "h-9 w-9 rounded-full text-xs font-medium",
                          active
                            ? "bg-indigo-500 text-white"
                            : "bg-white/10 text-neutral-400",
                        ].join(" ")}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-white/[0.06] px-3 py-3">
                <label className="mb-2 block text-xs text-neutral-500">
                  Message personnalisé
                </label>
                <input
                  type="text"
                  value={message}
                  placeholder={habitName ? `Rappel : ${habitName}` : "Message"}
                  onChange={(e) => onMessageChange(e.target.value)}
                  className={glassInputDarkClass}
                />
              </div>
            </>
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
