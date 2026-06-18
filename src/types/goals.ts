export type GoalTerm = "short" | "mid" | "long";

export type GoalStatus = "active" | "completed" | "abandoned";

export type GoalRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  term: GoalTerm | null;
};
