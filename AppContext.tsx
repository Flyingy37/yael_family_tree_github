
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import type { Practice, UserAnswers, Question, PracticeSkill, PracticeDifficulty } from '../types';
import { practices } from '../data/practices';
import { createDiagnosticTest } from '../utils/practiceUtils';
import { generateViaProxy } from '../utils/genaiClient';

type AppState = 'selecting' | 'practicing' | 'results' | 'wordBank' | 'analyzing' | 'diagnosis_results' | 'liveConversation';


interface DailyStreak {
  count: number;
  lastCompletionDate: string | null;
}

interface AppContextType {
  appState: AppState;
  selectedPractice: Practice | null;
  userAnswers: UserAnswers;
  currentQuestion: Question | null;
  allPractices: Practice[];
  completedPractices: string[];
  dailyStreak: DailyStreak;
  explanationRequest: Question | null;
  definitionRequest: string | null;
  diagnosticResult: string | null;
  handleSelectPractice: (practice: Practice) => void;
  handleFinishPractice: (answers: UserAnswers) => Promise<void>;
  handleRetry: () => void;
  handleGoHome: () => void;
  setCurrentQuestion: (question: Question | null) => void;
  handleGoToWordBank: () => void;
  handleGoToLiveConversation: () => void;
  askFlowToExplain: (question: Question) => void;
  clearExplanationRequest: () => void;
  handleRequestDefinition: (word: string) => void;
  clearDefinitionRequest: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const isYesterday = (date1: Date, date2: Date) => {
    const yesterday = new Date(date2);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date1, yesterday);
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>('selecting');
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [completedPractices, setCompletedPractices] = useState<string[]>([]);
  const [dailyStreak, setDailyStreak] = useState<DailyStreak>({ count: 0, lastCompletionDate: null });
  const [explanationRequest, setExplanationRequest] = useState<Question | null>(null);
  const [definitionRequest, setDefinitionRequest] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  const allPractices = practices;

  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('completedPractices');
      if (storedCompleted) setCompletedPractices(JSON.parse(storedCompleted));
      
