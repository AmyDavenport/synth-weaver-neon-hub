import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Puzzle, Search, Download, Check, Trash2, 
  Palette, Code, Brain, Plug, ArrowLeft, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { getUserFriendlyError } from '@/lib/errorUtils';

interface Extension {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  author: string | null;
  downloads_count: number;
  is_official: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  themes: Palette,
  tools: Code,
  ai: Brain,
  integrations: Plug,
};

const Extensions = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    
    const [extensionsRes, installedRes] = await Promise.all([
      supabase.from('extensions').select('*').order('downloads_count', { ascending: false }),
      supabase.from('user_extensions').select('extension_id'),
    ]);

    if (extensionsRes.data) setExtensions(extensionsRes.data);
    if (installedRes.data) {
      setInstalledIds(new Set(installedRes.data.map((i) => i.extension_id)));
    }
    
    setLoading(false);
  };

  const installExtension = async (ext: Extension) => {
    const { error } = await supabase.from('user_extensions').insert({
      user_id: user?.id,
      extension_id: ext.id,
    });

    if (error) {
      toast({
        title: "Installation failed",
        description: getUserFriendlyError(error, 'installExtension'),
        variant: "destructive",
      });
    } else {
      setInstalledIds((prev) => new Set([...prev, ext.id]));
      toast({
        title: "Extension installed!",
        description: `${ext.name} is now active.`,
      });
    }
  };

  const uninstallExtension = async (ext: Extension) => {
    const { error } = await supabase
      .from('user_extensions')
      .delete()
      .eq('extension_id', ext.id)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Uninstall failed",
        description: getUserFriendlyError(error, 'uninstallExtension'),
        variant: "destructive",
      });
    } else {
      setInstalledIds((prev) => {
        const next = new Set(prev);
        next.delete(ext.id);
        return next;
      });
      toast({
        title: "Extension removed",
        description: `${ext.name} has been uninstalled.`,
      });
    }
  };

  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || ext.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['themes', 'tools', 'ai', 'integrations'];

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
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-orbitron text-2xl font-bold text-foreground flex items-center gap-2">
                <Puzzle className="w-7 h-7 text-primary" />
                Extension Marketplace
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Enhance your workflow with powerful extensions
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search extensions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                      activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extensions Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExtensions.map((ext) => {
                const Icon = categoryIcons[ext.category] || Puzzle;
                const isInstalled = installedIds.has(ext.id);

                return (
                  <div key={ext.id} className="glass-card p-5 group hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{ext.name}</h3>
                            {ext.is_official && (
                              <span className="text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">Official</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">by {ext.author}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ext.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Download className="w-4 h-4" />
                        <span>{ext.downloads_count.toLocaleString()}</span>
                      </div>

                      {isInstalled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => uninstallExtension(ext)}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => installExtension(ext)}
                          className="bg-primary text-primary-foreground"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Install
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Extensions;
