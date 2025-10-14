export const archetypeThemes = {
  'early-eagle': {
    name: 'Early Eagle',
    emoji: '🦅',
    colors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#FFC857',
      background: {
        from: '#1a0e0e',
        via: '#2d1810',
        to: '#1a0e0e'
      },
      card: {
        base: 'rgba(255, 107, 53, 0.05)',
        hover: 'rgba(255, 107, 53, 0.1)',
        border: 'rgba(255, 107, 53, 0.2)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#FFD7C4',
        muted: '#B88B7A'
      },
      gradient: 'from-orange-400 via-red-400 to-pink-500',
      shadow: '0 10px 40px rgba(255, 107, 53, 0.3)'
    },
    particles: {
      type: 'sunrise-rays' as const,
      color: '#FF6B35',
      amount: 30
    }
  },

  'night-owl': {
    name: 'Night Owl',
    emoji: '🦉',
    colors: {
      primary: '#6366F1',
      secondary: '#A78BFA',
      accent: '#C084FC',
      background: {
        from: '#0f0520',
        via: '#1e1538',
        to: '#0f0520'
      },
      card: {
        base: 'rgba(99, 102, 241, 0.05)',
        hover: 'rgba(99, 102, 241, 0.1)',
        border: 'rgba(99, 102, 241, 0.2)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#DDD6FE',
        muted: '#A78BFA'
      },
      gradient: 'from-indigo-400 via-purple-400 to-pink-500',
      shadow: '0 10px 40px rgba(99, 102, 241, 0.4)'
    },
    particles: {
      type: 'stars-twinkling' as const,
      color: '#C084FC',
      amount: 50
    }
  },

  'steady-tortoise': {
    name: 'Steady Tortoise',
    emoji: '🐢',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7',
      background: {
        from: '#0a1f0f',
        via: '#133820',
        to: '#0a1f0f'
      },
      card: {
        base: 'rgba(16, 185, 129, 0.05)',
        hover: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.2)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#D1FAE5',
        muted: '#6EE7B7'
      },
      gradient: 'from-green-400 via-emerald-400 to-teal-500',
      shadow: '0 10px 40px rgba(16, 185, 129, 0.3)'
    },
    particles: {
      type: 'leaves-falling' as const,
      color: '#10B981',
      amount: 20
    }
  },

  'sprint-rabbit': {
    name: 'Sprint Rabbit',
    emoji: '🐰',
    colors: {
      primary: '#FBBF24',
      secondary: '#F59E0B',
      accent: '#EF4444',
      background: {
        from: '#1f1000',
        via: '#332100',
        to: '#1f1000'
      },
      card: {
        base: 'rgba(251, 191, 36, 0.05)',
        hover: 'rgba(251, 191, 36, 0.1)',
        border: 'rgba(251, 191, 36, 0.2)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#FEF3C7',
        muted: '#FCD34D'
      },
      gradient: 'from-yellow-400 via-orange-400 to-red-500',
      shadow: '0 10px 40px rgba(251, 191, 36, 0.4)'
    },
    particles: {
      type: 'energy-sparks' as const,
      color: '#FBBF24',
      amount: 40
    }
  },

  'balanced-lion': {
    name: 'Balanced Lion',
    emoji: '🦁',
    colors: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#EF4444',
      background: {
        from: '#1a0f00',
        via: '#331e00',
        to: '#1a0f00'
      },
      card: {
        base: 'rgba(245, 158, 11, 0.05)',
        hover: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#FEF3C7',
        muted: '#FBBF24'
      },
      gradient: 'from-amber-400 via-orange-400 to-red-500',
      shadow: '0 10px 40px rgba(245, 158, 11, 0.4)'
    },
    particles: {
      type: 'golden-dust' as const,
      color: '#F59E0B',
      amount: 35
    }
  },

  'lone-wolf': {
    name: 'Lone Wolf',
    emoji: '🐺',
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      accent: '#3B82F6',
      background: {
        from: '#0a0e14',
        via: '#151b26',
        to: '#0a0e14'
      },
      card: {
        base: 'rgba(107, 114, 128, 0.05)',
        hover: 'rgba(107, 114, 128, 0.1)',
        border: 'rgba(107, 114, 128, 0.2)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#D1D5DB',
        muted: '#9CA3AF'
      },
      gradient: 'from-gray-400 via-slate-400 to-blue-500',
      shadow: '0 10px 40px rgba(107, 114, 128, 0.3)'
    },
    particles: {
      type: 'mist-fog' as const,
      color: '#6B7280',
      amount: 25
    }
  },

  'busy-bee': {
    name: 'Busy Bee',
    emoji: '🐝',
    colors: {
      primary: '#FBBF24',
      secondary: '#F59E0B',
      accent: '#FCD34D',
      background: {
        from: '#1a1400',
        via: '#2e2200',
        to: '#1a1400'
      },
      card: {
        base: 'rgba(251, 191, 36, 0.05)',
        hover: 'rgba(251, 191, 36, 0.1)',
        border: 'rgba(251, 191, 36, 0.2)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#FEF3C7',
        muted: '#FCD34D'
      },
      gradient: 'from-yellow-400 via-amber-400 to-orange-500',
      shadow: '0 10px 40px rgba(251, 191, 36, 0.3)'
    },
    particles: {
      type: 'honeycomb-pattern' as const,
      color: '#FBBF24',
      amount: 45
    }
  },

  'clever-fox': {
    name: 'Clever Fox',
    emoji: '🦊',
    colors: {
      primary: '#EC4899',
      secondary: '#F472B6',
      accent: '#A855F7',
      background: {
        from: '#1a0614',
        via: '#2d0d24',
        to: '#1a0614'
      },
      card: {
        base: 'rgba(236, 72, 153, 0.05)',
        hover: 'rgba(236, 72, 153, 0.1)',
        border: 'rgba(236, 72, 153, 0.2)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#FBCFE8',
        muted: '#F9A8D4'
      },
      gradient: 'from-rose-400 via-pink-400 to-purple-500',
      shadow: '0 10px 40px rgba(236, 72, 153, 0.4)'
    },
    particles: {
      type: 'sparkles-clever' as const,
      color: '#EC4899',
      amount: 30
    }
  }
};

export type ArchetypeTheme = typeof archetypeThemes[keyof typeof archetypeThemes];
export type ArchetypeId = keyof typeof archetypeThemes;
