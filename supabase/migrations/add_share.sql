-- Partage public des habitudes (profil)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_token text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_public boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_profiles_share_token ON public.profiles(share_token);
