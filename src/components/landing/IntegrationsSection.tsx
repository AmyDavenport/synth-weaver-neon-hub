import React from 'react';
import { Github, Database, Cloud, Code, Cpu, Boxes, Puzzle, Sparkles } from 'lucide-react';

const integrations = [
  {
    name: 'GitHub',
    description: 'Full repository sync & import',
    icon: Github,
    color: 'text-foreground',
  },
  {
    name: 'Hugging Face',
    description: 'Models & datasets hosting',
    icon: Cpu,
    color: 'text-yellow-400',
  },
  {
    name: 'Supabase',
    description: 'Backend database & auth',
    icon: Database,
    color: 'text-emerald-400',
  },
  {
    name: 'V0',
    description: 'Design-to-code generation',
    icon: Code,
    color: 'text-violet-400',
  },
  {
    name: 'Stackblitz',
    description: 'Cloud IDE integration',
    icon: Cloud,
    color: 'text-blue-400',
  },
  {
    name: 'Cyber-Studio-Suite',
    description: 'Your development IDE',
    icon: Boxes,
    color: 'text-primary',
  },
  {
    name: 'Aetheris AI',
    description: 'AI dev platform',
    icon: Sparkles,
    color: 'text-secondary',
  },
  {
    name: 'Extensions',
    description: 'Custom plugin marketplace',
    icon: Puzzle,
    color: 'text-accent',
  },
];

export const IntegrationsSection = () => {
  return (
    <section id="integrations" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 matrix-grid opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold mb-4">
            <span className="neon-glow">Integrations</span>{' '}
            <span className="text-muted-foreground">Hub</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Connect with your favorite tools and platforms. Built for flexibility and expandability.
          </p>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {integrations.map((integration, index) => (
            <IntegrationCard 
              key={integration.name} 
              {...integration} 
              delay={index * 0.05}
            />
          ))}
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border">
            <span className="text-sm text-muted-foreground">
              More integrations coming soon — 
            </span>
            <span className="text-sm text-primary font-medium">
              Become an integration partner →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

const IntegrationCard = ({ 
  name, 
  description, 
  icon: Icon, 
  color,
  delay 
}: { 
  name: string; 
  description: string; 
  icon: React.ElementType;
  color: string;
  delay: number;
}) => {
  return (
    <div 
      className="group relative p-5 rounded-xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary transition-all duration-300 cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className={`w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-orbitron font-semibold text-sm text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 neon-border pointer-events-none" />
    </div>
  );
};
