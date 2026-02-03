'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Briefcase,
  TrendingUp,
  Clock,
  Users,
  ChevronRight,
  Filter,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  prepTopics: string[]
  estimatedHours: number
  completedTopics: number
  totalTopics: number
  progress: number
  mockInterviews: number
  lastUpdated: string
}

const companies: Company[] = [
  {
    id: 'google',
    name: 'Google',
    difficulty: 'Hard',
    prepTopics: ['System Design', 'Behavioral', 'Technical Deep Dives', 'Case Studies'],
    estimatedHours: 40,
    completedTopics: 8,
    totalTopics: 24,
    progress: 33,
    mockInterviews: 0,
    lastUpdated: '2 days ago',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    difficulty: 'Hard',
    prepTopics: ['Leadership Principles', 'System Design', 'Mock Interviews'],
    estimatedHours: 35,
    completedTopics: 5,
    totalTopics: 20,
    progress: 25,
    mockInterviews: 0,
    lastUpdated: '5 days ago',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    difficulty: 'Medium',
    prepTopics: ['Problem Solving', 'System Design', 'Interview Q&A'],
    estimatedHours: 32,
    completedTopics: 0,
    totalTopics: 18,
    progress: 0,
    mockInterviews: 0,
    lastUpdated: '1 week ago',
  },
  {
    id: 'accenture',
    name: 'Accenture',
    difficulty: 'Medium',
    prepTopics: ['Behavioral', 'Technical', 'Case Studies'],
    estimatedHours: 25,
    completedTopics: 0,
    totalTopics: 15,
    progress: 0,
    mockInterviews: 0,
    lastUpdated: '1 week ago',
  },
  {
    id: 'tcs',
    name: 'TCS',
    difficulty: 'Easy',
    prepTopics: ['Technical Basics', 'Behavioral'],
    estimatedHours: 20,
    completedTopics: 0,
    totalTopics: 12,
    progress: 0,
    mockInterviews: 0,
    lastUpdated: '1 week ago',
  },
  {
    id: 'infosys',
    name: 'Infosys',
    difficulty: 'Easy',
    prepTopics: ['Core Concepts', 'Interview Tips'],
    estimatedHours: 22,
    completedTopics: 0,
    totalTopics: 14,
    progress: 0,
    mockInterviews: 0,
    lastUpdated: '1 week ago',
  },
]

export default function InterviewPrepPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  const difficulties = ['Easy', 'Medium', 'Hard']

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.prepTopics.some((topic) =>
        topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesDifficulty = !selectedDifficulty || company.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800'
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
        return 'from-gray-50 to-gray-100'
    }
  }

  const stats = {
    totalCompanies: companies.length,
    startedCompanies: companies.filter((c) => c.progress > 0).length,
    totalPrepTopics: companies.reduce((sum, c) => sum + c.totalTopics, 0),
    estimatedTotalHours: companies.reduce((sum, c) => sum + c.estimatedHours, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Interview Preparation Guide
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Company-specific interview preparation with mock interviews and detailed guides.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Total Companies
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalCompanies}
                </p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Started
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.startedCompanies}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Total Topics
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalPrepTopics}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Est. Hours
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.estimatedTotalHours}h
                </p>
              </div>
              <Clock className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search companies, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDifficulty === null ? 'default' : 'outline'}
              onClick={() => setSelectedDifficulty(null)}
              className="text-sm"
            >
              All Levels
            </Button>
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty(difficulty)}
                className="text-sm"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Link key={company.id} href={`/dashboard/interview-prep/${company.id}`}>
              <Card
                className={`h-full p-6 bg-gradient-to-br ${getDifficultyBgColor(company.difficulty)} border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer group`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {company.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Interview Preparation
                    </p>
                  </div>
                  <Badge className={getDifficultyColor(company.difficulty)}>
                    {company.difficulty}
                  </Badge>
                </div>

                {/* Topics */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">
                    Prep Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {company.prepTopics.slice(0, 3).map((topic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {company.prepTopics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{company.prepTopics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-300 dark:border-gray-600">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Topics
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {company.completedTopics}/{company.totalTopics}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Est. Hours
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {company.estimatedHours}h
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Progress
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {company.progress}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${company.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Last Updated */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Updated {company.lastUpdated}
                </p>

                {/* Action Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white group-hover:shadow-md transition">
                  View Prep Guide
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <Card className="p-12 bg-white dark:bg-gray-900 text-center border border-gray-200 dark:border-gray-700">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No companies found matching your search.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Try adjusting your filters or search query.
            </p>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-12 p-8 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                How to Use Interview Prep
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                <li>
                  <strong>Select a Company:</strong> Choose from 6 major companies with detailed
                  interview guides
                </li>
                <li>
                  <strong>Learn Topics:</strong> Study company-specific topics in order of
                  importance
                </li>
                <li>
                  <strong>Take Mock Interviews:</strong> Practice with AI-powered mock
                  interviews
                </li>
                <li>
                  <strong>Track Progress:</strong> Monitor your preparation journey with detailed
                  analytics
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
