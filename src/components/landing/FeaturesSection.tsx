import React from 'react';
import { GitBranch, FileCode, Users, Shield, Zap, Eye, Terminal, Layers } from 'lucide-react';

const features = [
  {
    icon: GitBranch,
    title: 'Git Integration',
    description: 'Full Git support with branch management, commit history, and merge operations.',
  },
  {
    icon: FileCode,
    title: 'Code Browser',
    description: 'Syntax-highlighted code viewer with neon-themed styling and search.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Role-based access control, code reviews, and activity tracking.',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Enterprise-grade security for your repositories and sensitive data.',
  },
  {
    icon: Zap,
    title: 'AI Assistant',
    description: 'Built-in AI for code generation, review suggestions, and automation.',
  },
  {
    icon: Eye,
    title: 'Visual Themes',
    description: 'Customizable neon aesthetics with Cyberpunk, Synthwave, and Hybrid modes.',
  },
  {
    icon: Terminal,
    title: 'Integrated Terminal',
    description: 'Built-in terminal for running commands without leaving the platform.',
  },
  {
    icon: Layers,
    title: 'Extension System',
    description: 'Expandable platform with a marketplace for custom tools and plugins.',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24 bg-card/30">
      {/* Background */}
      <div className="absolute inset-0 matrix-grid opacity-20" />
      
      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-muted-foreground">Powerful</span>{' '}
            <span className="neon-glow-secondary">Features</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to manage repositories, collaborate with teams, and build amazing software.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              {...feature} 
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description,
  index
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  index: number;
}) => {
  return (
    <div 
      className="group relative p-6 rounded-xl bg-background border border-border hover:border-secondary transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <h3 className="font-orbitron font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 neon-border-secondary pointer-events-none" />
    </div>
  );
};
