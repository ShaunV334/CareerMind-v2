// Frontend Types - Stage 3: Interview Experiences
export interface InterviewExperience {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  interviewDate: Date;
  interviewRound: number;
  interviewType: 'Phone Screen' | 'Technical' | 'System Design' | 'Behavioral' | 'Group Discussion' | 'HR';
  durationMinutes?: number;
  difficultyRating?: number;
  experienceRating?: number;
  outcome: 'Pass' | 'Fail' | 'Pending' | 'Unknown';
  feedback?: string;
  topicsDiscussed?: string[];
  questionsAsked?: string[];
}

export interface InterviewPreparationPlan {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  planName?: string;
  startDate: Date;
  targetInterviewDate?: Date;
  status: 'Planned' | 'Active' | 'Completed' | 'Cancelled';
  completionPercentage?: number;
  weekMilestones?: Record<string, any>;
}

export interface InterviewDailyTask {
  id: number;
  prepPlanId: number;
  taskDayNumber: number;
  taskTitle: string;
  taskDescription?: string;
  taskType: 'Practice Question' | 'Topic Study' | 'Mock Interview' | 'Review' | 'Company Research';
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  estimatedDurationMinutes?: number;
  isCompleted?: boolean;
  completionDate?: Date;
  performanceScore?: number;
}

export interface MockInterviewSession {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  sessionTitle?: string;
  sessionStartTime: Date;
  sessionEndTime?: Date;
  interviewType: 'Phone Screen' | 'Technical' | 'System Design' | 'Behavioral' | 'Group Discussion' | 'HR';
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  questionsCount?: number;
  questionsCorrect?: number;
  accuracyPercentage?: number;
  sessionStatus: 'In Progress' | 'Completed' | 'Abandoned';
  ratingByUser?: number;
}

export interface InterviewTipShared {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  interviewType: 'Phone Screen' | 'Technical' | 'System Design' | 'Behavioral' | 'Group Discussion' | 'HR';
  tipTitle: string;
  tipContent: string;
  tipCategory: 'Preparation' | 'During Interview' | 'Technical Tips' | 'Behavioral Tips' | 'General Advice';
  confidenceLevel: 'Low' | 'Medium' | 'High';
  helpfulCount?: number;
}

export interface InterviewDashboardStats {
  totalInterviews: number;
  successRate: number;
  avgDifficulty: number;
  companiesInterviewed: number;
  upcomingInterviews: number;
  pendingFeedback: number;
}
