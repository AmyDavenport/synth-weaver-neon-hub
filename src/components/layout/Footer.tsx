import React from 'react';

export const Footer = () => {
  return (
    <footer className="relative border-t border-border bg-background/90 backdrop-blur-sm">
      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center">
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6 mb-8">
            <a 
              href="#documentation" 
              className="text-muted-foreground hover:text-primary transition-colors neon-underline py-1 text-sm font-medium"
            >
              Documentation
            </a>
            <span className="text-border hidden sm:inline">•</span>
            <a 
              href="#api" 
              className="text-muted-foreground hover:text-primary transition-colors neon-underline py-1 text-sm font-medium"
            >
              API Reference
            </a>
            <span className="text-border hidden sm:inline">•</span>
            <a 
              href="#community" 
              className="text-muted-foreground hover:text-primary transition-colors neon-underline py-1 text-sm font-medium"
            >
              Community
            </a>
            <span className="text-border hidden sm:inline">•</span>
            <a 
              href="#support" 
              className="text-muted-foreground hover:text-primary transition-colors neon-underline py-1 text-sm font-medium"
            >
              Support
            </a>
          </nav>

          {/* Studio Branding */}
          <div className="mb-6">
            <p className="text-secondary font-orbitron text-sm tracking-widest neon-glow-secondary">
              A Spell Weaver Studios Application
            </p>
          </div>

          {/* Founder Info */}
          <div className="text-muted-foreground text-sm space-y-2">
            <p>
              <span className="text-foreground">© 2025-2026</span>
              {' '}
              <span className="text-primary font-medium">Harold Hocum</span>
              {' | '}
              <span>Founder</span>
              {' | '}
              <span className="text-secondary">Systems Architect & Software Engineer</span>
            </p>
            
            <p className="flex flex-wrap items-center justify-center gap-x-2">
              <a 
                href="mailto:Harold.Hocum@Gmail.com" 
                className="hover:text-primary transition-colors"
              >
                Harold.Hocum@Gmail.com
              </a>
              {' | '}
              <a 
                href="mailto:Founder@spell-weaver-studio.com" 
                className="hover:text-primary transition-colors"
              >
                Founder@spell-weaver-studio.com
              </a>
              <span className="text-border">•</span>
              <a 
                href="#portfolio" 
                className="text-accent hover:text-primary transition-colors font-medium neon-underline"
              >
                Portfolio
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-secondary to-transparent opacity-30" />
    </footer>
  );
};
