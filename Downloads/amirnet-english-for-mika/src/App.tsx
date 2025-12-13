import React, { useState, useEffect } from 'react';
import { AppView, Difficulty, RoleplayScenario } from './types';
import ChatInterface from './components/ChatInterface';
import QuizInterface from './components/QuizInterface';
import { generateDailyWord } from './services/geminiService';
import { 
  MessageCircle, 
  BrainCircuit, 
  Users, 
  Book, 
  ChevronRight, 
  Sparkles,
  GraduationCap
} from 'lucide-react';

const SCENARIOS: RoleplayScenario[] = [
  {
    id: 'cafe',
    title: 'Ordering at a Café',
    description: 'Practice ordering your favorite coffee and snack.',
    icon: '☕',
    systemInstruction: "You are a barista at a trendy coffee shop in London. You are friendly but busy. The user (Mika) is a customer. Help her order a drink and some food. Correct any major polite phrasing issues gently."
  },
  {
    id: 'interview',
    title: 'Job Interview',
    description: 'Answer common questions for a creative role.',
    icon: '💼',
    systemInstruction: "You are a hiring manager for a tech company interviewing Mika for a graphic design role. Ask standard interview questions one by one. Be professional but encouraging. Provide feedback on her answers after the interview is 'over' or if she asks for help."
  },
  {
    id: 'doctor',
    title: 'Doctor Appointment',
    description: 'Explain symptoms and get medical advice.',
    icon: '🩺',
    systemInstruction: "You are a kind doctor. Mika is your patient who is not feeling well. Ask her about her symptoms, show empathy, and give advice. Focus on health vocabulary."
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [quizConfig, setQuizConfig] = useState<{topic: string, difficulty: Difficulty} | null>(null);
  
  // Daily Word State
  const [dailyWord, setDailyWord] = useState<{word: string, definition: string, example: string} | null>(null);

  useEffect(() => {
    generateDailyWord().then(setDailyWord);
  }, []);

  const renderHome = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Amirnet <span className="text-indigo-600">English</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Welcome back, Mika! Ready to practice today?
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 w-full md:w-auto">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
             <GraduationCap size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Daily Word</div>
            {dailyWord ? (
              <div>
                <div className="font-bold text-slate-800 text-lg">{dailyWord.word}</div>
                <div className="text-xs text-slate-500 truncate max-w-[200px]">{dailyWord.definition}</div>
              </div>
            ) : (
              <div className="animate-pulse h-8 w-32 bg-slate-100 rounded"></div>
            )}
          </div>
        </div>
      </div>

      {/* Main Actions Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chat Card */}
        <button 
          onClick={() => setCurrentView(AppView.CHAT)}
          className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MessageCircle size={100} className="text-indigo-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Free Chat</h3>
            <p className="text-slate-500 text-sm mb-4">
              Casual conversation with Amirnet. He'll gently correct your grammar as you go.
            </p>
            <div className="flex items-center text-indigo-600 font-semibold text-sm">
              Start chatting <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        </button>

        {/* Quiz Card */}
        <div className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-rose-200 transition-all text-left">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit size={100} className="text-rose-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4 text-rose-600 group-hover:scale-110 transition-transform">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Quick Quiz</h3>
            <p className="text-slate-500 text-sm mb-4">
              Test your knowledge on specific topics. 5 questions with instant feedback.
            </p>
            
            {/* Quick Quiz Form embedded in card */}
            <div className="space-y-2 mt-4">
               <input 
                  type="text" 
                  placeholder="Topic (e.g. Travel, Food)"
                  id="quiz-topic"
                  className="w-full text-sm border border-slate-200 rounded px-3 py-2 focus:ring-2 focus:ring-rose-200 outline-none"
               />
               <select 
                  id="quiz-difficulty"
                  className="w-full text-sm border border-slate-200 rounded px-3 py-2 focus:ring-2 focus:ring-rose-200 outline-none bg-white"
               >
                 <option value={Difficulty.BEGINNER}>Beginner</option>
                 <option value={Difficulty.INTERMEDIATE}>Intermediate</option>
                 <option value={Difficulty.ADVANCED}>Advanced</option>
               </select>
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const topicInput = (document.getElementById('quiz-topic') as HTMLInputElement).value || "General English";
                    const diffInput = (document.getElementById('quiz-difficulty') as HTMLSelectElement).value as Difficulty;
                    setQuizConfig({ topic: topicInput, difficulty: diffInput });
                    setCurrentView(AppView.QUIZ);
                  }}
                  className="w-full bg-rose-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-rose-700 transition"
               >
                 Start Quiz
               </button>
            </div>
          </div>
        </div>

        {/* Roleplay Card */}
        <button 
          onClick={() => setCurrentView(AppView.ROLEPLAY)}
          className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={100} className="text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Roleplay</h3>
            <p className="text-slate-500 text-sm mb-4">
              Immerse yourself in real-world scenarios like job interviews or shopping.
            </p>
             <div className="flex items-center text-emerald-600 font-semibold text-sm">
              Choose scenario <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        </button>
      </div>
      
      {/* Footer / Tip */}
      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white flex items-start gap-4 shadow-lg">
        <Sparkles className="w-6 h-6 flex-shrink-0 mt-1 text-yellow-300" />
        <div>
          <h4 className="font-bold text-lg mb-1">Amirnet Pro Tip</h4>
          <p className="text-indigo-100 leading-relaxed opacity-90">
            Don't be afraid to make mistakes! That's how we learn. If you're stuck in a chat, just ask "How do I say X?" and I'll help you out.
          </p>
        </div>
      </div>
    </div>
  );

  const renderRoleplaySelection = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button onClick={() => setCurrentView(AppView.HOME)} className="text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-2 font-medium">
        ← Back to Home
      </button>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Choose a Scenario</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {SCENARIOS.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => {
              setSelectedScenario(scenario);
            }}
            className="flex items-start p-6 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <span className="text-4xl mr-4 group-hover:scale-110 transition-transform block">{scenario.icon}</span>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{scenario.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{scenario.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {currentView === AppView.HOME && renderHome()}

      {currentView === AppView.CHAT && (
        <div className="h-screen p-0 md:p-6 max-w-5xl mx-auto">
          <ChatInterface 
            title="Free Chat Practice"
            systemInstruction="You are Amirnet, a friendly, patient, and encouraging English tutor for Mika. Engage in natural conversation suitable for an intermediate learner. If Mika makes a grammar mistake, gently provide the corrected form at the end of your response, perhaps in a separate line starting with '💡 Correction:'. Keep the conversation flowing."
            onExit={() => setCurrentView(AppView.HOME)}
          />
        </div>
      )}

      {currentView === AppView.ROLEPLAY && !selectedScenario && renderRoleplaySelection()}

      {currentView === AppView.ROLEPLAY && selectedScenario && (
        <div className="h-screen p-0 md:p-6 max-w-5xl mx-auto">
          <ChatInterface 
            title={`Roleplay: ${selectedScenario.title}`}
            systemInstruction={selectedScenario.systemInstruction}
            initialMessage={`*Scenario Started: ${selectedScenario.title}* \n\nHello! I am ready. You can start when you are ready.`}
            onExit={() => {
              setSelectedScenario(null);
              setCurrentView(AppView.ROLEPLAY);
            }}
          />
        </div>
      )}

      {currentView === AppView.QUIZ && quizConfig && (
        <div className="min-h-screen p-4 md:p-8 flex flex-col">
          <button 
             onClick={() => setCurrentView(AppView.HOME)}
             className="text-slate-500 hover:text-slate-800 mb-6 self-start flex items-center gap-2 font-medium"
          >
            ← Cancel Quiz
          </button>
          <div className="flex-1 flex items-center justify-center">
            <QuizInterface 
              topic={quizConfig.topic}
              difficulty={quizConfig.difficulty}
              onBack={() => setCurrentView(AppView.HOME)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
