interface RankDisplayProps {
  rank: number | null;
  isPerfect: boolean;
  attempts: number;
}

export default function RankDisplay({ rank, isPerfect, attempts }: RankDisplayProps) {
  if (rank === null) return null;

  
  return (
    <div className="text-center space-y-2">
      <p className="text-2xl md:text-3xl font-medium text-rank" data-testid="text-rank-display">
        {isPerfect ? `Perfect 10! ` : ''}Rank: #{rank}
      </p>
      <p className="text-lg text-white/60" data-testid="text-attempts-display">
        Attempts: {attempts}
      </p>
    </div>
  );
}
