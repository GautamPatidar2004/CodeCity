-- Leaderboard Foundation & Profile Visibility Migration
-- 1. Index on profiles for efficient deterministic leaderboard sorting
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard_xp ON public.profiles (xp DESC, created_at ASC);

-- 2. Update profiles read RLS to allow authenticated learners to see profile info for rankings & community
DROP POLICY IF EXISTS "Profiles read access" ON public.profiles;
CREATE POLICY "Profiles read access"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 3. Function to get global leaderboard with computed rank safely
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INT DEFAULT 20)
RETURNS TABLE (
  rank BIGINT,
  id UUID,
  username TEXT,
  full_name TEXT,
  role TEXT,
  xp INTEGER,
  level INTEGER,
  avatar_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.xp DESC, p.created_at ASC, p.id ASC) AS rank,
    p.id,
    p.username,
    p.full_name,
    p.role,
    p.xp,
    p.level,
    p.avatar_url
  FROM public.profiles p
  ORDER BY p.xp DESC, p.created_at ASC, p.id ASC
  LIMIT limit_count;
$$;

-- 4. Function to get a specific user's global rank
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID)
RETURNS TABLE (
  rank BIGINT,
  xp INTEGER,
  level INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH ranked AS (
    SELECT
      p.id,
      p.xp,
      p.level,
      ROW_NUMBER() OVER (ORDER BY p.xp DESC, p.created_at ASC, p.id ASC) AS rank
    FROM public.profiles p
  )
  SELECT r.rank, r.xp, r.level
  FROM ranked r
  WHERE r.id = p_user_id;
$$;
