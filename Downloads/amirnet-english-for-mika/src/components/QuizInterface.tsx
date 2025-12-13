import React, { useState, useEffect } from 'react';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion, Difficulty } from '../types';
import { Loader2, CheckCircle, XCircle, ArrowRight, BookOpen, Trophy } from 'lucide-react';

interface QuizInterfaceProps {
  topic: string;
  difficulty: Difficulty;
  onBack: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ topic, difficulty, onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const q = await generateQuizQuestions(topic, difficulty);
        setQuestions(q);
      } catch (err) {
        console.error(err);
        // Retry once or handle error roughly
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    setSelectedOption(index);
    setShowExplanation(true);
    
    if (index === questions[currentIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Generating a unique quiz for Mika...</p>
        <p className="text-slate-400 text-sm mt-2">Topic: {topic} ({difficulty})</p>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Complete!</h2>
        <p className="text-slate-600 mb-8">You scored {score} out of {questions.length}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={onBack}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition"
          >
            Back to Home
          </button>
          {/* Could add a "New Quiz" button that resets state here */}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between text-sm text-slate-500 font-medium">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
          {difficulty}
        </span>
      </div>

      <div className="h-2 w-full bg-slate-100 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ";
              
              if (selectedOption === null) {
                btnClass += "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700";
              } else if (idx === currentQuestion.correctAnswerIndex) {
                btnClass += "border-green-500 bg-green-50 text-green-700 font-medium";
              } else if (idx === selectedOption) {
                btnClass += "border-red-500 bg-red-50 text-red-700";
              } else {
                btnClass += "border-slate-100 text-slate-400 opacity-50";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={btnClass}
                >
                  <span className="flex-1">{option}</span>
                  {selectedOption !== null && idx === currentQuestion.correctAnswerIndex && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                  )}
                  {selectedOption !== null && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation Footer */}
        {showExplanation && (
          <div className="bg-indigo-50 p-6 border-t border-indigo-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-3">
              <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-indigo-900 mb-1">Explanation</h4>
                <p className="text-indigo-800 text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm hover:shadow"
              >
                {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
