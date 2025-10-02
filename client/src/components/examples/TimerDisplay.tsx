import TimerDisplay from '../TimerDisplay';

export default function TimerDisplayExample() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <TimerDisplay time={10.00} />
    </div>
  );
}
