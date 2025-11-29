

import React from 'react';
import { Hotel, Ticket, Users, FileText, ExternalLink, MapPin, Globe, Copy, CheckCircle2, Trophy, Map as MapIcon } from 'lucide-react';
import { HOTEL_NAME, TRAVELERS, DRIVE_LINK, FLIGHT_CODE, HOTEL_CONFIRMATION, HOTEL_PIN, TOTAL_PRICE_ESTIMATE, GAME_TICKET } from '../constants';
import { CurrencyConverter } from './CurrencyConverter';

export const TripInfo: React.FC = () => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4 space-y-6 pb-28 max-w-3xl mx-auto">
      
      {/* Currency Converter Widget */}
      <CurrencyConverter />

      {/* Hotel Card */}
      <div className="bg-[#1e293b] rounded-2xl p-0 shadow-lg shadow-black/40 border border-white/5 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div>
        <div className="bg-[#0f172a] p-5 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="bg-amber-400/10 p-2.5 rounded-xl text-amber-300 border border-amber-400/20">
                    <Hotel size={22} />
                </div>
                <div>
                    <h3 className="font-royal font-black text-white text-xl tracking-wide">Catalonia Gran Vía</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">4-8 בדצמבר • 4 לילות</p>
                </div>
             </div>
        </div>
        
        <div className="p-6 space-y-5">
            {/* Booking Codes */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 relative hover:border-amber-500/50 transition-colors cursor-pointer" onClick={() => copyToClipboard(HOTEL_CONFIRMATION, 'conf')}>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">אישור הזמנה</span>
                    <span className="font-mono font-bold text-slate-100 text-base block truncate">{HOTEL_CONFIRMATION}</span>
                    <div className="absolute top-3 right-3 text-slate-500">
                        {copied === 'conf' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </div>
                </div>
                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 relative hover:border-amber-500/50 transition-colors cursor-pointer" onClick={() => copyToClipboard(HOTEL_PIN, 'pin')}>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">קוד PIN</span>
                    <span className="font-mono font-bold text-slate-100 text-base block">{HOTEL_PIN}</span>
                    <div className="absolute top-3 right-3 text-slate-500">
                         {copied === 'pin' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-700 pt-4">
                <span className="text-slate-400 font-medium">עלות משוערת:</span>
                <span className="font-royal font-bold text-white text-xl">{TOTAL_PRICE_ESTIMATE}</span>
            </div>

            <div className="flex gap-3 pt-1">
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL_NAME + " Madrid")}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl text-center text-sm hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 border border-blue-800"
                >
                    <MapPin size={16} className="text-amber-400" />
                    <span>ניווט למלון</span>
                </a>
                <a 
                    href="https://www.cataloniahotels.com/es/hotel/catalonia-gran-via-madrid?mb=1?utm_source=googlemaps&utm_medium=organic&utm_campaign=GAU" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 py-3 bg-slate-800 text-slate-200 border-2 border-slate-700 font-bold rounded-xl text-center text-sm hover:border-amber-500/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <Globe size={16} />
                    <span>אתר המלון</span>
                </a>
            </div>
        </div>
      </div>

       {/* Game Ticket Card */}
       <div className="bg-[#1e293b] rounded-2xl p-0 shadow-lg shadow-black/40 border border-white/5 overflow-hidden relative mt-4">
        <div className="bg-[#064e3b] p-5 flex items-center justify-between relative z-10 overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
             
             <div className="flex items-center gap-4 relative z-10">
                <div className="bg-emerald-400/20 p-2.5 rounded-xl text-emerald-300 border border-emerald-400/30">
                    <Trophy size={22} />
                </div>
                <div>
                    <h3 className="font-royal font-black text-white text-xl tracking-wide">Real Madrid CF vs RC Celta de Vigo</h3>
                    <p className="text-xs text-emerald-200 mt-0.5 font-medium">Santiago Bernabéu • 07.12</p>
                </div>
             </div>
        </div>
        
        <div className="p-6 space-y-4 relative z-10 bg-[#022c22]">
            <div className="flex items-start justify-between bg-emerald-950/50 p-4 rounded-xl border border-emerald-900/50">
                <div>
                     <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold block mb-1">Order Number</span>
                     <span className="font-mono font-bold text-emerald-100 text-xl tracking-wide">{GAME_TICKET.orderNumber}</span>
                </div>
                <div className="text-left">
                     <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold block mb-1">Price</span>
                     <span className="font-mono font-bold text-emerald-200 text-lg">{GAME_TICKET.price}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl text-center shadow-sm">
                    <span className="text-[10px] text-emerald-500 block uppercase font-bold tracking-wider">Section</span>
                    <span className="font-black text-white text-xl leading-none mt-1">619</span>
                    <span className="text-[9px] text-emerald-400 block leading-none mt-1">Cat 3</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl text-center shadow-sm">
                    <span className="text-[10px] text-emerald-500 block uppercase font-bold tracking-wider">Row</span>
                    <span className="font-black text-white text-xl leading-none mt-1">{GAME_TICKET.row}</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl text-center shadow-sm">
                    <span className="text-[10px] text-emerald-500 block uppercase font-bold tracking-wider">Seats</span>
                    <span className="font-black text-white text-xl leading-none mt-1">{GAME_TICKET.seats}</span>
                </div>
            </div>
            
            <div className="text-[10px] text-emerald-400/80 text-center font-medium bg-emerald-950/40 py-2 rounded-lg border border-emerald-900/30">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Tickets available in app from Sun, 07 Dec 2025
            </div>
        </div>
      </div>

      {/* Embedded Map Card */}
      <div className="bg-[#1e293b] rounded-2xl p-0 shadow-lg border border-white/5 overflow-hidden">
        <div className="bg-amber-950/30 p-4 border-b border-amber-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-100">
                <MapIcon size={20} className="text-amber-500" />
                <h3 className="font-royal font-bold text-lg">המפה המלכותית</h3>
            </div>
             <a 
                href="https://www.google.com/maps/d/u/0/viewer?mid=1RFlpSX-2UIzuNtetLqV9dBkBX6X5Ys0&ehbc=2E312F"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] bg-amber-900/40 px-3 py-1.5 rounded-lg border border-amber-700/50 text-amber-200 font-bold hover:bg-amber-800/50 flex items-center gap-1.5 shadow-sm transition-colors"
            >
                <ExternalLink size={12} />
                פתח מסך מלא
            </a>
        </div>
        <div className="aspect-video w-full bg-slate-800 relative">
            <iframe 
                src="https://www.google.com/maps/d/u/0/embed?mid=1RFlpSX-2UIzuNtetLqV9dBkBX6X5Ys0&ehbc=2E312F" 
                width="100%" 
                height="100%" 
                style={{border: 0, position: 'absolute', top: 0, left: 0}}
                loading="lazy"
                title="Madrid Trip Map"
                className="opacity-90 hover:opacity-100 transition-opacity"
            ></iframe>
        </div>
      </div>

      {/* Flights Card */}
      <div className="bg-[#1e293b] rounded-2xl p-0 shadow-lg border border-white/5 overflow-hidden">
        <div className="bg-[#172554] p-5 flex items-center justify-between bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
             <div className="flex items-center gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl text-sky-200 border border-white/10">
                    <Ticket size={22} />
                </div>
                <div>
                    <h3 className="font-royal font-black text-white text-xl tracking-wide">טיסות אל-על</h3>
                    <div className="flex items-center gap-2 text-xs text-sky-200 font-mono mt-0.5 bg-black/20 px-2 py-0.5 rounded-md inline-flex border border-white/5">
                        <span className="opacity-70">PNR:</span>
                        <span className="font-bold">{FLIGHT_CODE}</span>
                        <Copy size={12} className="cursor-pointer hover:text-white" onClick={() => copyToClipboard(FLIGHT_CODE, 'pnr')} />
                        {copied === 'pnr' && <CheckCircle2 size={12} className="text-emerald-400" />}
                    </div>
                </div>
             </div>
        </div>

        <div className="p-6 flex flex-col gap-8 bg-[#1e293b]">
            {/* Outbound */}
            <div className="flex justify-between items-center relative">
                 <div className="text-center w-16">
                     <span className="block text-2xl font-black text-white font-mono">06:15</span>
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">TLV T3</span>
                 </div>
                 
                 <div className="flex-1 flex flex-col items-center px-4 relative top-1">
                     <span className="text-[10px] font-bold text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded-full mb-2 border border-blue-800">LY395</span>
                     <div className="w-full h-0.5 bg-slate-700 relative rounded-full">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#1e293b]"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#1e293b]"></div>
                        <PlaneIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 rotate-180 bg-[#1e293b] px-0.5" />
                     </div>
                     <span className="text-[10px] text-slate-500 mt-2 font-medium">05:30 שעות</span>
                 </div>

                 <div className="text-center w-16">
                     <span className="block text-2xl font-black text-white font-mono">10:45</span>
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">MAD T4S</span>
                 </div>
            </div>

            {/* Inbound */}
            <div className="flex justify-between items-center relative">
                 <div className="text-center w-16">
                     <span className="block text-2xl font-black text-white font-mono">13:15</span>
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">MAD T4S</span>
                 </div>
                 
                 <div className="flex-1 flex flex-col items-center px-4 relative top-1">
                     <span className="text-[10px] font-bold text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded-full mb-2 border border-blue-800">LY396</span>
                     <div className="w-full h-0.5 bg-slate-700 relative rounded-full">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#1e293b]"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#1e293b]"></div>
                        <PlaneIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 rotate-0 bg-[#1e293b] px-0.5" />
                     </div>
                     <span className="text-[10px] text-slate-500 mt-2 font-medium">04:40 שעות</span>
                 </div>

                 <div className="text-center w-16">
                     <span className="block text-2xl font-black text-white font-mono">18:55</span>
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">TLV T3</span>
                 </div>
            </div>
        </div>
      </div>

      {/* Travelers */}
      <div className="bg-[#1e293b] rounded-2xl p-6 shadow-lg border border-white/5">
         <div className="flex items-center gap-3 mb-5 border-b border-slate-700 pb-4">
            <div className="bg-slate-700 p-2 rounded-lg text-slate-300">
                <Users size={20} />
            </div>
            <h3 className="font-royal font-bold text-slate-100 text-xl">הנוסעים</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TRAVELERS.map((p, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center gap-2 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-full bg-slate-700 text-3xl flex items-center justify-center shadow-md border-2 border-slate-600">
                        {p.icon || p.name.charAt(0)}
                    </div>
                    <span className="font-royal font-bold text-slate-200 text-base">{p.name}</span>
                </div>
            ))}
        </div>
      </div>

       {/* Links */}
       <div className="bg-[#1e293b] rounded-2xl p-6 shadow-lg border border-white/5">
         <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-900/20 p-2 rounded-lg text-amber-500">
                <FileText size={20} />
            </div>
            <h3 className="font-royal font-bold text-slate-100 text-xl">מסמכים</h3>
        </div>
        <div className="space-y-3">
            <a 
                href={DRIVE_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-slate-800 rounded-xl hover:bg-slate-700 hover:text-amber-300 hover:border-amber-500/30 border border-slate-700 transition-all group shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center border border-slate-600 text-amber-500">
                        <Globe size={16} />
                    </div>
                    <span className="font-bold text-slate-200 group-hover:text-amber-300">תיקייה ב-Google Drive</span>
                </div>
                <ExternalLink size={16} className="text-slate-500 group-hover:text-amber-500" />
            </a>
        </div>
      </div>

    </div>
  );
};

const PlaneIcon = ({className}: {className?: string}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
)