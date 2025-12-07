/**
 * Learning Module Types & Interfaces
 */

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface InterestingFact {
  id: string;
  title: string;
  description: string;
  category: string;
  source?: string;
}

export interface FunFact {
  id: string;
  fact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: string;
  duration: number; // in minutes
  order: number;
  videoUrl?: string;
  codeExamples?: CodeExample[];
  faqs: FAQ[];
  interestingFacts: InterestingFact[];
  funFacts: FunFact[];
  quiz: QuizQuestion[];
}

export interface CodeExample {
  id: string;
  title: string;
  code: string;
  language: string;
  explanation: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  prerequisites?: string[];
  color: string;
  totalLessons: number;
  interestingFacts: InterestingFact[];
  funFacts: FunFact[];
  completionPercentage?: number;
  tags: string[];
}

export interface UserProgress {
  userId: string;
  moduleId: string;
  lessonsCompleted: string[];
  quizScores: { [lessonId: string]: number };
  lastAccessed: Date;
  completionPercentage: number;
}
