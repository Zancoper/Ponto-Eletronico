
import React from 'react';

interface TimerDisplayProps {
  elapsedMs: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ elapsedMs }) => {
  const seconds = Math.floor((elapsedMs / 1000) % 60);
  const minutes = Math.floor((elapsedMs / (1000 * 60)) % 60);
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div className="text-6xl md:text-8xl font-mono font-bold tracking-tighter text-slate-800 tabular-nums">
        {pad(hours)}<span className="animate-pulse">:</span>{pad(minutes)}<span className="animate-pulse">:</span>{pad(seconds)}
      </div>
      <p className="text-slate-400 font-medium uppercase tracking-widest text-sm mt-2">Active Session</p>
    </div>
  );
};

export default TimerDisplay;
