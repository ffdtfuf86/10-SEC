interface TimerDisplayProps {
  time: number;
}

export default function TimerDisplay({ time }: TimerDisplayProps) {
  const formattedTime = time.toFixed(2);

  
  return (
    <div className="text-center">
      <div 
        className="text-8xl md:text-9xl font-bold font-mono text-timer tabular-nums"
        data-testid="text-timer-display"
      >
        {formattedTime}
      </div>
    </div>
  );
}
