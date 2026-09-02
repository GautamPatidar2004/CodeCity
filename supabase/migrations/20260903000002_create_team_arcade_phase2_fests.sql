-- Migration: Create Team Arcade Phase 2 - Fest Foundation & Discovery
-- Description: Fests data structure, lifecycle constraints, indexes, RLS, status sync function, and starter seeds

-- 1. Create arcade_fests table
CREATE TABLE IF NOT EXISTS public.arcade_fests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  banner_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_fests_title_length CHECK (char_length(trim(title)) >= 3 AND char_length(trim(title)) <= 100),
  CONSTRAINT arcade_fests_time_window CHECK (end_time > start_time)
);

-- 2. Indexes for efficient filtering and ordering
CREATE INDEX IF NOT EXISTS idx_arcade_fests_status ON public.arcade_fests (status);
CREATE INDEX IF NOT EXISTS idx_arcade_fests_start_time ON public.arcade_fests (start_time ASC);
CREATE INDEX IF NOT EXISTS idx_arcade_fests_end_time ON public.arcade_fests (end_time ASC);

-- 3. Enable Row Level Security
ALTER TABLE public.arcade_fests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Authenticated students can read fests
DROP POLICY IF EXISTS "Allow authenticated read arcade_fests" ON public.arcade_fests;
CREATE POLICY "Allow authenticated read arcade_fests"
ON public.arcade_fests
FOR SELECT
TO authenticated
USING (true);

-- Only administrators can insert/update/delete fests
DROP POLICY IF EXISTS "Allow admin insert arcade_fests" ON public.arcade_fests;
CREATE POLICY "Allow admin insert arcade_fests"
ON public.arcade_fests
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin update arcade_fests" ON public.arcade_fests;
CREATE POLICY "Allow admin update arcade_fests"
ON public.arcade_fests
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin delete arcade_fests" ON public.arcade_fests;
CREATE POLICY "Allow admin delete arcade_fests"
ON public.arcade_fests
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 5. Stored function to fetch fests with dynamic time-evaluated effective_status
-- Guarantees that even without external cron jobs, status is always accurate relative to now()
CREATE OR REPLACE FUNCTION public.get_arcade_fests()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  effective_status TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    f.id,
    f.title,
    f.description,
    f.start_time,
    f.end_time,
    f.status,
    CASE
      WHEN now() < f.start_time THEN 'upcoming'
      WHEN now() >= f.start_time AND now() <= f.end_time THEN 'live'
      ELSE 'ended'
    END AS effective_status,
    f.banner_url,
    f.created_at
  FROM public.arcade_fests f
  ORDER BY
    CASE
      WHEN now() >= f.start_time AND now() <= f.end_time THEN 1 -- Live first
      WHEN now() < f.start_time THEN 2                          -- Upcoming second
      ELSE 3                                                    -- Ended last
    END,
    f.start_time ASC;
$$;

-- 6. Maintenance procedure to persist status transitions if needed
CREATE OR REPLACE FUNCTION public.sync_arcade_fest_statuses()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Transition upcoming to live
  UPDATE public.arcade_fests
  SET status = 'live', updated_at = now()
  WHERE status = 'upcoming' AND now() >= start_time AND now() <= end_time;

  -- Transition live/upcoming to ended
  UPDATE public.arcade_fests
  SET status = 'ended', updated_at = now()
  WHERE status != 'ended' AND now() > end_time;
END;
$$;

-- 7. Add to realtime replication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_fests;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 8. Starter Seed Data (One LIVE, One UPCOMING, One ENDED)
DO $$
BEGIN
  -- 1. Live Fest (Started yesterday, ends in 3 days)
  IF NOT EXISTS (SELECT 1 FROM public.arcade_fests WHERE title = 'AlgoRush Clash: Spring 2026') THEN
    INSERT INTO public.arcade_fests (title, description, start_time, end_time, status)
    VALUES (
      'AlgoRush Clash: Spring 2026',
      'The premier squad algorithm competition. Join forces with your team to solve high-intensity dynamic programming and logic challenges in real time!',
      now() - INTERVAL '1 day',
      now() + INTERVAL '3 days',
      'live'
    );
  END IF;

  -- 2. Upcoming Fest (Starts in 5 days, ends in 8 days)
  IF NOT EXISTS (SELECT 1 FROM public.arcade_fests WHERE title = 'PixelCraft Frontend Hack Fest') THEN
    INSERT INTO public.arcade_fests (title, description, start_time, end_time, status)
    VALUES (
      'PixelCraft Frontend Hack Fest',
      'Retro-style responsive UI and component engineering fest. Build pixel-perfect interactive widgets alongside your 4-player team.',
      now() + INTERVAL '5 days',
      now() + INTERVAL '8 days',
      'upcoming'
    );
  END IF;

  -- 3. Ended Fest (Concluded last week)
  IF NOT EXISTS (SELECT 1 FROM public.arcade_fests WHERE title = 'Winter Code Brawl 2025') THEN
    INSERT INTO public.arcade_fests (title, description, start_time, end_time, status)
    VALUES (
      'Winter Code Brawl 2025',
      'Annual team tournament across Python and JavaScript track basics. Concluded with over 120 participating squads.',
      now() - INTERVAL '14 days',
      now() - INTERVAL '10 days',
      'ended'
    );
  END IF;
END $$;