      const storedStreak = localStorage.getItem('dailyStreak');
      if (storedStreak) setDailyStreak(JSON.parse(storedStreak));
    } catch (error) {
      console.error('Failed to load progress from local storage', error);
    }
  }, []);

  const markPracticeAsCompleted = useCallback((practiceId: string) => {
    setCompletedPractices(prev => {
      const newCompleted = [...new Set([...prev, practiceId])];
      localStorage.setItem('completedPractices', JSON.stringify(newCompleted));
      return newCompleted;
    });
  }, []);
  
  const updateStreak = useCallback(() => {
    setDailyStreak(prev => {
        const today = new Date();
        const lastDate = prev.lastCompletionDate ? new Date(prev.lastCompletionDate) : null;
        let newStreak: DailyStreak;

        if (!lastDate) {
            newStreak = { count: 1, lastCompletionDate: today.toISOString().split('T')[0] };
        } else if (isSameDay(lastDate, today)) {
            newStreak = prev;
        } else if (isYesterday(lastDate, today)) {
            newStreak = { count: prev.count + 1, lastCompletionDate: today.toISOString().split('T')[0] };
        } else {
            newStreak = { count: 1, lastCompletionDate: today.toISOString().split('T')[0] };
        }

        localStorage.setItem('dailyStreak', JSON.stringify(newStreak));
        return newStreak;
    });
  }, []);

  const handleSelectPractice = useCallback((practice: Practice) => {
    let practiceToStart: Practice = practice;
    if (practice.id === 'diagnostic-stub') {
      practiceToStart = createDiagnosticTest(allPractices);
    }
    setSelectedPractice(practiceToStart);
    setUserAnswers({});
    setAppState('practicing');
    setCurrentQuestion(null);
  }, [allPractices]);

  const handleFinishPractice = useCallback(async (answers: UserAnswers) => {
    if (selectedPractice?.id === 'diagnostic-test-instance') {
      setAppState('analyzing');

      const questions = selectedPractice.sections.flatMap(s => s.questions);
      const fullAnswers = questions.map(q => {
        const questionWithMeta = q as (Question & { skill: PracticeSkill; difficulty: PracticeDifficulty });
        return {
          q_id: q.id,
          skill: questionWithMeta.skill,
          difficulty: questionWithMeta.difficulty,
          is_correct: answers[q.id] === q.correctAnswerIndex
        };
      });

      const practicesSummary = allPractices
        .filter(p => p.id !== 'diagnostic-stub')
        .map(p => ({
          id: p.id,
          title: p.title,
          skill: p.skill,
          difficulty: p.difficulty
        }));

      const prompt = `
        מערכת: את "Flow", מאמנת למידה רגועה ומומחית למבחן אמירנט.
        משימה: מיקה סיימה מבחן אבחון. עליך לנתח את התוצאות שלה, לכתוב לה סיכום מעודד (בסגנון יוגה/מיינדפולנס), ולהמליץ על 3 התרגולים *הספציפיים* הבאים מהרשימה שסיפקתי, שיתאימו לחולשות שזיהית.

        כללים:
        1. פני למיקה אישית ("מיקה, ...").
        2. השתמשי בתגיות HTML בסיסיות (p, ul, li, b, h2, ol) לעיצוב.
        3. אל תהיי טכנית מדי, התמקדי בחוזקות ובנקודות לשיפור.
        4. המטרה היא לתת לה תוכנית פעולה מיידית וברורה.

        הנתונים:
        1. תוצאות האבחון (JSON):
        ${JSON.stringify(fullAnswers)}

        2. רשימת כל התרגולים הזמינים (JSON):
        ${JSON.stringify(practicesSummary)}
      `;

      try {
        const responseJson = await generateViaProxy({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        const resultText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text || "<p>אוי, נראה שהייתה בעיה קטנה בניתוח התוצאות. בואי ננסה לחזור למסך הראשי ולנסות שוב מאוחר יותר.</p>";
        setDiagnosticResult(resultText);
      } catch (error) {
        console.error("Error calling Gemini via proxy for analysis:", error);
        setDiagnosticResult("<p>אוי, נראה שהייתה בעיה קטנה בניתוח התוצאות. בואי ננסה לחזור למסך הראשי ולנסות שוב מאוחר יותר.</p>");
      }
      
      setAppState('diagnosis_results');

    } else {
      if (selectedPractice) {
        markPracticeAsCompleted(selectedPractice.id);
        updateStreak();
      }
      setUserAnswers(answers);
      setAppState('results');
      setCurrentQuestion(null);
    }
  }, [selectedPractice, allPractices, markPracticeAsCompleted, updateStreak]);

  const handleRetry = useCallback(() => {
    setUserAnswers({});
    setAppState('practicing');
    setCurrentQuestion(null);
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedPractice(null);
    setUserAnswers({});
    setAppState('selecting');
    setCurrentQuestion(null);
    setDiagnosticResult(null);
  }, []);

  const handleGoToWordBank = useCallback(() => {
    setAppState('wordBank');
  }, []);

  const handleGoToLiveConversation = useCallback(() => {
    setAppState('liveConversation');
  }, []);

  const askFlowToExplain = useCallback((question: Question) => {
    setExplanationRequest(question);
  }, []);

  const clearExplanationRequest = useCallback(() => {
    setExplanationRequest(null);
  }, []);
  
  const handleRequestDefinition = useCallback((word: string) => {
    setDefinitionRequest(word);
  }, []);

  const clearDefinitionRequest = useCallback(() => {
    setDefinitionRequest(null);
  }, []);

  const value = useMemo(() => ({
    appState,
    selectedPractice,
    userAnswers,
    currentQuestion,
    allPractices,
    completedPractices,
    dailyStreak,
    explanationRequest,
    definitionRequest,
    diagnosticResult,
    handleSelectPractice,
    handleFinishPractice,
    handleRetry,
    handleGoHome,
    setCurrentQuestion,
    handleGoToWordBank,
    handleGoToLiveConversation,
    askFlowToExplain,
    clearExplanationRequest,
    handleRequestDefinition,
    clearDefinitionRequest,
  }), [
    appState, 
    selectedPractice, 
    userAnswers, 
    currentQuestion, 
    allPractices, 
    completedPractices, 
    dailyStreak, 
    explanationRequest, 
    definitionRequest, 
    diagnosticResult, 
    handleSelectPractice, 
    handleFinishPractice, 
    handleRetry, 
    handleGoHome, 
    setCurrentQuestion, 
    handleGoToWordBank, 
    handleGoToLiveConversation, 
    askFlowToExplain, 
    clearExplanationRequest, 
    handleRequestDefinition, 
    clearDefinitionRequest
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
