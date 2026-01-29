'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useInterviewExperiences } from '@/hooks/useExperiences'
import type { InterviewExperience } from '@/types/experiences'

export default function InterviewsPage() {
  const router = useRouter()
  const { fetchExperiences, fetchDashboardStats, experiences, stats, isLoading } =
    useInterviewExperiences()
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail'>('all')

  useEffect(() => {
    fetchExperiences({
      outcome: filter === 'all' ? undefined : filter.toUpperCase(),
    })
    fetchDashboardStats()
  }, [filter])

  const handleSelectExperience = (experienceId: string) => {
    router.push(`/dashboard/interviews/${experienceId}`)
  }

  const handleNewExperience = () => {
    router.push('/dashboard/interviews/new')
  }

  const handleCreatePrepPlan = () => {
    router.push('/dashboard/interviews/prep-plan/new')
  }

  const filteredExperiences = experiences.filter((exp) => {
    if (filter === 'all') return true
    return exp.outcome?.toLowerCase() === filter
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Interview Experiences & Prep</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your interviews, build preparation plans, and learn from community insights
        </p>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Total Interviews
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-200">
                {stats.totalInterviews}
              </p>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-200">
                {stats.successRate?.toFixed(1) || 0}%
              </p>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Companies Interviewed
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-200">
                {stats.companiesInterviewed}
              </p>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Avg Difficulty
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-200">
                {stats.avgDifficulty?.toFixed(1) || 0}/5
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={handleNewExperience} className="bg-blue-600 hover:bg-blue-700">
          + Log New Interview
        </Button>
        <Button onClick={handleCreatePrepPlan} variant="outline">
          📋 Create Prep Plan
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {['all', 'pass', 'fail'].map((f) => (
            <Badge
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => setFilter(f as any)}
            >
              {f}
            </Badge>
          ))}
        </div>
      </div>

      {/* Experiences List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {filter === 'all'
            ? 'All Interviews'
            : `${filter.toUpperCase()} Interviews`}{' '}
          ({filteredExperiences.length})
        </h2>

        {isLoading ? (
          <div className="text-center py-8">Loading experiences...</div>
        ) : filteredExperiences.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No interview experiences yet</p>
            <Button onClick={handleNewExperience}>Log Your First Interview</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredExperiences.map((exp: InterviewExperience) => (
              <Card
                key={exp._id || exp.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectExperience(exp._id || exp.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">
                        {typeof exp.companyId === 'string'
                          ? exp.companyId
                          : exp.companyId?.name || 'Unknown Company'}
                      </h3>
                      <Badge
                        variant={
                          exp.outcome === 'Pass' ? 'default' : 'destructive'
                        }
                      >
                        {exp.outcome}
                      </Badge>
                      <Badge variant="outline">{exp.interviewType}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        Round {exp.interviewRound} •{' '}
                        {new Date(exp.interviewDate).toLocaleDateString()}
                      </p>
                      {exp.feedback && (
                        <p className="mt-2 italic">&quot;{exp.feedback}&quot;</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {exp.difficultyRating && (
                      <p className="text-sm font-semibold text-orange-600">
                        Difficulty: {exp.difficultyRating.toFixed(1)}/5
                      </p>
                    )}
                    {exp.experienceRating && (
                      <p className="text-sm font-semibold text-green-600">
                        Rating: {exp.experienceRating.toFixed(1)}/5
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
