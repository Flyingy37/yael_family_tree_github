import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, Coins } from 'lucide-react';

export const CurrencyConverter: React.FC = () => {
  const [eurRate, setEurRate] = useState<number>(3.95); // Fallback default
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');
  const [isEurToIls, setIsEurToIls] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchRate = async () => {
    setLoading(true);
    try {
      // Free API for exchange rates
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      const data = await res.json();
      if (data && data.rates && data.rates.ILS) {
        setEurRate(data.rates.ILS);
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}));
      }
    } catch (e) {
      console.error("Failed to fetch rate", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  const handleAmountChange = (val: string) => {
    // allow only numbers and one dot
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  const calculateResult = () => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    
    if (isEurToIls) {
      return (num * eurRate).toFixed(2);
    } else {
      return (num / eurRate).toFixed(2);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] rounded-2xl p-5 shadow-xl border-2 border-amber-400/50 text-white relative overflow-hidden group">
      
      {/* Golden Shine Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-amber-400/10 to-transparent skew-x-12 translate-x-[-150%] animate-[shine_3s_infinite]"></div>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500">
        <Coins size={80} strokeWidth={1} />
      </div>

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
           <h3 className="font-royal text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-black tracking-wide drop-shadow-sm">מחשבון שופינג מלכותי</h3>
           <p className="text-xs text-blue-200 mt-1 flex items-center gap-1.5 font-medium">
             {!loading && <RefreshCw size={10} className="cursor-pointer hover:rotate-180 transition-transform" onClick={fetchRate}/>}
             {loading ? 'מתעדכן...' : `שער יציג: 1€ = ₪${eurRate.toFixed(2)}`}
           </p>
        </div>
        <button 
            onClick={() => setIsEurToIls(!isEurToIls)}
            className="bg-white/10 p-2.5 rounded-full hover:bg-amber-400/20 transition-all backdrop-blur-sm border border-amber-400/30 text-amber-300 shadow-lg"
        >
            <ArrowRightLeft size={18} className={`transition-transform duration-500 ${isEurToIls ? '' : 'rotate-180'}`} />
        </button>
      </div>

      <div className="flex items-center gap-4 relative z-10">
         {/* Input Side */}
         <div className="flex-1">
            <label className="block text-[10px] text-blue-200 mb-1.5 font-bold tracking-wider uppercase text-center">
                {isEurToIls ? 'EURO (€)' : 'SHEKEL (₪)'}
            </label>
            <input 
                type="text" 
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-black/30 border border-blue-500/30 rounded-xl px-2 py-3 text-2xl font-bold text-white focus:outline-none focus:border-amber-400 transition-all text-center font-mono shadow-inner"
            />
         </div>

         <div className="flex items-end pb-4">
             <span className="text-amber-400 text-2xl font-black filter drop-shadow">=</span>
         </div>

         {/* Result Side */}
         <div className="flex-1">
            <label className="block text-[10px] text-blue-200 mb-1.5 font-bold tracking-wider uppercase text-center">
                {isEurToIls ? 'SHEKEL (₪)' : 'EURO (€)'}
            </label>
            <div className="w-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 rounded-xl px-2 py-3 text-2xl font-bold text-blue-950 font-mono text-center shadow-lg transform scale-105">
                {calculateResult()}
            </div>
         </div>
      </div>
      
      <style>{`
        @keyframes shine {
            0% { transform: translateX(-150%) skewX(-12deg); }
            50%, 100% { transform: translateX(150%) skewX(-12deg); }
        }
      `}</style>

    </div>
  );
};