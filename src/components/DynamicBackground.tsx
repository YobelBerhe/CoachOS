import { useArchetypeTheme } from '@/contexts/ArchetypeThemeContext';
import { motion } from 'framer-motion';

export default function DynamicBackground() {
  const { currentTheme } = useArchetypeTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.background.from}, ${currentTheme.colors.background.via}, ${currentTheme.colors.background.to})`
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Particles/Effects based on archetype */}
      {currentTheme.particles.type === 'stars-twinkling' && <StarField />}
      {currentTheme.particles.type === 'sunrise-rays' && <SunriseRays color={currentTheme.particles.color} />}
      {currentTheme.particles.type === 'leaves-falling' && <FallingLeaves />}
      {currentTheme.particles.type === 'energy-sparks' && <EnergySparks color={currentTheme.particles.color} />}
      {currentTheme.particles.type === 'golden-dust' && <GoldenDust color={currentTheme.particles.color} />}
      {currentTheme.particles.type === 'mist-fog' && <MistFog color={currentTheme.particles.color} />}
      {currentTheme.particles.type === 'honeycomb-pattern' && <HoneycombPattern color={currentTheme.particles.color} />}
      {currentTheme.particles.type === 'sparkles-clever' && <SparklesClever color={currentTheme.particles.color} />}

      {/* Animated Orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: currentTheme.colors.primary }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: currentTheme.colors.secondary }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />
      </div>
    </div>
  );
}

// Particle Components
function StarField() {
  return (
    <div className="absolute inset-0">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}

function SunriseRays({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-full origin-bottom"
          style={{
            background: `linear-gradient(to top, ${color}1A, transparent)`,
            transform: `rotate(${i * 30 - 180}deg)`
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

function FallingLeaves() {
  return (
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10%`
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.sin(i) * 100, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear'
          }}
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
}

function EnergySparks({ color }: { color: string }) {
  return (
    <div className="absolute inset-0">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}

function GoldenDust({ color }: { color: string }) {
  return (
    <div className="absolute inset-0">
      {[...Array(35)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        />
      ))}
    </div>
  );
}

function MistFog({ color }: { color: string }) {
  return (
    <div className="absolute inset-0">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `${color}10`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            x: [0, 100, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            delay: i * 4
          }}
        />
      ))}
    </div>
  );
}

function HoneycombPattern({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 opacity-10">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse">
            <polygon points="25,0 50,14.43 50,43.3 25,57.74 0,43.3 0,14.43" fill="none" stroke={color} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}

function SparklesClever({ color }: { color: string }) {
  return (
    <div className="absolute inset-0">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: '1rem',
            color: color
          }}
          animate={{
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}
