import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'cyberpunk' | 'synthwave' | 'hybrid';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  glowIntensity: number;
  setGlowIntensity: (intensity: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('synth-weaver-theme');
    return (saved as ThemeMode) || 'cyberpunk';
  });

  const [glowIntensity, setGlowIntensity] = useState(() => {
    const saved = localStorage.getItem('synth-weaver-glow');
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem('synth-weaver-theme', theme);
    
    // Remove all theme classes and add the current one
    document.documentElement.classList.remove('theme-cyberpunk', 'theme-synthwave', 'theme-hybrid');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('synth-weaver-glow', glowIntensity.toString());
    document.documentElement.style.setProperty('--glow-intensity', glowIntensity.toString());
  }, [glowIntensity]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, glowIntensity, setGlowIntensity }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
