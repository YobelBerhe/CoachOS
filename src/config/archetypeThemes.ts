export const archetypeThemes = {
  'early-eagle': {
    name: 'Early Eagle',
    emoji: '🦅',
    tagline: 'I own the morning. Sunrise is my power hour.',
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
      shadow: '0 10px 40px rgba(255, 107, 53, 0.3)',
      glow: 'rgba(255, 107, 53, 0.5)'
    },
    animations: {
      duration: {
        fast: 0.2,
        normal: 0.3,
        slow: 0.5
      }
    },
    particles: {
      type: 'sunrise-rays' as const,
      color: '#FF6B35',
      amount: 30,
      speed: 1.5
    },
    customStyles: {
      borderRadius: '0.5rem'
    }
  },

  'night-owl': {
    name: 'Night Owl',
    emoji: '🦉',
    tagline: 'The world sleeps, I create. Midnight is my muse.',
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
      shadow: '0 10px 40px rgba(99, 102, 241, 0.4)',
      glow: 'rgba(99, 102, 241, 0.6)'
    },
    animations: {
      duration: {
        fast: 0.4,
        normal: 0.6,
        slow: 0.8
      }
    },
    particles: {
      type: 'stars-twinkling' as const,
      color: '#C084FC',
      amount: 50,
      speed: 0.5
    },
    customStyles: {
      borderRadius: '1rem'
    }
  },

  'steady-tortoise': {
    name: 'Steady Tortoise',
    emoji: '🐢',
    tagline: 'Slow and steady wins the race. Consistency over intensity.',
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
      shadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.4)'
    },
    animations: {
      duration: {
        fast: 0.5,
        normal: 0.7,
        slow: 1.0
      }
    },
    particles: {
      type: 'leaves-falling' as const,
      color: '#10B981',
      amount: 20,
      speed: 0.3
    },
    customStyles: {
      borderRadius: '1.5rem'
    }
  },

  'sprint-rabbit': {
    name: 'Sprint Rabbit',
    emoji: '🐰',
    tagline: 'Fast, intense bursts. I work hard, rest harder.',
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
      shadow: '0 10px 40px rgba(251, 191, 36, 0.4)',
      glow: 'rgba(251, 191, 36, 0.6)'
    },
    animations: {
      duration: {
        fast: 0.1,
        normal: 0.2,
        slow: 0.3
      }
    },
    particles: {
      type: 'energy-sparks' as const,
      color: '#FBBF24',
      amount: 40,
      speed: 2.0
    },
    customStyles: {
      borderRadius: '0.75rem'
    }
  },

  'balanced-lion': {
    name: 'Balanced Lion',
    emoji: '🦁',
    tagline: 'I rule my kingdom with strategy and rest.',
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
      shadow: '0 10px 40px rgba(245, 158, 11, 0.4)',
      glow: 'rgba(245, 158, 11, 0.5)'
    },
    animations: {
      duration: {
        fast: 0.3,
        normal: 0.4,
        slow: 0.6
      }
    },
    particles: {
      type: 'golden-dust' as const,
      color: '#F59E0B',
      amount: 35,
      speed: 1.0
    },
    customStyles: {
      borderRadius: '0.75rem'
    }
  },

  'lone-wolf': {
    name: 'Lone Wolf',
    emoji: '🐺',
    tagline: 'I chart my own path. No schedule owns me.',
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
      shadow: '0 10px 40px rgba(107, 114, 128, 0.3)',
      glow: 'rgba(107, 114, 128, 0.4)'
    },
    animations: {
      duration: {
        fast: 0.3,
        normal: 0.5,
        slow: 0.7
      }
    },
    particles: {
      type: 'mist-fog' as const,
      color: '#6B7280',
      amount: 25,
      speed: 0.4
    },
    customStyles: {
      borderRadius: '0.5rem'
    }
  },

  'busy-bee': {
    name: 'Busy Bee',
    emoji: '🐝',
    tagline: 'Always buzzing, always productive. Motion is my meditation.',
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
      shadow: '0 10px 40px rgba(251, 191, 36, 0.3)',
      glow: 'rgba(251, 191, 36, 0.5)'
    },
    animations: {
      duration: {
        fast: 0.15,
        normal: 0.25,
        slow: 0.4
      }
    },
    particles: {
      type: 'honeycomb-pattern' as const,
      color: '#FBBF24',
      amount: 45,
      speed: 1.8
    },
    customStyles: {
      borderRadius: '0.25rem'
    }
  },

  'clever-fox': {
    name: 'Clever Fox',
    emoji: '🦊',
    tagline: 'Work smarter, not harder. Efficiency is elegance.',
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
      shadow: '0 10px 40px rgba(236, 72, 153, 0.4)',
      glow: 'rgba(236, 72, 153, 0.6)'
    },
    animations: {
      duration: {
        fast: 0.25,
        normal: 0.35,
        slow: 0.5
      }
    },
    particles: {
      type: 'sparkles-clever' as const,
      color: '#EC4899',
      amount: 30,
      speed: 1.2
    },
    customStyles: {
      borderRadius: '1rem'
    }
  }
};

export type ArchetypeTheme = typeof archetypeThemes[keyof typeof archetypeThemes];
export type ArchetypeId = keyof typeof archetypeThemes;
