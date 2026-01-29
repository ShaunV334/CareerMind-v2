// Stage 2: Company-Specific Questions Types
export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  industry?: string;
  foundedYear?: number;
  headquarters?: string;
  websiteUrl?: string;
  difficultyRating?: number;
  questionCount?: number;
  interviewCount?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyRole {
  id: number;
  companyId: number;
  roleName: string;
  description?: string;
  focusAreas?: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  experienceLevel?: string;
  questionCount?: number;
  createdAt?: Date;
}

export interface CompanyQuestion {
  id: number;
  companyId: number;
  companyRoleId?: number;
  aptitudeQuestionId?: number;
  customQuestionText?: string;
  questionSource: 'aptitude' | 'custom' | 'leetcode' | 'glassdoor';
  frequencyScore: number;
  askedCount?: number;
  avgDifficulty?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCompanyProgress {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  prepStartDate?: Date;
  prepCompletionDate?: Date;
  questionsAttempted?: number;
  questionsCompleted?: number;
  accuracyPercentage?: number;
  avgTimePerQuestion?: number;
  difficultyCompleted?: 'Easy' | 'Medium' | 'Hard';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Paused';
  updatedAt?: Date;
}

export interface CompanyPracticeSession {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  durationSeconds?: number;
  totalQuestions: number;
  questionsCorrect?: number;
  accuracyPercentage?: number;
  questionsSkipped?: number;
  sessionStatus: 'In Progress' | 'Completed' | 'Abandoned';
  difficultyFilter?: 'Easy' | 'Medium' | 'Hard' | 'All';
}

export interface CompanyInterviewTip {
  id: number;
  companyId: number;
  companyRoleId?: number;
  tipCategory: 'Preparation' | 'Interview' | 'Negotiation' | 'Culture Fit';
  tipText: string;
  authorUserId?: string;
  helpfulCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyMetrics {
  id: number;
  companyId: number;
  avgPreparationTimeDays?: number;
  successRatePercentage?: number;
  avgInterviewRounds?: number;
  avgOfferRate?: number;
  trendDifficulty?: string;
  lastUpdated?: Date;
}

// Request/Response Types
export interface CompaniesListQuery {
  industry?: string;
  search?: string;
  limit?: number;
  skip?: number;
  sortBy?: 'difficulty' | 'questions' | 'name';
}

export interface CompanyQuestionsQuery {
  companyId: number;
  roleId?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  limit?: number;
  skip?: number;
}

export interface StartCompanyPracticeRequest {
  companyId: number;
  roleId?: number;
  questionCount: number;
  timeLimit?: number;
  difficultyFilter?: 'Easy' | 'Medium' | 'Hard' | 'All';
}

export interface SubmitCompanyAnswerRequest {
  sessionId: number;
  questionId: number;
  selectedAnswer: string;
  timeTaken?: number;
}
