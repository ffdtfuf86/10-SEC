import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NameInputProps {
  onSubmit: (name: string) => void;
}


export default function NameInput({ onSubmit }: NameInputProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Dark Timer
          </h1>
          <p className="text-xl text-white/70">
            Stop the timer at exactly <span className="text-timer font-bold">10.00</span> seconds
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 text-lg bg-black border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
              data-testid="input-name"
              maxLength={30}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full h-14 text-lg bg-white text-black hover:bg-white/90 disabled:opacity-50"
            data-testid="button-submit-name"
          >
            Start Challenge
          </Button>
        </form>
      </div>
    </div>
  );
}
