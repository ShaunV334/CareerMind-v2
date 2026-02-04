'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ArrowLeft, Search, Clock, BookOpen, AlertCircle, CheckCircle2, Play } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface PrepTopic {
  id: string
  name: string
  description: string
  subtopics: string[]
  keyPoints: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedMinutes: number
  videoLinks?: string[]
  isCompleted: boolean
}

export interface InterviewPrepData {
  id: string
  name: string
  industry: string
  totalTopics: number
  totalMinutes: number
  overallProgress: number
  categories: {
    name: string
    topics: PrepTopic[]
  }[]
  mockInterviewCount: number
  mockInterviewsCompleted: number
}

interface InterviewPrepViewProps {
  companyId: string
  mockData: InterviewPrepData
}

export default function InterviewPrepView({
  companyId,
  mockData,
}: InterviewPrepViewProps) {
  const [data, setData] = useState<InterviewPrepData | null>(mockData)
  const [loading, setLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    mockData.categories.map((cat) => cat.name)
  )
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchPrepGuide = async () => {
      try {
        setLoading(true)
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
        const response = await fetch(`${API_BASE}/companies/${companyId}/interview-prep`)

        if (response.ok) {
          const prepData = await response.json()
          setData(prepData)
          setExpandedCategories(prepData.categories.map((cat: any) => cat.name))
        }
      } catch (err) {
        console.log('Using mock data (backend fetch failed)', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrepGuide()
  }, [companyId])

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Loading...
          </h1>
        </div>
      </div>
    )
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    )
  }

  const allTopics = data.categories.flatMap((cat) => cat.topics)

  const filteredTopics = allTopics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.subtopics.some((sub) =>
        sub.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      topic.keyPoints.some((point) =>
        point.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const showSearchResults = searchQuery.trim().length > 0
  const visibleTopics = showSearchResults ? filteredTopics : allTopics

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  }

  const getDifficultyBgColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900'
      case 'Medium':
        return 'from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900'
      case 'Hard':
        return 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
      default:
        return 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard/interview-prep">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Interview Prep
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {data.name} Interview Preparation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete guide to prepare for {data.name} interviews. {data.totalTopics} topics
            covering behavioral, technical, and company-specific questions.
          </p>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Overall Progress
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.overallProgress}%
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Topics Completed
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {allTopics.filter((t) => t.isCompleted).length}/{data.totalTopics}
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Est. Time Left
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {Math.round(
                    (allTopics.reduce((sum, t) => sum + t.estimatedMinutes, 0) / 60) *
                      (1 - data.overallProgress / 100)
                  )}h
                </p>
              </div>
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Mock Interviews
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {data.mockInterviewsCompleted}/{data.mockInterviewCount}
                </p>
              </div>
              <Play className="w-12 h-12 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search topics, questions, key points..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
            />
          </div>
          {showSearchResults && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Found {filteredTopics.length} topic(s)
            </p>
          )}
        </div>

        {/* Topics - Search Results View */}
        {showSearchResults ? (
          <div className="space-y-4">
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <Card
                  key={topic.id}
                  className={`p-6 bg-gradient-to-r ${getDifficultyBgColor(topic.difficulty)} border border-gray-200 dark:border-gray-700 hover:shadow-lg transition`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {topic.name}
                        </h3>
                        {topic.isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {topic.description}
                      </p>
                    </div>
                    <Badge className={`${getDifficultyColor(topic.difficulty)} ml-4`}>
                      {topic.difficulty}
                    </Badge>
                  </div>

                  {/* Key Points */}
                  {topic.keyPoints.length > 0 && (
                    <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Key Points:
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                        {topic.keyPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                        {topic.keyPoints.length > 3 && (
                          <li>+{topic.keyPoints.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Subtopics */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {topic.subtopics.map((subtopic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {subtopic}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                    Study Topic
                  </Button>
                </Card>
              ))
            ) : (
              <Card className="p-8 bg-white dark:bg-gray-900 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No topics found matching your search.
                </p>
              </Card>
            )}
          </div>
        ) : (
          /* Categories View */
          <div className="space-y-6">
            {data.categories.map((category) => (
              <div key={category.name}>
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h2>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                      expandedCategories.includes(category.name) ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedCategories.includes(category.name) && (
                  <div className="mt-4 space-y-4 pl-4">
                    {category.topics.map((topic) => (
                      <Card
                        key={topic.id}
                        className={`p-6 bg-gradient-to-r ${getDifficultyBgColor(topic.difficulty)} border border-gray-200 dark:border-gray-700 hover:shadow-lg transition`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {topic.name}
                              </h3>
                              {topic.isCompleted && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                              {topic.description}
                            </p>
                          </div>
                          <Badge className={`${getDifficultyColor(topic.difficulty)} ml-4`}>
                            {topic.difficulty}
                          </Badge>
                        </div>

                        {/* Key Points */}
                        {topic.keyPoints.length > 0 && (
                          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Key Points:
                            </p>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                              {topic.keyPoints.slice(0, 2).map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                              {topic.keyPoints.length > 2 && (
                                <li>+{topic.keyPoints.length - 2} more</li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Subtopics */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {topic.subtopics.map((subtopic, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {subtopic}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              Est. Time
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {Math.ceil(topic.estimatedMinutes / 5) * 5}m
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              Status
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {topic.isCompleted ? '✓ Done' : 'To Do'}
                            </p>
                          </div>
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                          Study Topic
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mock Interview Section */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <Play className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Practice with AI Mock Interviews
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Take {data.mockInterviewCount} AI-powered mock interviews tailored to {data.name}'s
                interview style. Get real-time feedback, question evaluation, and improvement suggestions.
              </p>
              <Link href={`/dashboard/interview-prep/${companyId}/mock`}>
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white">
                  Start Mock Interview
                  <Play className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Preparation Tips */}
        <Card className="mt-6 p-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Preparation Tips for {data.name}
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                <li>
                  <strong>Start with Basics:</strong> Begin with foundational topics to build
                  confidence
                </li>
                <li>
                  <strong>Study Behavioral:</strong> {data.name} heavily focuses on behavioral
                  questions
                </li>
                <li>
                  <strong>Practice Regularly:</strong> Dedicate 1-2 hours daily for consistent
                  progress
                </li>
                <li>
                  <strong>Take Mock Interviews:</strong> Practice with realistic interview
                  scenarios
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
