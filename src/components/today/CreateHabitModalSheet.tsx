"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, FolderOpen, Palette, Smile } from "lucide-react";
import type { TimeBlockRow } from "@/types/today";
import { NEW_TIME_BLOCK } from "@/components/today/habit-form-constants";
import { ensurePushSubscription } from "@/lib/push-client";
import { formatNotifyTime } from "@/lib/habit-emojis";
import {
  DEFAULT_HABIT_COLOR,
  habitColorLabel,
  normalizeHabitColor,
} from "@/lib/habit-colors";
import {
  FormNameCard,
  FormRow,
  FormSection,
  SheetHeader,
} from "@/components/today/HabitFormUi";
import { HabitIconPicker } from "@/components/today/HabitIconPicker";
import { HabitColorPicker } from "@/components/today/HabitColorPicker";
import { HabitGroupPicker } from "@/components/today/HabitGroupPicker";
import { HabitNotificationPicker } from "@/components/today/HabitNotificationPicker";
import { HabitDescriptionPicker } from "@/components/today/HabitDescriptionPicker";
import { useToast } from "@/components/ui/ToastProvider";

export { NEW_TIME_BLOCK };

type Panel = "main" | "icon" | "color" | "group" | "notifications" | "description";

type SheetProps = {
  onClose: () => void;
  timeBlocks: TimeBlockRow[];
  variant?: "light" | "dark";
  embedded?: boolean;
  onBack?: () => void;
  initialName?: string;
  initialEmoji?: string;
  initialType?: "good" | "bad" | "neutral";
};

