import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Github, RefreshCw, Check, X, Loader2, 
  Cloud, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/dashboard/Sidebar';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  clone_url: string;
  private: boolean;
}

const GitHubSync = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [githubToken, setGithubToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkConnection();
    }
  }, [user]);

  const checkConnection = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('github_access_token')
      .eq('user_id', user?.id)
      .single();

    if (data?.github_access_token) {
      setIsConnected(true);
      setGithubToken(data.github_access_token);
      fetchGitHubRepos(data.github_access_token);
    }
  };

  const fetchGitHubRepos = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch repos');

      const data = await response.json();
      setRepos(data);
    } catch (error: any) {
      toast({
        title: "Failed to fetch repositories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!githubToken.trim()) {
      toast({
        title: "Token required",
        description: "Please enter your GitHub personal access token.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verify token
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) throw new Error('Invalid token');

      const userData = await response.json();

      // Save token to profile
      await supabase
        .from('profiles')
        .update({
          github_access_token: githubToken,
          github_username: userData.login,
        })
        .eq('user_id', user?.id);

      setIsConnected(true);
      toast({
        title: "GitHub Connected!",
        description: `Welcome, ${userData.login}!`,
      });

      fetchGitHubRepos(githubToken);
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: "Invalid token or GitHub API error.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRepoSelection = (id: number) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRepos(newSelected);
  };

  const selectAll = () => {
    setSelectedRepos(new Set(repos.map((r) => r.id)));
  };

  const syncSelectedRepos = async () => {
    if (selectedRepos.size === 0) {
      toast({
        title: "No repos selected",
        description: "Please select repositories to sync.",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    const reposToSync = repos.filter((r) => selectedRepos.has(r.id));

    try {
      for (const repo of reposToSync) {
        await supabase.from('repositories').upsert({
          user_id: user?.id,
          name: repo.name,
          description: repo.description,
          visibility: repo.private ? 'private' : 'public',
          language: repo.language,
          stars_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          github_repo_id: repo.id.toString(),
          github_full_name: repo.full_name,
          clone_url: repo.clone_url,
          is_synced: true,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'github_repo_id',
        });
      }

      toast({
        title: "Sync complete!",
        description: `${reposToSync.length} repositories synced.`,
      });

      setSelectedRepos(new Set());
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-orbitron text-2xl font-bold text-foreground flex items-center gap-2">
                  <Github className="w-7 h-7" />
                  GitHub Integration
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Sync your entire GitHub account to Synth-Weaver Neon-Hub
                </p>
              </div>
            </div>

            {!isConnected ? (
              <div className="glass-card p-8 neon-box max-w-md">
                <div className="text-center mb-6">
                  <Github className="w-16 h-16 mx-auto text-primary mb-4" />
                  <h2 className="font-orbitron text-xl font-bold text-foreground mb-2">
                    Connect GitHub
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Enter your GitHub personal access token to sync repositories
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="bg-input border-border focus:border-primary font-mono"
                  />
                  <Button
                    onClick={handleConnect}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Github className="w-4 h-4 mr-2" />}
                    Connect GitHub
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Create a token at GitHub → Settings → Developer Settings → Personal Access Tokens.
                    Required scopes: repo, read:user
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Connected Banner */}
                <div className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">GitHub Connected</p>
                      <p className="text-muted-foreground text-sm">{repos.length} repositories found</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={selectAll} size="sm">
                      Select All
                    </Button>
                    <Button
                      onClick={syncSelectedRepos}
                      disabled={syncing || selectedRepos.size === 0}
                      className="bg-primary text-primary-foreground"
                    >
                      {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Cloud className="w-4 h-4 mr-2" />}
                      Sync {selectedRepos.size > 0 ? `(${selectedRepos.size})` : ''}
                    </Button>
                  </div>
                </div>

                {/* Repo List */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {repos.map((repo) => (
                      <div
                        key={repo.id}
                        onClick={() => toggleRepoSelection(repo.id)}
                        className={`glass-card p-4 cursor-pointer transition-all ${
                          selectedRepos.has(repo.id) ? 'border-primary neon-border' : 'hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedRepos.has(repo.id) ? 'border-primary bg-primary' : 'border-muted-foreground'
                            }`}>
                              {selectedRepos.has(repo.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div>
                              <h3 className="text-foreground font-medium">{repo.name}</h3>
                              {repo.description && (
                                <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{repo.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-muted-foreground text-sm">
                            {repo.language && <span>{repo.language}</span>}
                            <span>⭐ {repo.stargazers_count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default GitHubSync;
