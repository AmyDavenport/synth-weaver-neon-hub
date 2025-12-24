import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Layers, Zap, Box } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 matrix-grid opacity-50" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Repository Management Reimagined</span>
        </div>

        {/* Main Title */}
        <h1 className="font-orbitron text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="block text-foreground">
            <span className="neon-glow">Synth-Weaver</span>
          </span>
          <span className="block mt-2 gradient-text animate-text-glow">
            Neon-Hub
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up font-rajdhani" style={{ animationDelay: '0.2s' }}>
          A next-generation repository platform combining the power of{' '}
          <span className="text-primary font-medium">GitHub</span>,{' '}
          <span className="text-secondary font-medium">Hugging Face</span>, and{' '}
          <span className="text-accent font-medium">AI-powered</span> development tools.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-orbitron text-sm px-8 py-6 neon-border animate-glow-pulse"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-border text-foreground hover:bg-card font-orbitron text-sm px-8 py-6"
          >
            <Github className="mr-2 w-4 h-4" />
            View on GitHub
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <FeatureCard
            icon={<Layers className="w-6 h-6" />}
            title="Multi-Platform Sync"
            description="Seamlessly sync with GitHub, GitLab, and more"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="AI-Powered Tools"
            description="Intelligent code generation and review"
          />
          <FeatureCard
            icon={<Box className="w-6 h-6" />}
            title="Extensible Platform"
            description="Build and install custom extensions"
          />
        </div>
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
    </section>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="group relative p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary transition-all duration-300 neon-border hover:neon-box">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="font-orbitron font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
