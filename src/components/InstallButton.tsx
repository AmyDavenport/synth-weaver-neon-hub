import React from 'react';
import { Download, Check, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useToast } from '@/hooks/use-toast';

export const InstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const { toast } = useToast();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App Installed!",
        description: "Synth-Weaver Neon-Hub is now on your device.",
      });
    }
  };

  if (isInstalled) {
    return (
      <Button variant="outline" size="sm" disabled className="border-primary/50 text-primary/70">
        <Check className="w-4 h-4 mr-2" />
        Installed
      </Button>
    );
  }

  if (isInstallable) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleInstall}
        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground neon-border"
      >
        <Download className="w-4 h-4 mr-2" />
        Install App
      </Button>
    );
  }

  // Show a hint for mobile users
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-muted-foreground hover:text-primary"
      onClick={() => {
        toast({
          title: "Install from Browser",
          description: "Use your browser menu → 'Add to Home Screen' to install this app.",
        });
      }}
    >
      <Smartphone className="w-4 h-4 mr-2" />
      Install
    </Button>
  );
};
