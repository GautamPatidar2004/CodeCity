-- Migration: Allow public read arcade_fest_challenges and ensure mappings
DROP POLICY IF EXISTS "Allow authenticated read arcade_fest_challenges" ON public.arcade_fest_challenges;
DROP POLICY IF EXISTS "Allow public read arcade_fest_challenges" ON public.arcade_fest_challenges;

CREATE POLICY "Allow public read arcade_fest_challenges"
ON public.arcade_fest_challenges
FOR SELECT
USING (true);

-- Ensure challenges are mapped to the active fests
INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
SELECT '096b6184-cc17-4ad4-be39-3fdd1b22c123', 'f0000000-0000-0000-0000-000000000001', 1, 100
ON CONFLICT (fest_id, challenge_id) DO NOTHING;

INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
SELECT '096b6184-cc17-4ad4-be39-3fdd1b22c123', 'f0000000-0000-0000-0000-000000000002', 2, 150
ON CONFLICT (fest_id, challenge_id) DO NOTHING;

INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
SELECT '7df9e9a8-02ff-4e4d-a81d-91e0b142e22a', 'f0000000-0000-0000-0000-000000000002', 1, 120
ON CONFLICT (fest_id, challenge_id) DO NOTHING;

INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
SELECT '7df9e9a8-02ff-4e4d-a81d-91e0b142e22a', 'f0000000-0000-0000-0000-000000000003', 2, 180
ON CONFLICT (fest_id, challenge_id) DO NOTHING;
