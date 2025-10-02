import RankDisplay from '../RankDisplay';

export default function RankDisplayExample() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <RankDisplay rank={3} isPerfect={true} attempts={12} />
    </div>
  );
}
