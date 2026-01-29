// backend/src/types/aptitude.ts

export interface AptitudeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  orderIndex: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AptitudeSubcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  icon: string;
  orderIndex: number;
  active: boolean;
  createdAt: Date;
}

export interface AptitudeQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  optionLabel: string; // A, B, C, D
  isCorrect: boolean;
  explanation?: string;
}

export interface AptitudeQuestion {
  id: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  questionText: string;
  questionType: 'multiple-choice' | 'numerical' | 'short-answer';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  solutionSteps: string[];
  formulaUsed?: string;
  relatedConcepts: string[];
  options?: AptitudeQuestionOption[]; // Only for multiple-choice
  
  // Statistics
  views: number;
  attempts: number;
  correctAttempts: number;
  averageTimeSpent?: number; // in seconds
  difficultyRating?: number; // 1-5
  
  // Metadata
  tags: string[];
  externalSourceUrl?: string;
  sourceAttribution?: string;
  isVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAptitudeResponse {
  id: string;
  userId: string;
  questionId: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  attemptNumber: number;
  skipped: boolean;
  notes?: string;
  createdAt: Date;
}

export interface AptitudePracticeSession {
  id: string;
  userId: string;
  categoryId?: string;
  subcategoryId?: string;
  difficultyFilter?: string;
  questionCount: number;
  timeLimitSeconds?: number;
  
  // Stats
  totalQuestions: number;
  correctAnswers: number;
  skipped: number;
  partialCredit: number;
  accuracyPercentage: number;
  averageTimePerQuestion: number;
  totalTimeSpent: number;
  
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  endedAt?: Date;
}

export interface UserAptitudeProgress {
  id: string;
  userId: string;
  categoryStats: Record<string, { correct: number; total: number; accuracy: number }>;
  subcategoryStats: Record<string, { correct: number; total: number; accuracy: number }>;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  totalMinutesSpent: number;
  preferredDifficulty?: string;
  preferredQuestionType?: string;
  preferredCategoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AptitudeQueryFilters {
  categoryId?: string;
  subcategoryId?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'All';
  questionType?: 'multiple-choice' | 'numerical' | 'short-answer';
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'most-attempted' | 'trending' | 'difficulty';
}

export interface AptitudePracticeOptions {
  categoryId?: string;
  subcategoryId?: string;
  difficulty?: string;
  questionType?: string;
  questionCount: number;
  timeLimitMinutes?: number;
  excludeAttempted?: boolean;
}

export interface PracticeSessionResponse {
  sessionId: string;
  question: AptitudeQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining?: number;
}

export interface SessionResultSummary {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  skipped: number;
  accuracyPercentage: number;
  totalTimeSpent: number;
  categoryPerformance: Record<string, number>;
  topicPerformance: Record<string, number>;
}
