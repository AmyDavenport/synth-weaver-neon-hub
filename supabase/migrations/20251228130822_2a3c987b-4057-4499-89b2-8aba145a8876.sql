-- Allow authenticated users to view public repositories from any user
CREATE POLICY "Anyone can view public repositories"
ON public.repositories
FOR SELECT
TO authenticated
USING (visibility = 'public');