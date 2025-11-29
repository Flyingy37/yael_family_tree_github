import React, { useState } from 'react';
import { ITINERARY } from '../constants';
import { EventType, TripEvent } from '../types';
import { Plane, Hotel, MapPin, Utensils, ShoppingBag, Trophy, Moon, Camera, Calendar, Clock, Phone, Receipt, CheckCircle2, Info, Globe, ExternalLink, ArrowDown } from 'lucide-react';

const getIcon = (type: EventType) => {
    switch (type) {
        case EventType.FLIGHT: return <Plane size={18} />;
        case EventType.HOTEL: return <Hotel size={18} />;
        case EventType.FOOD: return <Utensils size={18} />;
        case EventType.SHOPPING: return <ShoppingBag size={18} />;
        case EventType.SPORT: return <Trophy size={18} />;
        case EventType.TRANSPORT: return <Clock size={18} />;
        case EventType.FREE_TIME: return <Moon size={18} />;
        default: return <Camera size={18} />;
    }
};

const getColor = (type: EventType) => {
    switch (type) {
        // Dark Mode Optimized Colors: Darker backgrounds, lighter text/borders
        case EventType.FLIGHT: return 'bg-sky-900/40 text-sky-200 border-sky-700/50';
        case EventType.HOTEL: return 'bg-indigo-900/40 text-indigo-200 border-indigo-700/50';
        case EventType.FOOD: return 'bg-amber-900/30 text-amber-200 border-amber-700/50';
        case EventType.SPORT: return 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50';
        case EventType.SHOPPING: return 'bg-rose-900/40 text-rose-200 border-rose-700/50';
        case EventType.FREE_TIME: return 'bg-slate-700/40 text-slate-200 border-slate-600/50';
        default: return 'bg-slate-800 text-slate-200 border-slate-700';
    }
};

