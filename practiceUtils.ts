
import type { Practice, Question, PracticeDifficulty, PracticeSkill } from '../types';

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const createDiagnosticTest = (allPractices: Practice[]): Practice => {
  const QUESTIONS_PER_COMBO = 2;
  
  const allQuestions: (Question & { skill: PracticeSkill; difficulty: PracticeDifficulty })[] = [];

  allPractices.forEach(practice => {
    if (practice.id === 'diagnostic-stub') return; 

    practice.sections.forEach(section => {
      section.questions.forEach(question => {
        allQuestions.push({
          ...question,
          skill: practice.skill,
          difficulty: practice.difficulty
        });
      });
    });
  });

  const diagnosticQuestions: Question[] = [];
  const skills: PracticeSkill[] = ['vocabulary', 'logic', 'comprehension'];
  const difficulties: PracticeDifficulty[] = ['easy', 'medium', 'hard'];

  skills.forEach(skill => {
    difficulties.forEach(difficulty => {
      const matchingQuestions = allQuestions.filter(q => 
        q.skill === skill && q.difficulty === difficulty
      );
      
      const shuffled = shuffleArray(matchingQuestions);
      const selected = shuffled.slice(0, QUESTIONS_PER_COMBO);
      diagnosticQuestions.push(...selected);
    });
  });

  const diagnosticTest: Practice = {
    id: 'diagnostic-test-instance',
    title: 'מבחן אבחון אישי',
    skill: 'comprehension', 
    difficulty: 'medium',
    sections: [
      {
        title: 'שאלות אבחון (מכל הנושאים)',
        questions: shuffleArray(diagnosticQuestions) 
      }
    ]
  };

  return diagnosticTest;
};