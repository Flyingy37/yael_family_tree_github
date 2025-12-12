
import React from 'react';
import { PracticeSelector } from './views/PracticeSelector';
import { PracticeView } from './views/PracticeView';
import { ResultsView } from './views/ResultsView';
import { WordBankView } from './views/WordBankView';
import { StarIcon, BookIcon, FlameIcon, MicrophoneIcon } from './components/icons';
import { SpeechProvider } from './contexts/SpeechContext';
import { WordBankProvider } from './contexts/WordBankContext';
import { useAppContext } from './contexts/AppContext';
import { Chatbot } from './views/Chatbot';
import { LoadingSpinner } from './components/LoadingSpinner';
import { DiagnosisResultView } from './views/DiagnosisResultView';
import { LiveConversationView } from './views/LiveConversationView';

const App: React.FC = () => {
  const {
    appState,
    selectedPractice,
    userAnswers,
    dailyStreak,
    handleSelectPractice,
    handleFinishPractice,
    handleRetry,
    handleGoHome,
    handleGoToWordBank,
    handleGoToLiveConversation,
    allPractices,
  } = useAppContext();

  const renderContent = () => {
    switch (appState) {
      case 'practicing':
        return selectedPractice && <PracticeView practice={selectedPractice} onFinish={handleFinishPractice} />;
      case 'results':
        return selectedPractice && <ResultsView 
                                      practice={selectedPractice} 
                                      userAnswers={userAnswers} 
                                      onRetry={handleRetry} 
                                      onGoHome={handleGoHome} 
                                      onSelectPractice={handleSelectPractice}
                                      allPractices={allPractices}
                                    />;
      case 'analyzing':
        return <LoadingSpinner text="Flow בודקת את תשובותיך, רק רגע..." />;
      case 'diagnosis_results':
        return <DiagnosisResultView />;
      case 'wordBank':
        return <WordBankView />;
      case 'liveConversation':
        return <LiveConversationView />;
      case 'selecting':
      default:
        return <PracticeSelector practices={allPractices} onSelectPractice={handleSelectPractice} />;
    }
  };

  return (
    <WordBankProvider>
      <SpeechProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900">
          <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10" title="מיקה, זה בשבילך">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <StarIcon className="w-8 h-8 text-amber-500" />
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">תרגול למבחן אמירנט עבור מיקה ❤️</h1>
              </div>
              <div className="flex items-center gap-4">
                {dailyStreak.count > 0 && (
                    <div className="flex items-center gap-1 text-orange-500 font-bold" title={`${dailyStreak.count} ימים של תרגול רצוף!`}>
                        <FlameIcon className="w-6 h-6" />
                        <span>{dailyStreak.count}</span>
                    </div>
                )}
                 <button
                  onClick={handleGoToLiveConversation}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-semibold shadow-sm"
                 >
                   <MicrophoneIcon className="w-5 h-5 text-red-500" />
                   שיחה חיה
                 </button>
                 <button
                  onClick={handleGoToWordBank}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-semibold shadow-sm"
                >
                  <BookIcon className="w-5 h-5 text-sky-600" />
                  מחסן מילים
                </button>
                {appState !== 'selecting' && (
                  <button
                    onClick={handleGoHome}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                  >
                    בחירת תרגול
                  </button>
                )}
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </main>
          <footer className="text-center py-6 text-slate-500 text-sm">
            <p>נוצר ❤️ למיקה</p>
            <p className="mt-1">על ידי יעל ליבנת - זיידמן</p>
            <p className="mt-2 font-bold text-sky-600" dir="ltr">You can do it!</p>
            <p className="mt-1 font-semibold">בהצלחה במבחן!</p>
          </footer>
          <Chatbot />
        </div>
      </SpeechProvider>
    </WordBankProvider>
  );
};

export default App;