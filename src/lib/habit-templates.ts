export type TemplateCategory = "bonnes" | "sante" | "mauvaises" | "afaire";

export type HabitTemplate = {
  id: string;
  name: string;
  emoji: string;
  category: TemplateCategory;
  section: string;
  habit_type: "good" | "bad" | "neutral";
};

export const TEMPLATE_TABS: { id: TemplateCategory; label: string }[] = [
  { id: "bonnes", label: "Quotidien" },
  { id: "sante", label: "Santé" },
  { id: "mauvaises", label: "Mauvaises" },
  { id: "afaire", label: "À faire" },
];

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // Bonnes — Les plus populaires
  { id: "b1", name: "Se coucher tôt", emoji: "🌙", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b2", name: "Boire de l'eau", emoji: "💧", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b3", name: "Manger sain", emoji: "🥗", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b4", name: "Faire du sport", emoji: "🏃", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b5", name: "Lire", emoji: "📚", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b6", name: "Méditer", emoji: "🧘", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b7", name: "Marcher", emoji: "🚶", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b8", name: "Prendre des vitamines", emoji: "💊", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b9", name: "S'étirer", emoji: "🤸", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b10", name: "Se lever tôt", emoji: "☀️", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b11", name: "Se brosser les dents", emoji: "🪥", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b12", name: "Prendre une douche", emoji: "🚿", category: "bonnes", section: "Les plus populaires", habit_type: "good" },
  { id: "b13", name: "Planifier demain", emoji: "📅", category: "bonnes", section: "Les plus populaires", habit_type: "good" },

  // Santé — Activité
  { id: "s1", name: "Nombre de pas", emoji: "👣", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s2", name: "Courir", emoji: "🏃", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s3", name: "Vélo", emoji: "🚴", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s4", name: "Marche", emoji: "🚶", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s5", name: "Natation", emoji: "🏊", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s6", name: "Randonnée", emoji: "🥾", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s7", name: "Ski", emoji: "⛷️", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s8", name: "Yoga", emoji: "🧘", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s9", name: "Danse", emoji: "💃", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s10", name: "Pilates", emoji: "🤸", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s11", name: "Tennis", emoji: "🎾", category: "sante", section: "Activité", habit_type: "good" },
  { id: "s12", name: "Renforcement traditionnel", emoji: "💪", category: "sante", section: "Activité", habit_type: "good" },

  // Mauvaises — Corps
  { id: "m1", name: "Ne pas grignoter", emoji: "🍪", category: "mauvaises", section: "Corps", habit_type: "bad" },
  { id: "m2", name: "Manger de la malbouffe", emoji: "🍔", category: "mauvaises", section: "Corps", habit_type: "bad" },
  { id: "m3", name: "Ne pas fumer", emoji: "🚬", category: "mauvaises", section: "Corps", habit_type: "bad" },
  { id: "m4", name: "Ne pas boire d'alcool", emoji: "🍺", category: "mauvaises", section: "Corps", habit_type: "bad" },
  { id: "m5", name: "Passer moins de temps assis", emoji: "🪑", category: "mauvaises", section: "Corps", habit_type: "bad" },
  { id: "m6", name: "Ne pas manger de sucreries", emoji: "🍬", category: "mauvaises", section: "Corps", habit_type: "bad" },

  // Mauvaises — Bien-être mental
  { id: "m7", name: "Procrastiner", emoji: "⏰", category: "mauvaises", section: "Bien-être mental", habit_type: "bad" },
  { id: "m8", name: "Me coucher tard", emoji: "🌙", category: "mauvaises", section: "Bien-être mental", habit_type: "bad" },
  { id: "m9", name: "Ne jure pas", emoji: "🤬", category: "mauvaises", section: "Bien-être mental", habit_type: "bad" },
  { id: "m10", name: "Passer du temps avec des gens toxiques", emoji: "☠️", category: "mauvaises", section: "Bien-être mental", habit_type: "bad" },

  // Mauvaises — Productivité
  { id: "m11", name: "Passer trop de temps sur les réseaux sociaux", emoji: "📱", category: "mauvaises", section: "Productivité", habit_type: "bad" },
  { id: "m12", name: "Répondre aux messages tard le soir", emoji: "💬", category: "mauvaises", section: "Productivité", habit_type: "bad" },

  // À faire — Les plus populaires
  { id: "t1", name: "Déclarer ses impôts", emoji: "💰", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t2", name: "Renouveler le passeport", emoji: "🪪", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t3", name: "Planifier des vacances", emoji: "🏝️", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t4", name: "Imprimer des documents", emoji: "🖨️", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t5", name: "Acheter un cadeau", emoji: "🎁", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t6", name: "S'inscrire à une salle de sport", emoji: "🏋️", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t7", name: "Planifier une réunion", emoji: "📅", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t8", name: "Établir un budget", emoji: "🧮", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t9", name: "Mettre à jour le CV", emoji: "📄", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
  { id: "t10", name: "Planifier demain", emoji: "📋", category: "afaire", section: "Les plus populaires", habit_type: "neutral" },
];

export function templatesForCategory(category: TemplateCategory): HabitTemplate[] {
  return HABIT_TEMPLATES.filter((t) => t.category === category);
}

export function groupTemplatesBySection(
  templates: HabitTemplate[],
): { section: string; items: HabitTemplate[] }[] {
  const map = new Map<string, HabitTemplate[]>();
  for (const t of templates) {
    const arr = map.get(t.section) ?? [];
    arr.push(t);
    map.set(t.section, arr);
  }
  return Array.from(map.entries()).map(([section, items]) => ({ section, items }));
}
