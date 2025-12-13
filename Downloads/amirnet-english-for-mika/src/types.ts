export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT',
  QUIZ = 'QUIZ',
  ROLEPLAY = 'ROLEPLAY'
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  isTyping?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  systemInstruction: string;
  icon: string;
}
