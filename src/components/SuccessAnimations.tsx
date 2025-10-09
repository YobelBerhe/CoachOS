import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Sparkles, Trophy, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SuccessAnimationProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'achievement' | 'streak' | 'celebration';
}

export function SuccessAnimation({ 
  show, 
  onClose, 
  title, 
  message,
  type = 'success'
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      triggerConfetti(type);
    }
  }, [show, type]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!visible) return null;

  const icons = {
    success: CheckCircle,
    achievement: Trophy,
    streak: Flame,
    celebration: Sparkles
  };

  const Icon = icons[type];

  const colors = {
    success: 'from-green-500 to-emerald-500',
    achievement: 'from-yellow-500 to-orange-500',
    streak: 'from-orange-500 to-red-500',
    celebration: 'from-purple-500 to-pink-500'
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`max-w-md w-full transform transition-all duration-500 ${show ? 'scale-100 rotate-0' : 'scale-0 rotate-12'}`}>
        <CardContent className="p-8 text-center">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className={`w-24 h-24 bg-gradient-to-br ${colors[type]} rounded-full flex items-center justify-center mx-auto animate-bounce`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20 rounded-full blur-xl animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-2 animate-fade-in">
            {title}
          </h2>

          {/* Message */}
          <p className="text-muted-foreground mb-6 animate-fade-in animation-delay-150">
            {message}
          </p>

          {/* Close Button */}
          <Button
            onClick={handleClose}
            className={`w-full bg-gradient-to-r ${colors[type]}`}
            size="lg"
          >
            Awesome!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Confetti effects
function triggerConfetti(type: string) {
  const count = 150;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  if (type === 'achievement' || type === 'celebration') {
    // Epic confetti burst
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } else if (type === 'streak') {
    // Fire burst from bottom
    confetti({
      particleCount: 100,
      angle: 90,
      spread: 45,
      origin: { x: 0.5, y: 1 },
      colors: ['#ff6b35', '#f7931e', '#fdc830'],
      zIndex: 9999
    });
  } else {
    // Simple confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999
    });
  }
}

// Pre-made success components
export function GoalCompletedAnimation({ show, onClose }: { show: boolean; onClose: () => void }) {
  return (
    <SuccessAnimation
      show={show}
      onClose={onClose}
      title="🎉 Goal Completed!"
      message="Congratulations! You've crushed your goal. Keep up the amazing work!"
      type="achievement"
    />
  );
}

export function StreakMilestoneAnimation({ 
  show, 
  onClose, 
  days 
}: { 
  show: boolean; 
  onClose: () => void;
  days: number;
}) {
  return (
    <SuccessAnimation
      show={show}
      onClose={onClose}
      title={`🔥 ${days} Day Streak!`}
      message="You're on fire! Your consistency is inspiring. Don't break the chain!"
      type="streak"
    />
  );
}

export function RecipeCreatedAnimation({ show, onClose }: { show: boolean; onClose: () => void }) {
  return (
    <SuccessAnimation
      show={show}
      onClose={onClose}
      title="✨ Recipe Published!"
      message="Your recipe is now live! Start earning from recipe sales."
      type="celebration"
    />
  );
}

export function WorkoutCompletedAnimation({ show, onClose }: { show: boolean; onClose: () => void }) {
  return (
    <SuccessAnimation
      show={show}
      onClose={onClose}
      title="💪 Workout Complete!"
      message="Great job! You're one step closer to your fitness goals."
      type="success"
    />
  );
}
