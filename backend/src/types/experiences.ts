// Stage 3: Interview Experiences Types
export interface InterviewExperience {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  interviewDate: Date;
  interviewRound: number;
  interviewType: 'Phone Screen' | 'Technical' | 'System Design' | 'Behavioral' | 'Group Discussion' | 'HR';
  durationMinutes?: number;
  interviewerCount?: number;
  difficultyRating?: number;
  experienceRating?: number;
  outcome: 'Pass' | 'Fail' | 'Pending' | 'Unknown';
  feedback?: string;
  topicsDiscussed?: string[];
  questionsAsked?: string[];
  userPerformance?: Record<string, any>;
  isAnonymous?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InterviewQuestionHistory {
  id: number;
  interviewExperienceId: number;
  questionText: string;
  questionCategory?: string;
  userAnswer?: string;
  answerQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Not Attempted';
  followUpQuestions?: string[];
  interviewerFeedback?: string;
  questionSource: 'Company' | 'LeetCode' | 'GeeksforGeeks' | 'Common' | 'Custom';
  difficulty: 'Easy' | 'Medium' | 'Hard';
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InterviewPreparationPlan {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  planName?: string;
  startDate: Date;
  targetInterviewDate?: Date;
  interviewDate?: Date;
  durationDays?: number;
  status: 'Planned' | 'Active' | 'Completed' | 'Cancelled';
  completionPercentage?: number;
  weekMilestones?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InterviewDailyTask {
  id: number;
  prepPlanId: number;
  userId: string;
  taskDayNumber: number;
  taskTitle: string;
  taskDescription?: string;
  taskType: 'Practice Question' | 'Topic Study' | 'Mock Interview' | 'Review' | 'Company Research';
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  estimatedDurationMinutes?: number;
  resources?: Record<string, any>;
  isCompleted?: boolean;
  completionDate?: Date;
  performanceScore?: number;
  createdAt?: Date;
}

export interface MockInterviewSession {
  id: number;
  userId: string;
  prepPlanId?: number;
  companyId: number;
  companyRoleId?: number;
  sessionTitle?: string;
  sessionStartTime: Date;
  sessionEndTime?: Date;
  durationSeconds?: number;
  interviewType: 'Phone Screen' | 'Technical' | 'System Design' | 'Behavioral' | 'Group Discussion' | 'HR';
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  questionsCount?: number;
  questionsCorrect?: number;
  accuracyPercentage?: number;
  feedbackGiven?: string;
  audioRecordingUrl?: string;
  transcript?: string;
  sessionStatus: 'In Progress' | 'Completed' | 'Abandoned';
  ratingByUser?: number;
  createdAt?: Date;
}

export interface InterviewFeedback {
  id: number;
  interviewExperienceId?: number;
  mockInterviewSessionId?: number;
  feedbackFromUserId?: string;
  feedbackText: string;
  feedbackCategory: 'Strengths' | 'Areas to Improve' | 'Technical' | 'Behavioral' | 'Communication';
  rating?: number;
  helpfulCount?: number;
  createdAt?: Date;
}

export interface InterviewOutcome {
  id: number;
  userId: string;
  companyId: number;
  companyRoleId?: number;
  interviewCount?: number;
  finalOutcome: 'Offer Received' | 'Rejected' | 'Pending' | 'Passed Round' | 'No Feedback';
  salaryOffered?: number;
  salaryCurrency?: string;
  stockOptions?: number;
  bonus?: number;
  negotiationSuccessRate?: number;
  offerAcceptanceDate?: Date;
  joiningDate?: Date;
  feedbackReceived?: string;
  ratingOverall?: number;
  wouldRecommend?: boolean;
  lessonsLearned?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Request/Response Types
export interface CreateInterviewExperienceRequest {
  companyId: number;
  roleId?: number;
  interviewDate: Date;
  interviewRound: number;
  interviewType: 'Phone Screen' | 'Technical' | 'System Design' | 'Behavioral' | 'Group Discussion' | 'HR';
  durationMinutes?: number;
  difficultyRating: number;
  experienceRating: number;
  outcome: 'Pass' | 'Fail' | 'Pending' | 'Unknown';
  feedback?: string;
  questionsAsked?: string[];
}

export interface CreatePrepPlanRequest {
  companyId: number;
  roleId?: number;
  planName?: string;
  startDate: Date;
  targetInterviewDate: Date;
}

export interface StartMockInterviewRequest {
  companyId: number;
  roleId?: number;
  interviewType: 'Phone Screen' | 'Technical' | 'System Design' | 'Behavioral' | 'Group Discussion' | 'HR';
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
}

export interface CreateInterviewTipRequest {
  companyId: number;
  roleId?: number;
  interviewType: 'Phone Screen' | 'Technical' | 'System Design' | 'Behavioral' | 'Group Discussion' | 'HR';
  tipTitle: string;
  tipContent: string;
  tipCategory: 'Preparation' | 'During Interview' | 'Technical Tips' | 'Behavioral Tips' | 'General Advice';
  confidenceLevel: 'Low' | 'Medium' | 'High';
}

export interface InterviewDashboardStats {
  totalInterviews: number;
  successRate: number;
  avgDifficulty: number;
  companiesInterviewed: number;
  upcomingInterviews: number;
  pendingFeedback: number;
}
