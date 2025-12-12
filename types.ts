
export type PracticeDifficulty = 'easy' | 'medium' | 'hard';
export type PracticeSkill = 'vocabulary' | 'logic' | 'comprehension';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint?: string;
}

export interface PracticeSection {
  title: string;
  questions: Question[];
  timeLimitSeconds?: number;
}

export interface Practice {
  id: string;
  title: string;
  readingText?: string;
  sections: PracticeSection[];
  skill: PracticeSkill;
  difficulty: PracticeDifficulty;
}

export type UserAnswers = {
  [questionId: string]: number;
};

export interface SavedWord {
  id: string;
  word: string;
  explanation: {
    partOfSpeech: string;
    definition: string;
    example: string;
  };
  addedAt: string;
}