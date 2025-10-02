import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Top1Banner from "./Top1Banner";
import TimerDisplay from "./TimerDisplay";
import RankDisplay from "./RankDisplay";

interface TimerGameProps {
  playerName: string;
  onAttempt?: (time: number) => void;
}


export default function TimerGame({ playerName, onAttempt }: TimerGameProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [isPerfect, setIsPerfect] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + 0.01);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setTime(0);
    setIsRunning(true);
    setHasStarted(true);
    setHasStopped(false);
    setRank(null);
    setIsPerfect(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setHasStopped(true);
    const finalTime = time;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const perfect = Math.abs(finalTime - 10.0) <= 0.05;
    setIsPerfect(perfect);
    
    const mockRank = Math.floor(Math.random() * 20) + 1;
    setRank(mockRank);

    if (onAttempt) {
      onAttempt(finalTime);
    }

    console.log(`Attempt ${newAttempts}: ${finalTime.toFixed(2)}s - ${perfect ? 'Perfect!' : 'Try again'}`);
  };

  const handleTryAgain = () => {
    handleStart();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Top1Banner 
        playerName="App Founder" 
        attempts={9} 
        message="No one can beat me"
      />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-12">
        <TimerDisplay time={time} />
        
        <div className="flex flex-col items-center space-y-8">
          {!hasStarted && (
            <Button
              onClick={handleStart}
              className="h-16 px-12 text-xl bg-white text-black hover:bg-white/90"
              data-testid="button-start"
            >
              Start
            </Button>
          )}
          
          {hasStarted && isRunning && (
            <button
              onClick={handleStop}
              className="w-32 h-32 rounded-full bg-timer hover:opacity-90 transition-opacity"
              data-testid="button-stop"
              aria-label="Stop timer"
            />
          )}
          
          {hasStopped && (
            <div className="space-y-6 flex flex-col items-center">
              <RankDisplay rank={rank} isPerfect={isPerfect} attempts={attempts} />
              
              <Button
                onClick={handleTryAgain}
                className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90"
                data-testid="button-try-again"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
        
        {attempts > 0 && !hasStopped && (
          <p className="text-white/40 text-sm" data-testid="text-current-attempts">
            Total attempts: {attempts}
          </p>
        )}
      </div>
    </div>
  );
}
