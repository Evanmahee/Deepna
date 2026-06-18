export type IdentityPeriod = "morning" | "afternoon" | "evening";

export type IdentityCheckinRow = {
  id: string;
  user_id: string;
  logged_on: string;
  period: IdentityPeriod;
  prompt: string | null;
  reflection: string | null;
  checked_at: string | null;
};
