interface FastingTimelineProps {
  eatingWindowStart: string;
  eatingWindowEnd: string;
}

export const FastingTimeline = ({ eatingWindowStart, eatingWindowEnd }: FastingTimelineProps) => {
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  };

  const startHour = parseTime(eatingWindowStart);
  const endHour = parseTime(eatingWindowEnd);
  const currentHour = new Date().getHours() + new Date().getMinutes() / 60;

  const getPosition = (hour: number) => {
    return (hour / 24) * 100;
  };

  const eatingWindowWidth = endHour > startHour 
    ? endHour - startHour 
    : (24 - startHour) + endHour;

  const eatingWindowLeft = getPosition(startHour);
  const eatingWindowWidthPercent = (eatingWindowWidth / 24) * 100;

  return (
    <div className="space-y-2">
      <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
        {/* Fasting zones */}
        <div className="absolute inset-0 bg-primary/20" />
        
        {/* Eating window */}
        <div 
          className="absolute top-0 bottom-0 bg-success/40"
          style={{
            left: `${eatingWindowLeft}%`,
            width: `${eatingWindowWidthPercent}%`
          }}
        />

        {/* Current time marker */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-foreground z-10"
          style={{ left: `${getPosition(currentHour)}%` }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
        </div>

        {/* Hour markers */}
        {[0, 6, 12, 18].map(hour => (
          <div
            key={hour}
            className="absolute top-0 bottom-0 w-px bg-border"
            style={{ left: `${getPosition(hour)}%` }}
          />
        ))}
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>12am</span>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm pt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/20 rounded" />
          <span className="text-muted-foreground">Fasting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success/40 rounded" />
          <span className="text-muted-foreground">Eating Window</span>
        </div>
      </div>
    </div>
  );
};
