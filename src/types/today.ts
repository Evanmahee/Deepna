export type TimeBlockRow = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  day_of_week: number | null;
  starts_at: string;
  ends_at: string;
  block_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  icon_emoji: string | null;
};

export type HabitRowData = {
  id: string;
  user_id: string;
  time_block_id: string | null;
  name: string;
  icon_emoji: string | null;
  habit_type: "good" | "bad" | "neutral";
  description: string | null;
  icon_color: string | null;
  missed_days_count: number;
  archived: boolean;
  sort_order: number;
};

export type HabitLogRow = {
  id: string;
  habit_id: string;
  user_id: string;
  logged_on: string;
  completed: boolean;
  completed_at: string | null;
};
