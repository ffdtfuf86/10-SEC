import TimerGame from '../TimerGame';

export default function TimerGameExample() {
  return (
    <TimerGame 
      playerName="Demo Player" 
      onAttempt={(time) => console.log('Attempt recorded:', time)}
    />
  );
}
