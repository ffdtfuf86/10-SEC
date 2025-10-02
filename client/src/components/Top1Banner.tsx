interface Top1BannerProps {
  playerName: string;
  attempts: number;
  message?: string;
}

export default function Top1Banner({ playerName, attempts, message = "No one can beat my record" }: Top1BannerProps) {

  return (
    <div className="w-full py-6 px-4 text-center">
      <p className="text-xl md:text-2xl font-semibold text-gold" data-testid="text-top1-banner">
        {playerName} did it in {attempts} attempt{attempts !== 1 ? 's' : ''} — "{message}"
      </p>
    </div>
  );
}
