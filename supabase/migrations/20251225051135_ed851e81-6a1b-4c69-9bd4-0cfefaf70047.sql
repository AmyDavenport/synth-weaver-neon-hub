-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create repositories table
CREATE TABLE public.repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'team')),
  language TEXT,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  github_repo_id TEXT,
  github_full_name TEXT,
  clone_url TEXT,
  is_synced BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on repositories
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

-- Repository policies
CREATE POLICY "Users can view their own repositories" ON public.repositories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own repositories" ON public.repositories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own repositories" ON public.repositories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own repositories" ON public.repositories FOR DELETE USING (auth.uid() = user_id);

-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  sha TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Branches policies
CREATE POLICY "Users can view branches of their repos" ON public.branches FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.repositories WHERE id = repository_id AND user_id = auth.uid()));
CREATE POLICY "Users can create branches in their repos" ON public.branches FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.repositories WHERE id = repository_id AND user_id = auth.uid()));
CREATE POLICY "Users can update branches in their repos" ON public.branches FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.repositories WHERE id = repository_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete branches in their repos" ON public.branches FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.repositories WHERE id = repository_id AND user_id = auth.uid()));

-- Create commits table
CREATE TABLE public.commits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  sha TEXT NOT NULL,
  message TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,
  committed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on commits
ALTER TABLE public.commits ENABLE ROW LEVEL SECURITY;

-- Commits policies
CREATE POLICY "Users can view commits of their repos" ON public.commits FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.repositories WHERE id = repository_id AND user_id = auth.uid()));
CREATE POLICY "Users can create commits in their repos" ON public.commits FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.repositories WHERE id = repository_id AND user_id = auth.uid()));

-- Create extensions table
CREATE TABLE public.extensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('themes', 'tools', 'ai', 'integrations')),
  icon TEXT,
  author TEXT,
  downloads_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on extensions
ALTER TABLE public.extensions ENABLE ROW LEVEL SECURITY;

-- Extensions are publicly viewable
CREATE POLICY "Anyone can view extensions" ON public.extensions FOR SELECT USING (true);

-- Create user_extensions table for installed extensions
CREATE TABLE public.user_extensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  extension_id UUID NOT NULL REFERENCES public.extensions(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, extension_id)
);

-- Enable RLS on user_extensions
ALTER TABLE public.user_extensions ENABLE ROW LEVEL SECURITY;

-- User extensions policies
CREATE POLICY "Users can view their installed extensions" ON public.user_extensions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can install extensions" ON public.user_extensions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can uninstall extensions" ON public.user_extensions FOR DELETE USING (auth.uid() = user_id);

-- Create chat_messages table for co-pilot
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (new.id, new.raw_user_meta_data ->> 'username');
  RETURN new;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON public.repositories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample extensions
INSERT INTO public.extensions (name, description, category, icon, author, is_official, downloads_count) VALUES
('Neon Dark Theme', 'A stunning neon dark theme with customizable glow effects', 'themes', 'Palette', 'Spell Weaver Studios', true, 2500),
('Synthwave Colors', 'Retro 80s inspired color scheme with gradient accents', 'themes', 'Palette', 'Spell Weaver Studios', true, 1800),
('Code Formatter Pro', 'Advanced code formatting with support for 50+ languages', 'tools', 'Code', 'Community', false, 3200),
('Git Graph Visualizer', 'Beautiful visual representation of your git history', 'tools', 'GitBranch', 'Community', false, 2100),
('AI Code Review', 'Automated code review powered by advanced AI models', 'ai', 'Brain', 'Spell Weaver Studios', true, 4500),
('Smart Autocomplete', 'Context-aware code completion using machine learning', 'ai', 'Sparkles', 'Community', false, 3800),
('GitHub Actions', 'Seamless integration with GitHub Actions workflows', 'integrations', 'Github', 'Spell Weaver Studios', true, 5200),
('Docker Support', 'Container management and Dockerfile editing', 'integrations', 'Container', 'Community', false, 2900);