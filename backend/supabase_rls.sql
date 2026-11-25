-- Enable Row-Level Security (RLS) across all SevaCoop tables in Supabase.
-- Run this once in the Supabase SQL Editor after restoring your project.
-- Note: FastAPI connects with the PostgreSQL owner role, which bypasses RLS,
-- while Supabase's public PostgREST (anon / authenticated) API is locked down.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revoked_tokens ENABLE ROW LEVEL SECURITY;

-- Optional read-only public policy ONLY for safe public service catalog
DROP POLICY IF EXISTS "Public can read services" ON public.services;
CREATE POLICY "Public can read services" ON public.services
  FOR SELECT
  TO anon, authenticated
  USING (true);
