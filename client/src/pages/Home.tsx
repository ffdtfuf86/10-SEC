import { useState } from "react";
import NameInput from "@/components/NameInput";
import TimerGame from "@/components/TimerGame";

export default function Home() {
  const [playerName, setPlayerName] = useState<string | null>(null);

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
  };

  if (!playerName) {
    return <NameInput onSubmit={handleNameSubmit} />;
  }

  return <TimerGame playerName={playerName} />;
}
