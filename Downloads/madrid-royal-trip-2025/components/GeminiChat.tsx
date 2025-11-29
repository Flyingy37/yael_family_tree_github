import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2, MapPin, ExternalLink, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const DEFAULT_MESSAGE: ChatMessage = {
    id: 'welcome',
    role: 'model',
    text: 'היי! אני העוזרת האישית שלכם למדריד. צריכים המלצה לטאפאס? עזרה עם התרגום? או סתם לדעת מתי המשחק של ריאל?',
    timestamp: Date.now()
};

export const GeminiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
        const saved = localStorage.getItem('royal_chat_history');
        return saved ? JSON.parse(saved) : [DEFAULT_MESSAGE];
    } catch (e) {
        return [DEFAULT_MESSAGE];
    }
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Save to local storage whenever messages change
    localStorage.setItem('royal_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const { text, groundingLinks } = await sendMessageToGemini(input, history);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: text,
      timestamp: Date.now(),
      groundingLinks: groundingLinks
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const clearHistory = () => {
      if (window.confirm('האם למחוק את היסטוריית הצ׳אט?')) {
          setMessages([DEFAULT_MESSAGE]);
          localStorage.removeItem('royal_chat_history');
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-transparent relative">
      
      {/* Clear History Button (Small, top right) */}
      <div className="absolute top-2 left-4 z-10">
           <button 
             onClick={clearHistory} 
             className="text-slate-500 hover:text-red-400 transition-colors p-1"
             title="נקה היסטוריה"
           >
             <Trash2 size={14} />
           </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-8">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
              msg.role === 'user' 
                ? 'bg-white/10 text-white border-white/20' 
                : 'bg-amber-400 text-blue-950 border-amber-500'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} fill="currentColor" />}
            </div>
            
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
              msg.role === 'user' 
                ? 'bg-white/10 text-white rounded-bl-none ml-10 border border-white/20' 
                : 'bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-br-none mr-10 border border-blue-800'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {/* Grounding Links */}
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20 flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-wider opacity-70 font-bold flex items-center gap-1">
                        <MapPin size={10} />
                        מידע נוסף ממפה:
                    </span>
                    {msg.groundingLinks.map((link, idx) => (
                        <a 
                            key={idx}
                            href={link.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-black/20 hover:bg-black/30 transition-colors p-2 rounded text-xs text-blue-50 group"
                        >
                            <span className="truncate flex-1">{link.title}</span>
                            <ExternalLink size={12} className="opacity-70 group-hover:opacity-100" />
                        </a>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-end gap-2">
             <div className="w-8 h-8 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center animate-pulse">
               <Loader2 size={14} className="animate-spin" />
             </div>
             <div className="bg-blue-900/50 px-4 py-3 rounded-2xl rounded-br-none shadow-sm border border-blue-800">
               <div className="flex gap-1">
                 <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-100"></span>
                 <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-200"></span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0f172a] border-t border-white/10">
        <div className="relative flex items-center bg-white/5 rounded-full px-2 py-2 border border-white/10 focus-within:border-amber-400 focus-within:bg-white/10 focus-within:shadow-[0_0_0_3px_rgba(251,191,36,0.1)] transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="שאל אותי כל דבר..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-white placeholder-slate-400"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full transition-all ${
              input.trim() && !isLoading 
                ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-blue-900 shadow-md hover:from-amber-300 hover:to-amber-400' 
                : 'bg-white/10 text-slate-500'
            }`}
          >
            <Send size={18} className={input.trim() ? "ml-0.5" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};