'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ArrowLeft, Search, Clock, BookOpen, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface Topic {
  id: string
  name: string
  description: string
  subtopics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  questionCount: number
  completedQuestions: number
  estimatedHours: number
  isCompleted: boolean
}

export interface CompanyData {
  id: string
  name: string
  industry: string
  totalTopics: number
  totalHours: number
  overallProgress: number
  categories: {
    name: string
    topics: Topic[]
  }[]
}

interface CompanySyllabusViewProps {
  companyId: string
  mockData: CompanyData
}

export default function CompanySyllabusView({
  companyId,
  mockData,
}: CompanySyllabusViewProps) {
  const [data, setData] = useState<CompanyData | null>(mockData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    mockData.categories.map((cat) => cat.name)
  )
  const [searchQuery, setSearchQuery] = useState('')

  // Try to fetch from backend, fallback to mock data
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        setLoading(true)
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
        const response = await fetch(`${API_BASE}/companies/${companyId}/syllabus`)
        
        if (response.ok) {
          const syllabus = await response.json()
          setData(syllabus)
          setExpandedCategories(syllabus.categories.map((cat: any) => cat.name))
        } else {
          console.log('Using mock data (backend syllabus not found)')
          // Keep using mock data
        }
      } catch (err) {
        console.log('Using mock data (backend fetch failed)', err)
        // Keep using mock data - don't set error
      } finally {
        setLoading(false)
      }
    }

    fetchSyllabus()
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

  // Flatten all topics for search
  const allTopics = data.categories.flatMap((cat) => cat.topics)

  // Search filtering
  const filteredTopics = allTopics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.subtopics.some((sub) =>
        sub.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  // Show search results or categorized view
  const showSearchResults = searchQuery.trim().length > 0
  const visibleTopics = showSearchResults
    ? filteredTopics
    : allTopics

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
        <Link href="/dashboard/syllabus">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Syllabus
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {data.name} Interview Preparation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Master the interview syllabus for {data.name}. {data.totalTopics} topics
            covering all key areas.
          </p>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  Questions Completed
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {allTopics.reduce((sum, t) => sum + t.completedQuestions, 0)}/
                  {allTopics.reduce((sum, t) => sum + t.questionCount, 0)}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Estimated Hours Remaining
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {Math.round(
                    allTopics.reduce((sum, t) => sum + t.estimatedHours, 0) *
                      (1 - data.overallProgress / 100)
                  )}h
                </p>
              </div>
              <Clock className="w-12 h-12 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search topics, subtopics..."
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
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {topic.name}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {topic.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {topic.subtopics.map((subtopic, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {subtopic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className={`${getDifficultyColor(topic.difficulty)} ml-4`}>
                      {topic.difficulty}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Questions
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {topic.completedQuestions}/{topic.questionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Est. Hours
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {topic.estimatedHours}h
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Progress
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {Math.round(
                          (topic.completedQuestions / topic.questionCount) * 100
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(topic.completedQuestions / topic.questionCount) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                    Practice Questions
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
                      expandedCategories.includes(category.name)
                        ? 'rotate-180'
                        : ''
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              {topic.name}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                              {topic.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {topic.subtopics.map((subtopic, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {subtopic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge
                            className={`${getDifficultyColor(topic.difficulty)} ml-4 whitespace-nowrap`}
                          >
                            {topic.difficulty}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 my-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              Questions
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {topic.completedQuestions}/{topic.questionCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              Est. Hours
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {topic.estimatedHours}h
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              Progress
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {Math.round(
                                (topic.completedQuestions /
                                  topic.questionCount) *
                                  100
                              )}
                              %
                            </p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(topic.completedQuestions / topic.questionCount) * 100}%`,
                            }}
                          ></div>
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                          Practice Questions
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Study Path Recommendations */}
        {!showSearchResults && (
          <Card className="mt-12 p-8 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Recommended Study Path
                </h3>
                <ol className="text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
                  <li>
                    Start with <strong>Data Structures</strong> - Foundation for all coding
                    problems
                  </li>
                  <li>
                    Move to <strong>Algorithms</strong> - Learn sorting, searching, and
                    dynamic programming
                  </li>
                  <li>
                    Master <strong>System Design</strong> - Required for senior-level
                    interviews
                  </li>
                  <li>
                    Practice with <strong>Mock Interviews</strong> - Simulate real interview
                    scenarios
                  </li>
                </ol>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
