-- Ajoute la colonne mantra / identité sur profiles (Deepna)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS identity_statement text DEFAULT '';
