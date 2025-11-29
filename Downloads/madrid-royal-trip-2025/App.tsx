import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Itinerary } from './components/Itinerary';
import { TripInfo } from './components/TripInfo';
import { GeminiChat } from './components/GeminiChat';
import { TripMap } from './components/TripMap';
import { CalendarDays, Info, Sparkles, Map } from 'lucide-react';

enum Tab {
  ITINERARY = 'itinerary',
  MAP = 'map',
  INFO = 'info',
  ASSISTANT = 'assistant'
}

function App() {
  // Initialize from localStorage or default to ITINERARY
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const saved = localStorage.getItem('royal_active_tab');
    return (saved as Tab) || Tab.ITINERARY;
  });

  // Save to localStorage whenever tab changes
  useEffect(() => {
    localStorage.setItem('royal_active_tab', activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#172554] to-[#0f172a] font-sans text-slate-100 pb-20">
      <Header />

      <main>
        {activeTab === Tab.ITINERARY && <Itinerary />}
        {activeTab === Tab.MAP && <TripMap />}
        {activeTab === Tab.INFO && <TripInfo />}
        {activeTab === Tab.ASSISTANT && <GeminiChat />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md border-t border-amber-500/30 px-2 py-2 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
        <div className="flex justify-around items-end max-w-4xl mx-auto relative">
          
          <button 
            onClick={() => setActiveTab(Tab.ITINERARY)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 group ${
              activeTab === Tab.ITINERARY ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays size={22} strokeWidth={activeTab === Tab.ITINERARY ? 2.5 : 2} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">לו״ז</span>
          </button>

          <button 
            onClick={() => setActiveTab(Tab.MAP)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 group ${
              activeTab === Tab.MAP ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map size={22} strokeWidth={activeTab === Tab.MAP ? 2.5 : 2} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">מפה</span>
          </button>

          {/* Assistant Button (Floating in center-ish) */}
          <div className="relative -top-6">
            <button 
                onClick={() => setActiveTab(Tab.ASSISTANT)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-[#0f172a] transition-all ${
                activeTab === Tab.ASSISTANT 
                    ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-blue-900 transform scale-110 shadow-amber-400/50' 
                    : 'bg-blue-800 text-amber-400 hover:bg-blue-700'
                }`}
            >
                <Sparkles size={24} strokeWidth={2.5} fill={activeTab === Tab.ASSISTANT ? "currentColor" : "none"} />
            </button>
          </div>

          <button 
            onClick={() => setActiveTab(Tab.INFO)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all w-16 group ${
              activeTab === Tab.INFO ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info size={22} strokeWidth={activeTab === Tab.INFO ? 2.5 : 2} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">מידע</span>
          </button>

        </div>
      </nav>
    </div>
  );
}

export default App;