// frontend/types/groupDiscussions.ts

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  category: 'interview' | 'aptitude' | 'resume' | 'companies' | 'general';
  author: UserProfile;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  replyCount: number;
  likes: number;
  liked?: boolean; // Whether current user liked this
  isPinned: boolean;
  tags: string[];
}

export interface Reply {
  id: string;
  discussionId: string;
  content: string;
  author: UserProfile;
  createdAt: string;
  updatedAt: string;
  likes: number;
  liked?: boolean;
  isAnswer?: boolean; // Mark as accepted answer
}

export interface DiscussionDetail extends Discussion {
  content: string;
  replies: Reply[];
}

export interface CreateDiscussionRequest {
  title: string;
  description: string;
  content: string;
  category: 'interview' | 'aptitude' | 'resume' | 'companies' | 'general';
  tags?: string[];
}

export interface CreateReplyRequest {
  content: string;
}

export interface DiscussionFilters {
  category?: string;
  searchTerm?: string;
  sortBy?: 'newest' | 'mostActive' | 'mostLiked';
  limit?: number;
  offset?: number;
}
