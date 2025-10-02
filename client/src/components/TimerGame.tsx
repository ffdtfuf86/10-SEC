import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Top1Banner from "./Top1Banner";
import TimerDisplay from "./TimerDisplay";
import RankDisplay from "./RankDisplay";

interface TimerGameProps {
  playerName: string;
}

interface TopPlayer {
  id: string;
  name: string;
  firstPerfectAttempt: number;
}

interface LeaderboardData {
  topPlayer: TopPlayer | null;
  players: TopPlayer[];
}

export default function TimerGame({ playerName }: TimerGameProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [isPerfect, setIsPerfect] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const { data: leaderboardData } = useQuery<LeaderboardData>({
    queryKey: ["/api/leaderboard"],
  });

  const attemptMutation = useMutation({
    mutationFn: async (data: { playerName: string; time: number; attempts: number }) => {
      const res = await apiRequest("POST", "/api/attempt", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    },
  });

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

  const playStopSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleStop = async () => {
    setIsRunning(false);
    setHasStopped(true);
    const finalTime = time;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    playStopSound();

    const perfect = finalTime >= 9.995 && finalTime <= 10.005;
    setIsPerfect(perfect);

    try {
      const result = await attemptMutation.mutateAsync({
        playerName,
        time: finalTime,
        attempts: newAttempts,
      });

      if (result.isPerfect && result.rank) {
        setRank(result.rank);
      } else {
        setRank(null);
      }
    } catch (error) {
      console.error("Error submitting attempt:", error);
    }
  };

  const handleTryAgain = () => {
    handleStart();
  };

  const topPlayer = leaderboardData?.topPlayer;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {topPlayer && (
        <Top1Banner 
          playerName={topPlayer.name} 
          attempts={topPlayer.firstPerfectAttempt} 
          message="No one can beat me"
        />
      )}
      
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
              {isPerfect ? (
                <RankDisplay rank={rank} isPerfect={isPerfect} attempts={attempts} />
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-2xl md:text-3xl font-medium text-white/60" data-testid="text-miss">
                    Missed! Try again
                  </p>
                  <p className="text-lg text-white/40" data-testid="text-time-result">
                    You stopped at {time.toFixed(2)}s
                  </p>
                  <p className="text-lg text-white/60" data-testid="text-attempts-display">
                    Attempts: {attempts}
                  </p>
                </div>
              )}
              
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
