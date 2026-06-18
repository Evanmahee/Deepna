export type OnboardingGoalId =
  | "fitness"
  | "productivity"
  | "sleep"
  | "stress"
  | "learning"
  | "other";

export type OnboardingHabitSuggestion = {
  id: string;
  name: string;
  emoji: string;
};

export const ONBOARDING_GOALS: {
  id: OnboardingGoalId;
  label: string;
  emoji: string;
}[] = [
  { id: "fitness", label: "Se mettre en forme", emoji: "💪" },
  { id: "productivity", label: "Être plus productif", emoji: "⚡" },
  { id: "sleep", label: "Mieux dormir", emoji: "😴" },
  { id: "stress", label: "Réduire le stress", emoji: "🧘" },
  { id: "learning", label: "Apprendre", emoji: "📚" },
  { id: "other", label: "Autre", emoji: "✨" },
];

export const HABITS_BY_GOAL: Record<
  OnboardingGoalId,
  OnboardingHabitSuggestion[]
> = {
  fitness: [
    { id: "sport", name: "Sport", emoji: "🏋️" },
    { id: "eau", name: "Boire de l'eau", emoji: "💧" },
    { id: "marche", name: "Marche", emoji: "🚶" },
    { id: "etirements", name: "Étirements", emoji: "🤸" },
    { id: "repas", name: "Repas équilibré", emoji: "🥗" },
    { id: "pas", name: "10 000 pas", emoji: "👟" },
  ],
  productivity: [
    { id: "plan", name: "Planifier la journée", emoji: "📋" },
    { id: "deep", name: "Deep work 1h", emoji: "🎯" },
    { id: "inbox", name: "Inbox zero", emoji: "📬" },
    { id: "priorites", name: "3 priorités", emoji: "✅" },
    { id: "notifs", name: "Couper les notifs", emoji: "🔕" },
    { id: "review", name: "Revue du soir", emoji: "📝" },
  ],
  sleep: [
    { id: "heure", name: "Heure de coucher", emoji: "🌙" },
    { id: "ecrans", name: "Sans écran 1h avant", emoji: "📵" },
    { id: "cafe", name: "Pas de café après 14h", emoji: "☕" },
    { id: "routine", name: "Routine du soir", emoji: "🛁" },
    { id: "lecture", name: "Lecture avant dormir", emoji: "📖" },
    { id: "reveil", name: "Réveil régulier", emoji: "⏰" },
  ],
  stress: [
    { id: "meditation", name: "Méditation", emoji: "🧘" },
    { id: "respiration", name: "Respiration", emoji: "🌬️" },
    { id: "gratitude", name: "Gratitude", emoji: "🙏" },
    { id: "nature", name: "Air frais", emoji: "🌿" },
    { id: "journal", name: "Journal", emoji: "📓" },
    { id: "pause", name: "Pause sans écran", emoji: "☕" },
  ],
  learning: [
    { id: "lecture", name: "Lecture", emoji: "📚" },
    { id: "langue", name: "Langue étrangère", emoji: "🗣️" },
    { id: "cours", name: "Cours en ligne", emoji: "💻" },
    { id: "notes", name: "Prise de notes", emoji: "✍️" },
    { id: "podcast", name: "Podcast", emoji: "🎧" },
    { id: "pratique", name: "Pratique 30 min", emoji: "🔁" },
  ],
  other: [
    { id: "eau", name: "Boire de l'eau", emoji: "💧" },
    { id: "sport", name: "Sport", emoji: "🏋️" },
    { id: "meditation", name: "Méditation", emoji: "🧘" },
    { id: "lecture", name: "Lecture", emoji: "📚" },
    { id: "gratitude", name: "Gratitude", emoji: "🙏" },
    { id: "marche", name: "Marche", emoji: "🚶" },
  ],
};

export function suggestionsForGoal(
  goal: OnboardingGoalId,
): OnboardingHabitSuggestion[] {
  return HABITS_BY_GOAL[goal] ?? HABITS_BY_GOAL.other;
}
