export type EmojiSection = {
  title: string;
  emojis: string[];
};

export const HABIT_EMOJI_SECTIONS: EmojiSection[] = [
  {
    title: "Suggestions",
    emojis: [
      "⭐", "✨", "🔥", "💪", "🎯", "✅", "📌", "💡", "🌟", "🏆",
      "🌙", "☀️", "💧", "🥗", "🏃", "📚", "🧘", "🚶", "💊", "🤸",
    ],
  },
  {
    title: "Sport",
    emojis: [
      "🏃", "🚴", "🏊", "🥾", "⛷️", "🧘", "💃", "🤸", "🎾", "💪",
      "🏋️", "⚽", "🏀", "🎳", "🥊", "🧗", "🏄", "⛹️", "🤾", "🏌️",
    ],
  },
  {
    title: "Santé",
    emojis: [
      "💊", "🩺", "🧴", "🪥", "🚿", "😴", "🧠", "❤️", "🥦", "🍎",
      "🫁", "🧘‍♀️", "🛏️", "🧃", "🥤", "🍵", "🫧", "🧼", "👣", "🩹",
    ],
  },
  {
    title: "Travail",
    emojis: [
      "💼", "📅", "📝", "📧", "💻", "📞", "🗂️", "📊", "🖊️", "⏰",
      "🎓", "📖", "🧑‍💻", "📱", "🔔", "📋", "🗓️", "✏️", "🖥️", "📎",
    ],
  },
  {
    title: "Maison",
    emojis: [
      "🏠", "🧹", "🧺", "🍳", "🛒", "🌱", "🐕", "🐈", "🛋️", "🪴",
      "🔑", "🧽", "🗑️", "🪣", "🧯", "🔧", "💡", "🕯️", "🛁", "🪞",
    ],
  },
  {
    title: "Loisirs",
    emojis: [
      "🎮", "🎬", "🎵", "🎨", "📷", "🎸", "🎹", "🎤", "🧩", "♟️",
      "🎲", "🎭", "📺", "🎧", "🎻", "🎺", "🎻", "🪗", "🎯", "🎳",
    ],
  },
];

export const MAX_EMOJI_CHARS = 3;

export function filterEmojiSections(query: string): EmojiSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return HABIT_EMOJI_SECTIONS;

  return HABIT_EMOJI_SECTIONS.map((section) => ({
    ...section,
    emojis: section.emojis.filter((e) => e.includes(q) || section.title.toLowerCase().includes(q)),
  })).filter((s) => s.emojis.length > 0);
}

export function formatNotifyTime(time: string): string {
  const [h, m] = time.split(":");
  return `${h}h${m}`;
}
