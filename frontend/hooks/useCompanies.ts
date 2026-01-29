'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import type {
  Company,
  CompanyRole,
  CompanyQuestion,
  UserCompanyProgress,
  CompanyPracticeSession,
} from '@/types/companies'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export function useCompanies() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>([])
  const [companyQuestions, setCompanyQuestions] = useState<CompanyQuestion[]>([])
  const [userProgress, setUserProgress] = useState<UserCompanyProgress | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use actual user ID or test ID for development
  const userId = user?.id || 'test-user-frontend'

  const fetchCompanies = useCallback(
    async (filters?: { industry?: string; search?: string; limit?: number; skip?: number }) => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters?.industry) params.append('industry', filters.industry)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.skip) params.append('skip', filters.skip.toString())

        const response = await fetch(`${API_BASE}/companies?${params}`, {
          headers: { 'x-user-id': userId },
        })

        if (!response.ok) throw new Error('Failed to fetch companies')

        const data = await response.json()
        setCompanies(data.companies || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  const fetchCompanyDetails = useCallback(
    async (companyId: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE}/companies/${companyId}`, {
          headers: { 'x-user-id': userId },
        })

        if (!response.ok) throw new Error('Failed to fetch company details')

        const company = await response.json()
        setSelectedCompany(company)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  const fetchCompanyRoles = useCallback(
    async (companyId: number) => {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE}/companies/${companyId}/roles`, {
          headers: { 'x-user-id': user.id },
        })

        if (!response.ok) throw new Error('Failed to fetch roles')

        const roles = await response.json()
        setCompanyRoles(roles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id]
  )

  const fetchCompanyQuestions = useCallback(
    async (
      companyId: number,
      options?: {
        roleId?: number
        difficulty?: 'Easy' | 'Medium' | 'Hard'
        limit?: number
        skip?: number
      }
    ) => {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (options?.roleId) params.append('roleId', options.roleId.toString())
        if (options?.difficulty) params.append('difficulty', options.difficulty)
        if (options?.limit) params.append('limit', options.limit.toString())
        if (options?.skip) params.append('skip', options.skip.toString())

        const response = await fetch(`${API_BASE}/companies/${companyId}/questions?${params}`, {
          headers: { 'x-user-id': user.id },
        })

        if (!response.ok) throw new Error('Failed to fetch questions')

        const data = await response.json()
        setCompanyQuestions(data.questions || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id]
  )

  const fetchUserProgress = useCallback(
    async (companyId: number) => {
      if (!user?.id) return

      try {
        const response = await fetch(`${API_BASE}/companies/${companyId}/user-progress`, {
          headers: { 'x-user-id': user.id },
        })

        if (!response.ok) throw new Error('Failed to fetch progress')

        const progress = await response.json()
        setUserProgress(progress)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    },
    [user?.id]
  )

  const startPracticeSession = useCallback(
    async (companyId: number, options: {
      roleId?: number
      questionCount: number
      timeLimit?: number
      difficultyFilter?: 'Easy' | 'Medium' | 'Hard' | 'All'
    }): Promise<CompanyPracticeSession | null> => {
      if (!user?.id) return null

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE}/companies/${companyId}/start-practice`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        })

        if (!response.ok) throw new Error('Failed to start practice session')

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

  const submitAnswer = useCallback(
    async (
      companyId: number,
      sessionId: number,
      questionId: number,
      selectedAnswer: string,
      timeTaken?: number
    ): Promise<any | null> => {
      if (!user?.id) return null

      try {
        const response = await fetch(
          `${API_BASE}/companies/${companyId}/sessions/${sessionId}/submit`,
          {
            method: 'POST',
            headers: {
              'x-user-id': user.id,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              questionId,
              selectedAnswer,
              timeTaken,
            }),
          }
        )

        if (!response.ok) throw new Error('Failed to submit answer')

        return await response.json()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [user?.id]
  )

  const completePracticeSession = useCallback(
    async (companyId: number, sessionId: number): Promise<any | null> => {
      if (!user?.id) return null

      try {
        const response = await fetch(
          `${API_BASE}/companies/${companyId}/sessions/${sessionId}/complete`,
          {
            method: 'POST',
            headers: {
              'x-user-id': user.id,
            },
          }
        )

        if (!response.ok) throw new Error('Failed to complete session')

        return await response.json()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [user?.id]
  )

  const shareInterviewTip = useCallback(
    async (companyId: number, tip: {
      roleId?: number
      tipCategory: string
      tipText: string
    }): Promise<boolean> => {
      if (!user?.id) return false

      try {
        const response = await fetch(`${API_BASE}/companies/${companyId}/tips`, {
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

  const fetchTrendingCompanies = useCallback(
    async (limit?: number) => {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (limit) params.append('limit', limit.toString())

        const response = await fetch(`${API_BASE}/companies/trending?${params}`, {
          headers: { 'x-user-id': user.id },
        })

        if (!response.ok) throw new Error('Failed to fetch trending companies')

        const trendingCompanies = await response.json()
        setCompanies(trendingCompanies || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id]
  )

  return {
    // State
    companies,
    selectedCompany,
    companyRoles,
    companyQuestions,
    userProgress,
    isLoading,
    error,

    // Methods
    fetchCompanies,
    fetchCompanyDetails,
    fetchCompanyRoles,
    fetchCompanyQuestions,
    fetchUserProgress,
    startPracticeSession,
    submitAnswer,
    completePracticeSession,
    shareInterviewTip,
    fetchTrendingCompanies,
  }
}
