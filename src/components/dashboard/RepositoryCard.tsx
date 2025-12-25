import React from 'react';
import { GitBranch, Star, GitFork, Clock, Lock, Globe, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

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

interface RepositoryCardProps {
  repo: Repository;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onRefresh: () => void;
}

const visibilityIcons = {
  public: Globe,
  private: Lock,
  team: Users,
};

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-500',
  Python: 'bg-green-500',
  Rust: 'bg-orange-500',
  Go: 'bg-cyan-500',
  default: 'bg-muted-foreground',
};

export const RepositoryCard = ({ repo, viewMode, onSelect, onRefresh }: RepositoryCardProps) => {
  const { toast } = useToast();
  const VisibilityIcon = visibilityIcons[repo.visibility as keyof typeof visibilityIcons] || Lock;
  const langColor = languageColors[repo.language || ''] || languageColors.default;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete repository "${repo.name}"?`)) return;

    const { error } = await supabase
      .from('repositories')
      .delete()
      .eq('id', repo.id);

    if (error) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Repository deleted",
        description: `${repo.name} has been removed.`,
      });
      onRefresh();
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={onSelect}
        className="glass-card p-4 hover:border-primary/50 cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GitBranch className="w-5 h-5 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {repo.name}
                </h3>
                <VisibilityIcon className="w-3 h-3 text-muted-foreground" />
                {repo.is_synced && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Synced</span>
                )}
              </div>
              {repo.description && (
                <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            {repo.language && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${langColor}`} />
                <span className="text-sm text-muted-foreground">{repo.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-4 h-4" />
              <span className="text-sm">{repo.stars_count}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <GitFork className="w-4 h-4" />
              <span className="text-sm">{repo.forks_count}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className="glass-card p-5 hover:border-primary/50 cursor-pointer transition-all group neon-box"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[180px]">
            {repo.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <VisibilityIcon className="w-4 h-4 text-muted-foreground" />
          {repo.is_synced && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Synced</span>
          )}
        </div>
      </div>

      {repo.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{repo.description}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${langColor}`} />
              <span className="text-muted-foreground">{repo.language}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-3.5 h-3.5" />
            <span>{repo.stars_count}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <GitFork className="w-3.5 h-3.5" />
            <span>{repo.forks_count}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="w-8 h-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 text-muted-foreground mt-3 pt-3 border-t border-border">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs">Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}</span>
      </div>
    </div>
  );
};
