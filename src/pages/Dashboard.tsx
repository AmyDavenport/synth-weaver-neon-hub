import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, GitBranch, Star, GitFork, Clock, 
  Settings, LogOut, RefreshCw, Filter, Grid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { RepositoryCard } from '@/components/dashboard/RepositoryCard';
import { CreateRepoDialog } from '@/components/dashboard/CreateRepoDialog';
import { GitOperationsPanel } from '@/components/dashboard/GitOperationsPanel';
import { CoPilotChat } from '@/components/dashboard/CoPilotChat';
import { Sidebar } from '@/components/dashboard/Sidebar';

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
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRepos();
    }
  }, [user]);

  const fetchRepos = async () => {
    setLoadingRepos(true);
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading repositories",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRepos(data || []);
    }
    setLoadingRepos(false);
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
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
        <Sidebar onNavigate={(page) => {
          if (page === 'extensions') navigate('/extensions');
        }} />
        
        <main className="flex-1 p-6 ml-64">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-orbitron text-2xl font-bold text-foreground">
                Repository Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your projects and code repositories
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRepos}
                className="border-border hover:border-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 neon-border"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Repository
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary"
              />
            </div>
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

          {/* Repository Grid/List */}
          {loadingRepos ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="text-center py-20">
              <GitBranch className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No repositories yet</h3>
              <p className="text-muted-foreground mb-4">Create your first repository or sync from GitHub</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Repository
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredRepos.map((repo) => (
                <RepositoryCard
                  key={repo.id}
                  repo={repo}
                  viewMode={viewMode}
                  onSelect={() => setSelectedRepo(repo)}
                  onRefresh={fetchRepos}
                />
              ))}
            </div>
          )}
        </main>

        {/* Git Operations Panel (slides in when repo selected) */}
        {selectedRepo && (
          <GitOperationsPanel
            repo={selectedRepo}
            onClose={() => setSelectedRepo(null)}
          />
        )}
      </div>

      {/* Co-Pilot Chat */}
      <CoPilotChat />

      {/* Create Repo Dialog */}
      <CreateRepoDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={fetchRepos}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