const EventCard: React.FC<{ event: TripEvent }> = ({ event }) => {
    return (
        <div className="flex gap-4 relative">
             {/* Timeline Line */}
            <div className="absolute top-0 bottom-0 right-[19px] w-[2px] bg-white/10 -z-10 last:hidden"></div>

            {/* Icon */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[3px] border-[#0f172a] shadow-md backdrop-blur-sm ${getColor(event.type)}`}>
                {getIcon(event.type)}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
                <div className="bg-[#1e293b]/90 backdrop-blur-sm p-0 rounded-2xl shadow-lg shadow-black/40 border border-white/5 hover:border-amber-500/50 transition-all group overflow-hidden">
                    
                    {/* Event Image Banner */}
                    {event.image && (
                        <div className="h-36 relative overflow-hidden">
                            <img 
                                src={event.image} 
                                alt={event.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent"></div>
                            
                            {/* Time Badge on Image */}
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-amber-300 px-3 py-1 rounded-full text-xs font-mono font-bold border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
                                <Clock size={10} />
                                {event.time}
                            </div>
                        </div>
                    )}

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-royal font-bold text-white text-xl leading-tight group-hover:text-amber-400 transition-colors">
                                {event.title}
                            </h3>
                            {!event.image && (
                                <span className="text-xs font-mono font-bold text-blue-100 bg-blue-900/50 px-2 py-1 rounded border border-blue-800 shrink-0 mr-2 shadow-sm">
                                    {event.time}
                                </span>
                            )}
                        </div>
                        {event.description && <p className="text-sm text-slate-300 leading-relaxed font-sans">{event.description}</p>}
                        
                        {/* Event Specific Notes (e.g. Game Stats) */}
                        {event.notes && (
                            <div className="mt-4 bg-[#020617] text-blue-100 p-4 rounded-xl text-xs relative overflow-hidden shadow-inner border border-blue-900/50">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full blur-xl"></div>
                                <div className="flex items-start gap-3 relative z-10">
                                    <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div className="whitespace-pre-line leading-relaxed font-sans opacity-90">
                                        {event.notes}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Tags & Actions */}
                        <div className="flex flex-wrap gap-2 mt-4">
                             {event.paymentStatus === 'PAID' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800">
                                    <CheckCircle2 size={12} />
                                    שולם
                                </span>
                            )}
                            
                            {event.location && (
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location + " Madrid")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold hover:underline bg-amber-950/30 px-3 py-1 rounded-full border border-amber-900/50 transition-colors"
                                >
                                    <MapPin size={12} />
                                    {event.location}
                                </a>
                            )}
                        </div>

                        {/* Action Buttons for Contact/Payment/Links */}
                        {(event.contactPhone || event.paymentLink || event.link) && (
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-dashed border-slate-700">
                                {event.contactPhone && (
                                    <a href={`tel:${event.contactPhone}`} className="flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white text-xs font-bold rounded-lg border border-slate-600 hover:border-slate-500 transition-all shadow-sm">
                                        <Phone size={14} />
                                        <span>צור קשר</span>
                                    </a>
                                )}
                                {event.paymentLink && (
                                    <a href={event.paymentLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-800 hover:border-emerald-700 transition-all shadow-sm">
                                        <Receipt size={14} />
                                        <span>קבלה</span>
                                    </a>
                                )}
                                {event.link && (
                                     <a href={event.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 text-xs font-bold rounded-lg border border-blue-800 hover:border-blue-700 transition-all shadow-sm col-span-2 sm:col-span-1">
                                        <Globe size={14} />
                                        <span>אתר אינטרנט</span>
                                        <ExternalLink size={10} className="opacity-70" />
                                    </a>
                                )}
                            </div>
                        )}

                        {event.attendees && (
                            <div className="mt-4 flex gap-2 flex-wrap pt-2 border-t border-dashed border-slate-700">
                                {event.attendees.map(name => (
                                    <span key={name} className="text-[10px] bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-600 font-bold">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Itinerary: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState(0);

    const handleNextDay = () => {
        if (selectedDay < ITINERARY.length - 1) {
            setSelectedDay(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="pb-24 min-h-screen">
            {/* Day Selector - Dark Glass */}
            <div className="sticky top-[85px] z-40 bg-[#0f172a]/95 backdrop-blur-md shadow-lg shadow-black/40 overflow-x-auto no-scrollbar py-3 px-4 border-b border-white/5 flex justify-center">
                <div className="flex gap-3 min-w-max">
                    {ITINERARY.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedDay(index);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`flex flex-col items-center px-5 py-2.5 rounded-xl transition-all duration-300 min-w-[90px] border ${
                                selectedDay === index 
                                ? 'bg-[#1e3a8a] text-amber-400 shadow-[0_0_15px_rgba(30,58,138,0.5)] transform scale-105 border-amber-500/50' 
                                : 'bg-white/5 text-slate-400 border-white/5 hover:border-amber-500/30 hover:bg-white/10 hover:text-amber-100'
                            }`}
                        >
                            <span className={`text-xs font-royal font-bold tracking-wide ${selectedDay === index ? 'opacity-100' : 'opacity-80'}`}>{day.dayName}</span>
                            <span className="text-sm font-bold font-mono mt-0.5">{day.date}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="px-5 py-8 max-w-3xl mx-auto">
                <div className="mb-10 text-center relative">
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full"></div>
                    <h2 className="relative font-royal text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 uppercase tracking-wide drop-shadow-lg">
                        {ITINERARY[selectedDay].theme}
                    </h2>
                    <div className="relative inline-flex items-center justify-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-sm">
                        <Calendar size={14} className="text-amber-400" />
                        <p className="text-blue-100 text-sm font-bold font-royal">
                            {ITINERARY[selectedDay].dayName}, {ITINERARY[selectedDay].date}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {ITINERARY[selectedDay].events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                    
                    {ITINERARY[selectedDay].events.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <p>אין אירועים ליום זה</p>
                        </div>
                    )}
                </div>

                {/* Next Day Navigation Button */}
                {selectedDay < ITINERARY.length - 1 && (
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={handleNextDay}
                            className="flex flex-col items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors group"
                        >
                            <span className="text-sm font-bold">עבור ליום הבא</span>
                            <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
                                <ArrowDown size={20} className="group-hover:translate-y-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};