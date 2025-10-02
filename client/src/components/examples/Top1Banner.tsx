import Top1Banner from '../Top1Banner';

export default function Top1BannerExample() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <Top1Banner 
        playerName="Lightning Fast" 
        attempts={7} 
        message="No one can beat my record"
      />
    </div>
  );
}
