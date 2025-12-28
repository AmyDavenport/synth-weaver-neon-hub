-- Add composite unique constraint for user_id and github_repo_id
-- This prevents one user from hijacking another user's synced repository
ALTER TABLE public.repositories 
ADD CONSTRAINT repositories_user_github_unique 
UNIQUE (user_id, github_repo_id);