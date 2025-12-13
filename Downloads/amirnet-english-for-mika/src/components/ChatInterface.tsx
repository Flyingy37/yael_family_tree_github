import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { ChatMessage, MessageRole } from '../types';
import { Chat, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  systemInstruction: string;
  initialMessage?: string;
  onExit: () => void;
  title: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ systemInstruction, initialMessage, onExit, title }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    chatSessionRef.current = createChatSession(systemInstruction);
    
    // Add initial greeting from AI if provided, or a default one
    const greeting = initialMessage || "Hello Mika! I'm Amirnet. How can I help you practice English today?";
    
    setMessages([
      {
        id: 'init-1',
        role: MessageRole.MODEL,
        text: greeting
      }
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSessionRef.current || isLoading) return;

    const userMsgText = inputValue.trim();
    setInputValue('');
    
    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: userMsgText
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Create a placeholder for the AI response
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: MessageRole.MODEL,
        text: '',
        isTyping: true
      }]);

      const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsgText });
      
      let fullText = '';
      
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullText += chunkText;
        
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, text: fullText, isTyping: true } 
            : msg
        ));
      }

      // Finalize message
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, isTyping: false } 
          : msg
      ));

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: MessageRole.MODEL,
        text: "I'm sorry, I encountered a connection error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-full">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="text-indigo-200 text-xs">Powered by Gemini 2.5</p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="text-indigo-100 hover:text-white hover:bg-indigo-500 px-3 py-1 rounded text-sm transition"
        >
          End Session
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === MessageRole.USER ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {msg.role === MessageRole.USER ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`p-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                msg.role === MessageRole.USER 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.role === MessageRole.USER ? (
                   msg.text
                ) : (
                  <div className="prose prose-sm prose-indigo max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
                {msg.isTyping && (
                  <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-current animate-pulse"></span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all overflow-hidden">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full bg-transparent border-none focus:ring-0 p-3 max-h-32 resize-none text-slate-800 placeholder:text-slate-400"
              rows={1}
              style={{ minHeight: '48px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-sm flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          Amirnet can make mistakes. Please check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
