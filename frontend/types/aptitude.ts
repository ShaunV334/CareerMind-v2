// frontend/types/aptitude.ts

export interface AptitudeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  orderIndex: number;
  subcategories: AptitudeSubcategory[];
}

export interface AptitudeSubcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  orderIndex?: number;
  questionCount?: number;
}

export interface AptitudeQuestionOption {
  id: string;
  optionText: string;
  optionLabel: string;
  isCorrect?: boolean;
  explanation?: string;
}

export interface AptitudeQuestion {
  id: string;
  title: string;
  questionText: string;
  questionType: 'multiple-choice' | 'numerical' | 'short-answer';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  solutionSteps: string[];
  formulaUsed?: string;
  relatedConcepts: string[];
  options?: AptitudeQuestionOption[];
  views: number;
  attempts: number;
  tags: string[];
  createdAt: Date;
}

export interface PracticeSession {
  sessionId: string;
  question: AptitudeQuestion;
  questionNumber: number;
  totalQuestions: number;
  allQuestionIds: string[];
  timeRemaining?: number;
}

export interface SessionResults {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  skipped: number;
  accuracyPercentage: number;
}

export interface UserProgress {
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutesSpent: number;
  categoryStats: Record<string, { correct: number; total: number; accuracy: number }>;
}

export interface BookmarkedQuestion {
  id: string;
  title: string;
  difficulty: string;
  questionType: string;
  folderName: string;
  notes?: string;
  createdAt: Date;
}

export interface PracticeOptions {
  categoryId?: string;
  subcategoryId?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  questionType?: string;
  questionCount: number;
  timeLimitMinutes?: number;
  excludeAttempted?: boolean;
}