export function CreateHabitModalSheet({
  onClose,
  timeBlocks,
  variant = "light",
  embedded = false,
  onBack,
  initialName = "",
  initialEmoji = "⭐",
  initialType = "good",
}: SheetProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isDark = variant === "dark";

  const [panel, setPanel] = useState<Panel>("main");
  const [title, setTitle] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [iconColor, setIconColor] = useState(DEFAULT_HABIT_COLOR);
  const [description, setDescription] = useState("");
  const [blockId, setBlockId] = useState("");
  const [newLabel, setNewLabel] = useState("Nouveau groupe");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyTime, setNotifyTime] = useState("09:00");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const groupLabel = useMemo(() => {
    if (!blockId) return "Aucun";
    if (blockId === NEW_TIME_BLOCK) {
      return newLabel.trim() || "Nouveau groupe";
    }
    const block = timeBlocks.find((b) => b.id === blockId);
    return block?.title ?? "Groupe";
  }, [blockId, newLabel, timeBlocks]);

  const notifyLabel = notifyEnabled ? formatNotifyTime(notifyTime) : "Aucune";

  const colorLabel = habitColorLabel(normalizeHabitColor(iconColor));

  const descriptionLabel = description.trim()
    ? description.trim().slice(0, 28) + (description.trim().length > 28 ? "…" : "")
    : "Ajouter…";

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      let resolved: string | null = blockId || null;
      if (blockId === NEW_TIME_BLOCK) {
        const block_date = new Date().toISOString().slice(0, 10);
        const tb = await fetch("/api/time-blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newLabel.trim() || "Groupe",
            block_date,
            starts_at: newStart,
            ends_at: newEnd,
          }),
        });
        const tbJson = (await tb.json()) as { id?: string; error?: string };
        if (!tb.ok) {
          throw new Error(tbJson.error ?? "Groupe impossible");
        }
        resolved = tbJson.id ?? null;
      } else if (!resolved) {
        resolved = null;
      }

      if (notifyEnabled) {
        const pushOk = await ensurePushSubscription().catch(() => false);
        if (!pushOk) {
          throw new Error(
            "Autorise les notifications dans ton navigateur pour activer le rappel.",
          );
        }
      }

      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          icon_emoji: emoji.trim() || "⭐",
          icon_color: normalizeHabitColor(iconColor),
          habit_type: initialType,
          description: description.trim() || null,
          time_block_id: resolved,
          notification: notifyEnabled
            ? { enabled: true, scheduled_time: notifyTime }
            : undefined,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Création impossible");
      }
      showToast("Habitude créée");
      onClose();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function handleHeaderLeft() {
    if (panel !== "main") {
      setPanel("main");
      return;
    }
    if (embedded && onBack) {
      onBack();
      return;
    }
    onClose();
  }

  const headerLeftLabel =
    panel !== "main" ? "Retour" : embedded && onBack ? "Retour" : "Fermer";

  if (!isDark) {
    return (
      <div className="glass-sheet max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-4">
        <p className="text-sm text-neutral-500">
          Utilise le thème sombre pour l&apos;expérience complète.
        </p>
      </div>
    );
  }

  if (panel === "icon") {
    return (
      <HabitIconPicker
        emoji={emoji}
        color={iconColor}
        name={title}
        onSelect={setEmoji}
        onBack={() => setPanel("main")}
      />
    );
  }

  if (panel === "color") {
    return (
      <HabitColorPicker
        color={iconColor}
        emoji={emoji}
        name={title}
        onSelect={setIconColor}
        onBack={() => setPanel("main")}
      />
    );
  }

  if (panel === "group") {
    return (
      <HabitGroupPicker
        timeBlocks={timeBlocks}
        blockId={blockId}
        onBlockIdChange={setBlockId}
        newLabel={newLabel}
        setNewLabel={setNewLabel}
        newStart={newStart}
        setNewStart={setNewStart}
        newEnd={newEnd}
        setNewEnd={setNewEnd}
        onBack={() => setPanel("main")}
      />
    );
  }

  if (panel === "notifications") {
    return (
      <HabitNotificationPicker
        enabled={notifyEnabled}
        onEnabledChange={setNotifyEnabled}
        time={notifyTime}
        onTimeChange={setNotifyTime}
        onBack={() => setPanel("main")}
      />
    );
  }

  if (panel === "description") {
    return (
      <HabitDescriptionPicker
        description={description}
        onChange={setDescription}
        onBack={() => setPanel("main")}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SheetHeader
        title="Nouvelle habitude"
        onLeft={handleHeaderLeft}
        leftLabel={headerLeftLabel}
        onRight={() => void submit()}
        rightDisabled={!title.trim()}
        rightLoading={loading}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <FormNameCard value={title} onChange={setTitle} />

        <FormSection title="Apparence">
          <FormRow
            icon={<span className="text-lg leading-none">{emoji || "⭐"}</span>}
            label="Icône"
            value={emoji || "Choisir"}
            onClick={() => setPanel("icon")}
          />
          <FormRow
            icon={<Palette className="h-4 w-4" strokeWidth={2} />}
            label="Couleur de la carte"
            onClick={() => setPanel("color")}
          >
            <span className="flex items-center gap-2">
              <span
                className="h-5 w-5 shrink-0 rounded-full border border-white/20"
                style={{ backgroundColor: normalizeHabitColor(iconColor) }}
                aria-hidden
              />
              <span className="truncate text-sm text-neutral-400">{colorLabel}</span>
            </span>
          </FormRow>
        </FormSection>

        <FormSection title="Organisation">
          <FormRow
            icon={<FolderOpen className="h-4 w-4" strokeWidth={2} />}
            label="Groupe"
            value={groupLabel}
            valueMuted={!blockId}
            onClick={() => setPanel("group")}
          />
        </FormSection>

        <FormSection title="Général">
          <FormRow
            icon={<Bell className="h-4 w-4" strokeWidth={2} />}
            label="Notifications"
            value={notifyLabel}
            valueMuted={!notifyEnabled}
            onClick={() => setPanel("notifications")}
          />
          <FormRow
            icon={<Smile className="h-4 w-4" strokeWidth={2} />}
            label="Description"
            value={descriptionLabel}
            valueMuted={!description.trim()}
            onClick={() => setPanel("description")}
          />
        </FormSection>

        {err ? (
          <p className="mt-2 px-1 text-center text-sm text-rose-400">{err}</p>
        ) : null}
      </div>
    </div>
  );
}
