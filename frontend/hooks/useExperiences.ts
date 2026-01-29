'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import type {
  InterviewExperience,
  InterviewPreparationPlan,
  InterviewDailyTask,
  MockInterviewSession,
  InterviewTipShared,
  InterviewDashboardStats,
} from '@/types/experiences'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export function useInterviewExperiences() {
  const { user } = useAuth()
  
  // Use actual user ID or test ID for development
  const userId = user?.id || 'test-user-frontend'
  
  const [experiences, setExperiences] = useState<InterviewExperience[]>([])
  const [selectedExperience, setSelectedExperience] = useState<InterviewExperience | null>(null)
  const [prepPlans, setPrepPlans] = useState<InterviewPreparationPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<InterviewPreparationPlan | null>(null)
  const [dailyTasks, setDailyTasks] = useState<InterviewDailyTask[]>([])
  const [mockSessions, setMockSessions] = useState<MockInterviewSession[]>([])
  const [tips, setTips] = useState<InterviewTipShared[]>([])
  const [stats, setStats] = useState<InterviewDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExperiences = useCallback(
    async (filters?: {
      companyId?: number
      outcome?: string
      limit?: number
      skip?: number
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters?.companyId) params.append('companyId', filters.companyId.toString())
        if (filters?.outcome) params.append('outcome', filters.outcome)
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.skip) params.append('skip', filters.skip.toString())

        const response = await fetch(`${API_BASE}/experiences?${params}`, {
          headers: { 'x-user-id': userId },
        })

        if (!response.ok) throw new Error('Failed to fetch experiences')

        const data = await response.json()
        setExperiences(data.experiences || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  const fetchExperienceDetails = useCallback(
    async (experienceId: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE}/experiences/${experienceId}`, {
          headers: { 'x-user-id': userId },
        })

        if (!response.ok) throw new Error('Failed to fetch experience details')

        const experience = await response.json()
        setSelectedExperience(experience)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  const createExperience = useCallback(
    async (experience: {
      companyId: number
      roleId?: number
      interviewDate: Date
      interviewRound: number
      interviewType: string
      durationMinutes?: number
      difficultyRating: number
      experienceRating: number
      outcome: string
      feedback?: string
      questionsAsked?: string[]
    }): Promise<boolean> => {
      if (!user?.id) return false

      try {
        const response = await fetch(`${API_BASE}/experiences`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(experience),
        })

        if (!response.ok) throw new Error('Failed to create experience')

        // Refresh experiences list
        await fetchExperiences()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return false
      }
    },
    [user?.id, fetchExperiences]
  )

  const updateExperience = useCallback(
    async (experienceId: number, updates: {
      feedback?: string
      outcome?: string
      rating?: number
    }): Promise<boolean> => {
      if (!user?.id) return false

      try {
        const response = await fetch(`${API_BASE}/experiences/${experienceId}`, {
          method: 'PUT',
          headers: {
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) throw new Error('Failed to update experience')

        await fetchExperiences()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return false
      }
    },
    [user?.id, fetchExperiences]
  )

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/experiences/dashboard/stats`, {
        headers: { 'x-user-id': userId },
      })

      if (!response.ok) throw new Error('Failed to fetch stats')

      const dashboardStats = await response.json()
      setStats(dashboardStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [userId])

  const fetchPrepPlans = useCallback(
    async (filters?: { status?: string; limit?: number; skip?: number }) => {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.skip) params.append('skip', filters.skip.toString())

        const response = await fetch(`${API_BASE}/experiences/preparation-plans?${params}`, {
          headers: { 'x-user-id': user.id },
        })

        if (!response.ok) throw new Error('Failed to fetch preparation plans')

        const data = await response.json()
        setPrepPlans(data.plans || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id]
  )

  const createPrepPlan = useCallback(
    async (plan: {
      companyId: number
      roleId?: number
      planName?: string
      startDate: Date
      targetInterviewDate: Date
    }): Promise<boolean> => {
      if (!user?.id) return false

      try {
        const response = await fetch(`${API_BASE}/experiences/preparation-plans`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plan),
        })

        if (!response.ok) throw new Error('Failed to create preparation plan')

        await fetchPrepPlans()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return false
      }
    },
    [user?.id, fetchPrepPlans]
  )

  const fetchDailyTasks = useCallback(
    async (planId: number, completed?: boolean) => {
      if (!user?.id) return

      try {
        const params = new URLSearchParams()
        if (completed !== undefined) params.append('completed', completed.toString())

        const response = await fetch(
          `${API_BASE}/experiences/preparation-plans/${planId}/tasks?${params}`,
          {
            headers: { 'x-user-id': user.id },
          }
        )

        if (!response.ok) throw new Error('Failed to fetch daily tasks')

        const tasks = await response.json()
        setDailyTasks(tasks || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    },
    [user?.id]
  )

  const completeTask = useCallback(
    async (planId: number, taskId: number, performanceScore?: number): Promise<boolean> => {
      if (!user?.id) return false

      try {
        const response = await fetch(
          `${API_BASE}/experiences/preparation-plans/${planId}/tasks/${taskId}/complete`,
          {
            method: 'POST',
            headers: {
              'x-user-id': user.id,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ performanceScore }),
          }
        )

        if (!response.ok) throw new Error('Failed to complete task')

        await fetchDailyTasks(planId)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return false
      }
    },
    [user?.id, fetchDailyTasks]
  )

  const startMockInterview = useCallback(
    async (options: {
      companyId: number
      roleId?: number
      interviewType: string
      difficultyLevel: string
      questionCount: number
    }): Promise<MockInterviewSession | null> => {
      if (!user?.id) return null

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE}/experiences/mock-interviews`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        })

        if (!response.ok) throw new Error('Failed to start mock interview')

        const session = await response.json()
        return session
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id]
  )

  const submitMockInterviewAnswer = useCallback(
    async (
      sessionId: number,
      questionId: number,
      userAnswer: string,
      timeTaken?: number
    ): Promise<any | null> => {
      if (!user?.id) return null

      try {
        const response = await fetch(`${API_BASE}/experiences/mock-interviews/${sessionId}/submit`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId,
            userAnswer,
            timeTaken,
          }),
        })

        if (!response.ok) throw new Error('Failed to submit answer')

        return await response.json()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [user?.id]
  )

  const completeMockInterview = useCallback(
    async (sessionId: number): Promise<any | null> => {
      if (!user?.id) return null

      try {
        const response = await fetch(
          `${API_BASE}/experiences/mock-interviews/${sessionId}/complete`,
          {
            method: 'POST',
            headers: {
              'x-user-id': user.id,
            },
          }
        )

        if (!response.ok) throw new Error('Failed to complete mock interview')

        return await response.json()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [user?.id]
  )

  const fetchTips = useCallback(
    async (filters?: {
      companyId?: number
      interviewType?: string
      limit?: number
      skip?: number
    }) => {
      try {
        const params = new URLSearchParams()
        if (filters?.companyId) params.append('companyId', filters.companyId.toString())
        if (filters?.interviewType) params.append('interviewType', filters.interviewType)
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.skip) params.append('skip', filters.skip.toString())

        const response = await fetch(`${API_BASE}/experiences/tips?${params}`)

        if (!response.ok) throw new Error('Failed to fetch tips')

        const data = await response.json()
        setTips(data.tips || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    },
    []
  )

  const shareTip = useCallback(
    async (tip: {
      companyId: number
      roleId?: number
      interviewType: string
      tipTitle: string
      tipContent: string
      tipCategory: string
      confidenceLevel: string
    }): Promise<boolean> => {
      if (!user?.id) return false

      try {
        const response = await fetch(`${API_BASE}/experiences/tips`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tip),
        })

        if (!response.ok) throw new Error('Failed to share tip')

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return false
      }
    },
    [user?.id]
  )

  return {
    // State
    experiences,
    selectedExperience,
    prepPlans,
    selectedPlan,
    dailyTasks,
    mockSessions,
    tips,
    stats,
    isLoading,
    error,

    // Methods
    fetchExperiences,
    fetchExperienceDetails,
    createExperience,
    updateExperience,
    fetchDashboardStats,
    fetchPrepPlans,
    createPrepPlan,
    fetchDailyTasks,
    completeTask,
    startMockInterview,
    submitMockInterviewAnswer,
    completeMockInterview,
    fetchTips,
    shareTip,
  }
}
