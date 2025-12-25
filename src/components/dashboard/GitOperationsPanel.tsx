import React, { useState, useEffect } from 'react';
import { 
  X, GitBranch, GitCommit, Copy, Check, 
  Plus, RefreshCw, ChevronRight, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Repository {
  id: string;
  name: string;
  clone_url: string | null;
}

interface Branch {
  id: string;
  name: string;
  is_default: boolean;
  sha: string | null;
}

interface Commit {
  id: string;
  sha: string;
  message: string;
  author_name: string | null;
  committed_at: string;
}

interface GitOperationsPanelProps {
  repo: Repository;
  onClose: () => void;
}

export const GitOperationsPanel = ({ repo, onClose }: GitOperationsPanelProps) => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [activeTab, setActiveTab] = useState<'branches' | 'commits' | 'terminal'>('branches');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [repo.id]);

  const fetchData = async () => {
    setLoading(true);
    
    const [branchesRes, commitsRes] = await Promise.all([
      supabase.from('branches').select('*').eq('repository_id', repo.id).order('is_default', { ascending: false }),
      supabase.from('commits').select('*').eq('repository_id', repo.id).order('committed_at', { ascending: false }).limit(20),
    ]);

    if (branchesRes.data) setBranches(branchesRes.data);
    if (commitsRes.data) setCommits(commitsRes.data);
    
    setLoading(false);
  };

  const handleCopyCloneUrl = () => {
    const url = repo.clone_url || `https://synth-weaver.neon-hub/${repo.name}.git`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Clone URL copied!" });
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;

    const { error } = await supabase.from('branches').insert({
      repository_id: repo.id,
      name: newBranchName.trim(),
      sha: Math.random().toString(36).substring(2, 10),
    });

    if (error) {
      toast({ title: "Failed to create branch", variant: "destructive" });
    } else {
      toast({ title: `Branch "${newBranchName}" created!` });
      setNewBranchName('');
      fetchData();
    }
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-card border-l border-border z-40 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h2 className="font-orbitron font-bold text-foreground">{repo.name}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Clone URL */}
      <div className="p-4 border-b border-border">
        <label className="text-xs text-muted-foreground mb-2 block">Clone URL</label>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={repo.clone_url || `https://synth-weaver.neon-hub/${repo.name}.git`}
            className="bg-input border-border text-xs font-mono"
          />
          <Button variant="outline" size="icon" onClick={handleCopyCloneUrl}>
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'branches', icon: GitBranch, label: 'Branches' },
          { id: 'commits', icon: GitCommit, label: 'Commits' },
          { id: 'terminal', icon: Terminal, label: 'Terminal' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-all ${
              activeTab === id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'branches' ? (
          <div className="space-y-4">
            {/* Create Branch */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="New branch name..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
                className="bg-input border-border"
              />
              <Button onClick={handleCreateBranch} size="icon" className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Branch List */}
            <div className="space-y-2">
              {branches.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No branches yet</p>
              ) : (
                branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-primary" />
                      <span className="text-foreground font-medium">{branch.name}</span>
                      {branch.is_default && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">default</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{branch.sha?.substring(0, 7)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'commits' ? (
          <div className="space-y-3">
            {commits.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No commits yet</p>
            ) : (
              commits.map((commit, index) => (
                <div key={commit.id} className="relative pl-6">
                  {/* Timeline line */}
                  {index < commits.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
                  )}
                  {/* Commit dot */}
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary" />
                  
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-foreground text-sm font-medium line-clamp-2">{commit.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                      <span>•</span>
                      <span>{commit.author_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(commit.committed_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-background rounded-lg p-4 font-mono text-sm">
              <div className="text-muted-foreground">
                <span className="text-primary">synth-weaver</span>
                <span className="text-secondary">@</span>
                <span className="text-accent">{repo.name}</span>
                <span className="text-muted-foreground"> $ </span>
              </div>
              <p className="text-muted-foreground mt-2">Terminal ready for neural commands...</p>
            </div>
            <Input
              placeholder="Enter command..."
              className="mt-2 bg-input border-border font-mono"
            />
          </div>
        )}
      </div>
    </div>
  );
};
