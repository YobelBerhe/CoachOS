import { useEffect, useState } from "react";

interface FastingCircularProgressProps {
  totalMinutes: number;
  elapsedMinutes: number;
  isFasting: boolean;
}

export const FastingCircularProgress = ({ 
  totalMinutes, 
  elapsedMinutes, 
  isFasting 
}: FastingCircularProgressProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((elapsedMinutes / totalMinutes) * 100);
  }, [elapsedMinutes, totalMinutes]);

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const remainingMinutes = isFasting 
    ? totalMinutes - elapsedMinutes
    : elapsedMinutes;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="320" height="320" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="20"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke={isFasting ? "hsl(var(--primary))" : "hsl(var(--success))"}
          strokeWidth="20"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-6xl font-bold mb-2">
          {formatTime(remainingMinutes)}
        </p>
        <p className="text-sm text-muted-foreground">
          {isFasting ? "until eating window" : "until fasting"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {progress.toFixed(0)}% complete
        </p>
      </div>
    </div>
  );
};
