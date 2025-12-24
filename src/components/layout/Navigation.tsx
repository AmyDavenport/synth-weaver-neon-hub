import React from 'react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { Zap, Sun, Sparkles, Github, Menu, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  cyberpunk: <Zap className="w-4 h-4" />,
  synthwave: <Sun className="w-4 h-4" />,
  hybrid: <Sparkles className="w-4 h-4" />,
};

const themeLabels: Record<ThemeMode, string> = {
  cyberpunk: 'Cyber',
  synthwave: 'Synth',
  hybrid: 'Hybrid',
};

export const Navigation = () => {
  const { theme, setTheme, glowIntensity, setGlowIntensity } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const themes: ThemeMode[] = ['cyberpunk', 'synthwave', 'hybrid'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary flex items-center justify-center neon-border">
                <span className="font-orbitron font-bold text-primary text-lg neon-glow">S</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-orbitron font-bold text-lg text-foreground tracking-wide">
                <span className="neon-glow">Synth-Weaver</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-1">
                Neon-Hub
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors neon-underline py-1">
              Features
            </a>
            <a href="#integrations" className="text-sm text-muted-foreground hover:text-primary transition-colors neon-underline py-1">
              Integrations
            </a>
            <a href="#docs" className="text-sm text-muted-foreground hover:text-primary transition-colors neon-underline py-1">
              Docs
            </a>
          </div>

          {/* Theme Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center bg-card border border-border rounded-lg p-1 gap-1">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                    theme === t
                      ? 'bg-primary text-primary-foreground neon-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {themeIcons[t]}
                  <span className="hidden lg:inline">{themeLabels[t]}</span>
                </button>
              ))}
            </div>

            {/* Glow Intensity Slider */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <Slider
                value={[glowIntensity * 100]}
                onValueChange={(value) => setGlowIntensity(value[0] / 100)}
                max={100}
                step={10}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground w-8">{Math.round(glowIntensity * 100)}%</span>
            </div>

            {/* GitHub Button */}
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Github className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-muted-foreground hover:text-primary">Features</a>
              <a href="#integrations" className="text-sm text-muted-foreground hover:text-primary">Integrations</a>
              <a href="#docs" className="text-sm text-muted-foreground hover:text-primary">Docs</a>
              
              {/* Mobile Theme Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Theme:</span>
                <div className="flex gap-1">
                  {themes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        theme === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {themeIcons[t]}
                      {themeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Glow Slider */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Glow:</span>
                <Slider
                  value={[glowIntensity * 100]}
                  onValueChange={(value) => setGlowIntensity(value[0] / 100)}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">{Math.round(glowIntensity * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
