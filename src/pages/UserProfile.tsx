import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, Globe, User, Calendar, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { RepositoryCard } from '@/components/dashboard/RepositoryCard';
import { formatDistanceToNow } from 'date-fns';
import { getUserFriendlyError } from '@/lib/errorUtils';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  github_username: string | null;
  created_at: string;
}

interface Repository {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  language: string | null;
  stars_count: number;
  forks_count: number;
  is_synced: boolean;
  clone_url: string | null;
  updated_at: string;
  user_id: string;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    
    setLoading(true);

    // Fetch profile (this will work because profiles are viewable by authenticated users)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      toast({
        title: "Error loading profile",
        description: getUserFriendlyError(profileError, 'fetchProfile'),
        variant: "destructive",
      });
    } else if (profileData) {
      setProfile(profileData);
    }

    // Fetch public repositories for this user
    const { data: reposData, error: reposError } = await supabase
      .from('repositories')
      .select('*')
      .eq('user_id', userId)
      .eq('visibility', 'public')
      .order('stars_count', { ascending: false });

    if (reposError) {
      toast({
        title: "Error loading repositories",
        description: getUserFriendlyError(reposError, 'fetchRepos'),
        variant: "destructive",
      });
    } else {
      setRepos(reposData || []);
    }

    setLoading(false);
  };

  const displayName = profile?.username || profile?.github_username || 'Unknown User';
  const initials = displayName.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center pt-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center pt-32">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">This user profile doesn't exist or is private.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <div className="glass-card p-6 mb-8 neon-box">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24 border-2 border-primary">
              <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="font-orbitron text-2xl font-bold text-foreground mb-1">
                {displayName}
              </h1>
              {profile.github_username && profile.github_username !== profile.username && (
                <p className="text-muted-foreground text-sm mb-2">
                  @{profile.github_username} on GitHub
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>{repos.length} public {repos.length === 1 ? 'repository' : 'repositories'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Repositories */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-orbitron text-xl font-bold text-foreground">
            Public Repositories
          </h2>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {repos.length === 0 ? (
          <div className="text-center py-20">
            <GitBranch className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No public repositories</h3>
            <p className="text-muted-foreground">This user hasn't made any repositories public yet.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {repos.map((repo) => (
              <RepositoryCard
                key={repo.id}
                repo={repo}
                viewMode={viewMode}
                onSelect={() => {}}
                onRefresh={() => {}}
                isOwner={false}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;