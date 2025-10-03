import { useState, useEffect } from "react";

interface TimerDisplayProps {
  time: number;
  isSlowMode?: boolean;
}

export default function TimerDisplay({ time, isSlowMode = false }: TimerDisplayProps) {
  const [displayTime, setDisplayTime] = useState(time);

  useEffect(() => {
    if (isSlowMode) {
      const roundedTime = Math.floor(time * 5) / 5;
      setDisplayTime(roundedTime);
    } else {
      setDisplayTime(time);
    }
  }, [time, isSlowMode]);

  const formattedTime = displayTime.toFixed(2);

  
  return (
    <div className="text-center relative">
      {isSlowMode && (
        <div className="mb-4 inline-block">
          <div className="bg-green-500/20 border-2 border-green-500 text-green-400 px-6 py-2 rounded-full text-sm font-bold animate-pulse">
            🐢 SLOW MODE ACTIVE
          </div>
        </div>
      )}
      <div 
        className={`text-8xl md:text-9xl font-bold font-mono tabular-nums transition-all duration-300 ${
          isSlowMode 
            ? 'text-green-400 scale-110 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' 
            : 'text-timer'
        }`}
        data-testid="text-timer-display"
        style={isSlowMode ? {
          animation: 'pulse 2s ease-in-out infinite'
        } : {}}
      >
        {formattedTime}
      </div>
    </div>
  );
}
