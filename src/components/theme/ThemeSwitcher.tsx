import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchetypeTheme } from '@/contexts/ArchetypeThemeContext';
import { archetypeThemes, ArchetypeId } from '@/config/archetypeThemes';
import { Palette } from 'lucide-react';

export default function ThemeSwitcher() {
  const { currentTheme, setArchetype } = useArchetypeTheme();
  const [isOpen, setIsOpen] = useState(false);

  const allThemes = Object.values(archetypeThemes);
  const currentArchetypeId = Object.keys(archetypeThemes).find(
    key => archetypeThemes[key as ArchetypeId].name === currentTheme.name
  ) as ArchetypeId;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Theme Switcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
          borderColor: currentTheme.colors.accent
        }}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
      >
        <Palette className="w-6 h-6 text-white" />
      </motion.button>

      {/* Theme Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-20 right-0 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl"
            style={{
              backgroundColor: currentTheme.colors.background.from + 'E6',
              borderColor: currentTheme.colors.card.border
            }}
          >
            <div className="grid grid-cols-4 gap-3 max-w-sm">
              {allThemes.map((theme) => {
                const themeId = Object.keys(archetypeThemes).find(
                  key => archetypeThemes[key as ArchetypeId].name === theme.name
                ) as ArchetypeId;
                
                return (
                  <motion.button
                    key={themeId}
                    onClick={() => {
                      setArchetype(themeId);
                      setIsOpen(false);
                    }}
                    className="w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                      borderColor: currentArchetypeId === themeId ? '#FFFFFF' : 'transparent'
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-2xl">{theme.emoji}</span>
                    {currentArchetypeId === themeId && (
                      <motion.div
                        layoutId="activeTheme"
                        className="absolute inset-0 border-4 border-white rounded-xl"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-medium" style={{ color: currentTheme.colors.text.primary }}>
                {currentTheme.name}
              </p>
              <p className="text-xs" style={{ color: currentTheme.colors.text.muted }}>
                {currentTheme.tagline}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
