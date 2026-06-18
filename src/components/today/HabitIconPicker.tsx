"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  filterEmojiSections,
  HABIT_EMOJI_SECTIONS,
  MAX_EMOJI_CHARS,
} from "@/lib/habit-emojis";
import { HabitCardPreview } from "@/components/today/HabitCardPreview";
import { SheetHeader } from "@/components/today/HabitFormUi";

type Props = {
  emoji: string;
  color?: string;
  name?: string;
  onSelect: (emoji: string) => void;
  onBack: () => void;
};

export function HabitIconPicker({ emoji, color, name, onSelect, onBack }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"emoji" | "text">("emoji");
  const [textValue, setTextValue] = useState(emoji.length <= 3 ? emoji : "");

  const sections = useMemo(
    () => (query.trim() ? filterEmojiSections(query) : HABIT_EMOJI_SECTIONS),
    [query],
  );

  function pick(e: string) {
    onSelect(e);
    onBack();
  }

  function applyText() {
    const v = textValue.trim().slice(0, MAX_EMOJI_CHARS);
    if (v) {
      onSelect(v);
      onBack();
    }
  }

  const preview = tab === "text" ? textValue || "⭐" : emoji || "⭐";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <SheetHeader title="Icône" onLeft={onBack} leftLabel="Retour" />

      <div className="shrink-0 px-4 pb-4">
        <div className="glass-dark-subtle flex rounded-full p-1">
          {(
            [
              ["emoji", "Emojis"],
              ["text", "Texte"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                tab === id ? "bg-white/15 text-white" : "text-neutral-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24">
        <div className="mb-6">
          <HabitCardPreview
            emoji={preview}
            name={name?.trim() || "Nom de l'habitude"}
            color={color ?? ""}
          />
          {tab === "text" ? (
            <>
              <input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value.slice(0, MAX_EMOJI_CHARS))}
                className="mt-4 w-full max-w-[12rem] border-b border-white/20 bg-transparent py-2 text-center text-2xl text-white focus:border-white/40 focus:outline-none"
                placeholder="ABC"
                maxLength={MAX_EMOJI_CHARS}
                autoFocus
              />
              <p className="mt-2 text-xs text-neutral-500">
                Jusqu&apos;à {MAX_EMOJI_CHARS} caractères ou emoji · {textValue.length}/{MAX_EMOJI_CHARS}
              </p>
              <button
                type="button"
                disabled={!textValue.trim()}
                onClick={applyText}
                className="mt-4 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black disabled:opacity-40"
              >
                Valider
              </button>
            </>
          ) : null}
        </div>

        {tab === "emoji"
          ? sections.map((section) => (
              <section key={section.title} className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-neutral-500">
                  {section.title}
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {section.emojis.map((e, i) => (
                    <button
                      key={`${section.title}-${e}-${i}`}
                      type="button"
                      onClick={() => pick(e)}
                      className={`flex aspect-square items-center justify-center rounded-2xl text-2xl transition-colors hover:bg-white/10 ${
                        emoji === e ? "bg-white/15 ring-1 ring-white/30" : "bg-white/[0.04]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </section>
            ))
          : null}
      </div>

      {tab === "emoji" ? (
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 pt-2">
          <label className="glass-dark flex h-11 items-center gap-2 rounded-full px-4">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Recherche"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
