import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { archetypeThemes, ArchetypeId, ArchetypeTheme } from '@/config/archetypeThemes';
import { supabase } from '@/integrations/supabase/client';

interface ArchetypeThemeContextType {
  currentTheme: ArchetypeTheme;
  setArchetype: (archetypeId: ArchetypeId) => void;
  isLoading: boolean;
}

const ArchetypeThemeContext = createContext<ArchetypeThemeContextType | undefined>(undefined);

export function ArchetypeThemeProvider({ children }: { children: ReactNode }) {
  const [currentArchetype, setCurrentArchetype] = useState<ArchetypeId>('early-eagle');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserArchetype();
  }, []);

  async function loadUserArchetype() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Note: archetype column may not exist yet in profiles table
      // This will be added via migration or handled in onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && 'archetype' in profile && profile.archetype) {
        setCurrentArchetype(profile.archetype as ArchetypeId);
      }
    } catch (error) {
      console.error('Error loading archetype:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const setArchetype = (archetypeId: ArchetypeId) => {
    setCurrentArchetype(archetypeId);
    applyThemeToDocument(archetypeThemes[archetypeId]);
  };

  const applyThemeToDocument = (theme: ArchetypeTheme) => {
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--bg-from', theme.colors.background.from);
    root.style.setProperty('--bg-via', theme.colors.background.via);
    root.style.setProperty('--bg-to', theme.colors.background.to);
    root.style.setProperty('--shadow', theme.colors.shadow);
  };

  useEffect(() => {
    if (!isLoading) {
      applyThemeToDocument(archetypeThemes[currentArchetype]);
    }
  }, [currentArchetype, isLoading]);

  const currentTheme = archetypeThemes[currentArchetype];

  return (
    <ArchetypeThemeContext.Provider value={{ currentTheme, setArchetype, isLoading }}>
      {children}
    </ArchetypeThemeContext.Provider>
  );
}

export function useArchetypeTheme() {
  const context = useContext(ArchetypeThemeContext);
  if (!context) {
    throw new Error('useArchetypeTheme must be used within ArchetypeThemeProvider');
  }
  return context;
}
