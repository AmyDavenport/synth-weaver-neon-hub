import React, { useState } from 'react';
import { Loader2, Lock, Globe, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/errorUtils';

interface CreateRepoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const languages = ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'Other'];

export const CreateRepoDialog = ({ open, onOpenChange, onCreated }: CreateRepoDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'team'>('private');
  const [language, setLanguage] = useState('TypeScript');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('repositories').insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        visibility,
        language,
      });

      if (error) throw error;

      toast({
        title: "Repository created!",
        description: `${name} is ready to use.`,
      });

      setName('');
      setDescription('');
      setVisibility('private');
      onOpenChange(false);
      onCreated();
    } catch (error: unknown) {
      toast({
        title: "Failed to create repository",
        description: getUserFriendlyError(error, 'createRepository'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-foreground">Create New Repository</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up a new repository for your project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Repository Name</Label>
            <Input
              id="name"
              placeholder="my-awesome-project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-input border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border focus:border-primary resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Visibility</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'private', icon: Lock, label: 'Private' },
                { value: 'public', icon: Globe, label: 'Public' },
                { value: 'team', icon: Users, label: 'Team' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVisibility(value as typeof visibility)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    visibility === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Primary Language</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    language === lang
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
