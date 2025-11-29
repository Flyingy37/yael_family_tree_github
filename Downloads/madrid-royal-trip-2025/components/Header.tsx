import React, { useState, useEffect } from 'react';
import { Plane, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Target date: Dec 4, 2025 at 06:15
    const targetDate = new Date('2025-12-04T06:15:00').getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            setTimeLeft("¡Hola Madrid!");
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        setTimeLeft(`${days} ימים, ${hours} שעות`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] text-white shadow-xl border-b border-amber-500/40 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      <div className="max-w-4xl mx-auto px-5 py-6 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-4xl font-black font-royal leading-none tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pb-1">
            MADRID 2025
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-12 h-[2px] bg-gradient-to-r from-amber-200 to-transparent"></div>
            <p className="text-[10px] text-amber-100 uppercase tracking-[0.25em] font-semibold font-sans drop-shadow-md">
              The Royal Trip
            </p>
          </div>
          
          {/* Countdown Timer */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-200 font-mono bg-blue-900/40 w-fit px-2 py-0.5 rounded border border-blue-800/50">
             <Clock size={10} className="text-amber-400" />
             <span className="opacity-80">המראה בעוד:</span>
             <span className="text-amber-200 font-bold">{timeLeft}</span>
          </div>
        </div>
        
        {/* Logo/Icon */}
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-amber-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] p-3 rounded-full border border-amber-400/50 shadow-inner">
                 <Plane className="w-6 h-6 text-amber-400 transform rotate-[-45deg]" fill="currentColor" />
            </div>
        </div>
      </div>
    </header>
  );
};