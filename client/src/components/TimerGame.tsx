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
  const [showWaitScreen, setShowWaitScreen] = useState(false);
  const [waitTimeLeft, setWaitTimeLeft] = useState(120);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showSlowTimerOption, setShowSlowTimerOption] = useState(false);
  const [hasSlowTimer, setHasSlowTimer] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const waitIntervalRef = useRef<number | null>(null);

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
      const increment = hasSlowTimer ? 0.0108 : 0.012;
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + increment);
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
  }, [isRunning, hasSlowTimer]);

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
    
    // First honk
    const oscillator1 = audioContext.createOscillator();
    const gainNode1 = audioContext.createGain();
    
    oscillator1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);
    
    oscillator1.frequency.value = 300;
    oscillator1.type = 'square';
    
    gainNode1.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator1.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.15);
    
    // Second honk
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    oscillator2.frequency.value = 300;
    oscillator2.type = 'square';
    
    gainNode2.gain.setValueAtTime(0.4, audioContext.currentTime + 0.2);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
    
    oscillator2.start(audioContext.currentTime + 0.2);
    oscillator2.stop(audioContext.currentTime + 0.35);
  };

  const handleStop = async () => {
    setIsRunning(false);
    setHasStopped(true);
    const finalTime = time;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    playStopSound();

    const perfect = finalTime === 10.00;
    setIsPerfect(perfect);

    if (!perfect) {
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      
      if (newWrongAttempts > 0 && newWrongAttempts % 10 === 0 && !hasSlowTimer) {
        setShowSlowTimerOption(true);
      }
    }

    if (hasSlowTimer) {
      setHasSlowTimer(false);
    }

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
    if (attempts > 0 && attempts % 2 === 0) {
      setShowWaitScreen(true);
      setWaitTimeLeft(120);
    } else {
      handleStart();
    }
  };

  const handleWatchAd = () => {
    setShowWaitScreen(false);
    handleStart();
  };

  const handleWatchAdsForSlowTimer = () => {
    setShowSlowTimerOption(false);
    setHasSlowTimer(true);
    handleStart();
  };

  const handleDeclineSlowTimer = () => {
    setShowSlowTimerOption(false);
    handleTryAgain();
  };

  const handleWait = () => {
    waitIntervalRef.current = window.setInterval(() => {
      setWaitTimeLeft((prev) => {
        if (prev <= 1) {
          if (waitIntervalRef.current) {
            clearInterval(waitIntervalRef.current);
            waitIntervalRef.current = null;
          }
          setShowWaitScreen(false);
          handleStart();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (waitIntervalRef.current) {
        clearInterval(waitIntervalRef.current);
      }
    };
  }, []);

  const topPlayer = leaderboardData?.topPlayer;

  if (showSlowTimerOption) {
    return (
      <div className="min-h-screen bg-black flex flex-col pt-32">
        {topPlayer && (
          <Top1Banner 
            playerName={topPlayer.name} 
            attempts={topPlayer.firstPerfectAttempt} 
            message="No one can beat me"
          />
        )}
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Special Offer!
            </h2>
            <p className="text-xl text-white/70">
              {wrongAttempts} wrong attempts
            </p>
            <p className="text-lg text-white/60">
              Watch 2 ads to slow the timer by 10% for your next attempt
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button
              onClick={handleWatchAdsForSlowTimer}
              className="h-16 text-lg bg-white text-black hover:bg-white/90"
            >
              Watch 2 Ads & Slow Timer
            </Button>
            
            <Button
              onClick={handleDeclineSlowTimer}
              variant="outline"
              className="h-16 text-lg bg-transparent border-2 border-white/20 text-white hover:bg-white/10"
            >
              No Thanks, Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showWaitScreen) {
    return (
      <div className="min-h-screen bg-black flex flex-col pt-32">
        {topPlayer && (
          <Top1Banner 
            playerName={topPlayer.name} 
            attempts={topPlayer.firstPerfectAttempt} 
            message="No one can beat me"
          />
        )}
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Take a Break!
            </h2>
            <p className="text-xl text-white/70">
              You've used 2 attempts
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button
              onClick={handleWatchAd}
              className="h-16 text-lg bg-white text-black hover:bg-white/90"
            >
              Watch Ad to Continue
            </Button>
            
            <Button
              onClick={handleWait}
              variant="outline"
              className="h-16 text-lg bg-transparent border-2 border-white/20 text-white hover:bg-white/10"
            >
              Wait {Math.floor(waitTimeLeft / 60)}:{(waitTimeLeft % 60).toString().padStart(2, '0')} to Restart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col pt-32">
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
