// frontend/hooks/useAptitude.ts

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import type {
  AptitudeCategory,
  AptitudeQuestion,
  PracticeSession,
  SessionResults,
  UserProgress,
  BookmarkedQuestion,
  PracticeOptions
} from '@/types/aptitude';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function useAptitude() {
  const { user } = useAuth();
  
  // Use actual user ID or test ID for development
  const userId = user?.id || 'test-user-frontend';
  
  // Categories & Questions
  const [categories, setCategories] = useState<AptitudeCategory[]>([]);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<AptitudeQuestion | null>(null);

  // Practice Session
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // User Data
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState<number | null>(null);

  // ==================== CATEGORIES ====================

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/aptitude/categories`, {
        headers: { 'x-user-id': userId }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      // Map _id to id for consistency
      const mappedData = data.map((cat: any) => ({
        ...cat,
        id: cat._id
      }));
      setCategories(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchCategory = useCallback(async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/aptitude/categories/${categoryId}`, {
        headers: { 'x-user-id': userId }
      });
      if (!response.ok) throw new Error('Failed to fetch category');
      const data = await response.json();
      // Map _id to id and include subcategories
      return {
        ...data,
        id: data._id,
        subcategories: (data.subcategories || []).map((sub: any) => ({
          ...sub,
          id: sub._id
        }))
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ==================== QUESTIONS ====================

  const fetchQuestions = useCallback(async (filters?: {
    categoryId?: string;
    subcategoryId?: string;
    difficulty?: string;
    questionType?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
        if (filters.subcategoryId) queryParams.append('subcategoryId', filters.subcategoryId);
        if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
        if (filters.questionType) queryParams.append('questionType', filters.questionType);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.offset) queryParams.append('offset', filters.offset.toString());
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      }

      const response = await fetch(`${API_BASE}/aptitude/questions?${queryParams}`, {
        headers: { 'x-user-id': userId }
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      const mappedQuestions = data.map((q: any) => ({ ...q, id: q._id }));
      setQuestions(mappedQuestions);
      return mappedQuestions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchQuestion = useCallback(async (questionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/aptitude/questions/${questionId}`);
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      setSelectedQuestion(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== PRACTICE SESSIONS ====================

  const startPracticeSession = useCallback(async (options: PracticeOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/aptitude/practice/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) throw new Error('Failed to start practice session');
      const data = await response.json();
      setCurrentSession(data);
      setCurrentQuestionIndex(0);

      // Start timer if time limit is set
      if (options.timeLimitMinutes) {
        setSessionTimer(options.timeLimitMinutes * 60);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const submitAnswer = useCallback(async (
    sessionId: string,
    questionId: string,
    selectedOptionId?: string,
    timeSpentSeconds?: number,
    skipped?: boolean
  ) => {
    try {
      const response = await fetch(`/api/aptitude/practice/${sessionId}/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          questionId,
          selectedOptionId,
          timeSpentSeconds,
          skipped: skipped || false
        })
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      const data = await response.json();

      // Move to next question
      if (currentSession && currentQuestionIndex < currentSession.totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [user, currentSession, currentQuestionIndex]);

  const completePracticeSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/aptitude/practice/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || ''
        }
      });

      if (!response.ok) throw new Error('Failed to complete session');
      const data = await response.json();
      setSessionResults(data);
      setCurrentSession(null);
      setSessionTimer(null);

      // Refresh user progress
      await fetchUserProgress();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [user]);

  // ==================== USER PROGRESS ====================

  const fetchUserProgress = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/aptitude/user/progress`, {
        headers: {
          'x-user-id': userId
        }
      });

      if (!response.ok) throw new Error('Failed to fetch progress');
      const data = await response.json();
      setUserProgress(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [userId]);

  // ==================== BOOKMARKS ====================

  const bookmarkQuestion = useCallback(async (
    questionId: string,
    folderName?: string,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/aptitude/bookmarks/${questionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          folderName: folderName || 'General',
          notes
        })
      });

      if (!response.ok) throw new Error('Failed to bookmark question');
      await fetchBookmarkedQuestions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [userId]);

  const fetchBookmarkedQuestions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/aptitude/bookmarks`, {
        headers: {
          'x-user-id': userId
        }
      });

      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      const data = await response.json();
      setBookmarkedQuestions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [userId]);

  return {
    // State
    categories,
    questions,
    selectedQuestion,
    currentSession,
    currentQuestionIndex,
    sessionResults,
    userProgress,
    bookmarkedQuestions,
    isLoading,
    error,
    sessionTimer,

    // Methods
    fetchCategories,
    fetchCategory,
    fetchQuestions,
    fetchQuestion,
    startPracticeSession,
    submitAnswer,
    completePracticeSession,
    fetchUserProgress,
    bookmarkQuestion,
    fetchBookmarkedQuestions,

    // Helpers
    getCurrentQuestion: () => {
      if (!currentSession) return null;
      return currentSession.question;
    },
    getProgress: () => {
      if (!currentSession) return 0;
      return ((currentQuestionIndex + 1) / currentSession.totalQuestions) * 100;
    }
  };
}
