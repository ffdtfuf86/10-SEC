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
  message?: string;
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
  const [waitTimeLeft, setWaitTimeLeft] = useState(45);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showSlowTimerOption, setShowSlowTimerOption] = useState(false);
  const [hasSlowTimer, setHasSlowTimer] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const intervalRef = useRef<number | null>(null);
  const waitIntervalRef = useRef<number | null>(null);

  const { data: leaderboardData } = useQuery<LeaderboardData>({
    queryKey: ["/api/leaderboard"],
  });

  const attemptMutation = useMutation({
    mutationFn: async (data: { playerName: string; time: number; attempts: number; message?: string }) => {
      const res = await apiRequest("POST", "/api/attempt", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit attempt");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    },
  });

  useEffect(() => {
    if (isRunning) {
      const increment = hasSlowTimer ? 0.005 : 0.012;
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + increment;
          
          if (attempts < 7 && newTime >= 9.99 && newTime < 10.01) {
            return 10.012;
          }
          
          return newTime;
        });
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
  }, [isRunning, hasSlowTimer, attempts]);

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
    let finalTime = parseFloat(time.toFixed(2));
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    playStopSound();

    if (hasSlowTimer && finalTime >= 9.90 && finalTime <= 10.2) {
      if (finalTime < 10.00) {
        const distanceFrom10 = 10.00 - finalTime;
        const adjustment = distanceFrom10 * 0.7;
        finalTime = parseFloat((finalTime + adjustment).toFixed(2));
        if (finalTime >= 10.00) {
          finalTime = 9.99;
        }
      } else if (finalTime > 10.00) {
        const distanceFrom10 = finalTime - 10.00;
        const adjustment = distanceFrom10 * 0.7;
        finalTime = parseFloat((finalTime - adjustment).toFixed(2));
        if (finalTime <= 10.00) {
          finalTime = 10.01;
        }
      }
    }

    setTime(finalTime);

    const perfect = finalTime === 10.00;
    setIsPerfect(perfect);

    if (!perfect) {
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      
      if (newAttempts % 7 === 0) {
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
        if (result.isNewRecord) {
          setShowMessageInput(true);
        }
      } else {
        setRank(null);
      }
    } catch (error) {
      console.error("Error submitting attempt:", error);
    }
  };

  const handleTryAgain = () => {
    if (attempts > 0 && attempts % 5 === 0) {
      setShowWaitScreen(true);
      setWaitTimeLeft(45);
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

  const handleSubmitMessage = async () => {
    if (!customMessage.trim()) {
      setMessageError("Please enter a message");
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/update-message", {
        playerName,
        message: customMessage,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit message");
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      setShowMessageInput(false);
      setCustomMessage("");
      setMessageError("");
    } catch (error: any) {
      setMessageError(error.message || "Failed to submit message");
    }
  };

  const handleSkipMessage = () => {
    setShowMessageInput(false);
    setCustomMessage("");
    setMessageError("");
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
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRestartFromZero = () => {
    setAttempts(0);
    setWrongAttempts(0);
    setShowWaitScreen(false);
    handleStart();
  };

  useEffect(() => {
    return () => {
      if (waitIntervalRef.current) {
        clearInterval(waitIntervalRef.current);
      }
    };
  }, []);

  const topPlayer = leaderboardData?.topPlayer;

  if (showMessageInput) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
          <Top1Banner 
            playerName={topPlayer?.name || "App Founder"} 
            attempts={topPlayer?.firstPerfectAttempt || 31} 
            message={topPlayer?.message || "NO ONE CAN BEAT ME"}
          />
          
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              🎉 New Record! 🎉
            </h2>
            <p className="text-xl text-white/70">
              Write a message to show everyone!
            </p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="No one can beat me..."
              maxLength={100}
              className="w-full h-32 p-4 text-lg bg-black border-2 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 rounded-lg resize-none"
            />
            {messageError && (
              <p className="text-red-500 text-sm">{messageError}</p>
            )}
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSubmitMessage}
                className="h-14 text-lg bg-white text-black hover:bg-white/90"
              >
                Submit Message
              </Button>
              <Button
                onClick={handleSkipMessage}
                variant="outline"
                className="h-14 text-lg bg-transparent border-2 border-white/20 text-white hover:bg-white/10"
              >
                Skip
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSlowTimerOption) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
          <Top1Banner 
            playerName={topPlayer?.name || "App Founder"} 
            attempts={topPlayer?.firstPerfectAttempt || 31} 
            message={topPlayer?.message || "NO ONE CAN BEAT ME"}
          />
          
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Special Offer!
            </h2>
            <p className="text-lg text-white/60">
              Slow the timer by 20% for your next attempt
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button
              onClick={handleWatchAdsForSlowTimer}
              className="h-16 text-lg bg-white text-black hover:bg-white/90"
            >
              Slow Speed to 20%
            </Button>
            
            <Button
              onClick={handleDeclineSlowTimer}
              variant="outline"
              className="h-16 text-lg bg-transparent border-2 border-white/20 text-white hover:bg-white/10"
            >
              Leave
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showWaitScreen) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
          <Top1Banner 
            playerName={topPlayer?.name || "App Founder"} 
            attempts={topPlayer?.firstPerfectAttempt || 31} 
            message={topPlayer?.message || "NO ONE CAN BEAT ME"}
          />
          
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Take a Break!
            </h2>
            <p className="text-xl text-white/70">
              Choose how to continue
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button
              onClick={handleWatchAd}
              className="h-16 text-lg bg-white text-black hover:bg-white/90"
            >
              Watch 1 Ad & Continue
            </Button>
            
            <Button
              onClick={handleWait}
              variant="outline"
              className="h-16 text-lg bg-transparent border-2 border-white/20 text-white hover:bg-white/10"
            >
              Wait {waitTimeLeft}s to Continue
            </Button>
            
            <Button
              onClick={handleRestartFromZero}
              variant="outline"
              className="h-16 text-lg bg-transparent border-2 border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/60"
            >
              Restart from 0 Attempts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        <Top1Banner 
          playerName={topPlayer?.name || "App Founder"} 
          attempts={topPlayer?.firstPerfectAttempt || 31} 
          message={topPlayer?.message || "NO ONE CAN BEAT ME"}
        />
        
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
