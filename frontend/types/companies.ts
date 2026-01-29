// Frontend Types - Stage 2: Company-Specific Questions
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
}

export interface CompanyQuestion {
  id: number;
  companyId: number;
  companyRoleId?: number;
  customQuestionText?: string;
  questionSource: 'aptitude' | 'custom' | 'leetcode' | 'glassdoor';
  frequencyScore: number;
  askedCount?: number;
  avgDifficulty?: number;
  tags?: string[];
}

export interface UserCompanyProgress {
  userId: string;
  companyId: number;
  companyRoleId?: number;
  prepStartDate?: Date;
  questionsAttempted?: number;
  questionsCompleted?: number;
  accuracyPercentage?: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Paused';
}

export interface CompanyPracticeSession {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  totalQuestions: number;
  questionsCorrect?: number;
  accuracyPercentage?: number;
  sessionStatus: 'In Progress' | 'Completed' | 'Abandoned';
}
