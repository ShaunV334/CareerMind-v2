'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronRight, BookOpen, Search, Briefcase } from 'lucide-react'

interface CompanySyllabus {
  id: string
  name: string
  industry: string
  location: string
  syllabusCoverage: string[]
  totalTopics: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  lastUpdated: string
  completionRate: number
  logo?: string
}

export default function SyllabusPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const companies: CompanySyllabus[] = [
    {
      id: 'google',
      name: 'Google',
      industry: 'Technology',
      location: 'Mountain View, CA',
      syllabusCoverage: ['DSA', 'System Design', 'Algorithms', 'Database'],
      totalTopics: 48,
      difficulty: 'Hard',
      lastUpdated: '2024-01-15',
      completionRate: 35,
    },
    {
      id: 'amazon',
      name: 'Amazon',
      industry: 'Technology',
      location: 'Seattle, WA',
      syllabusCoverage: ['DSA', 'Trees & Graphs', 'Dynamic Programming', 'Arrays'],
      totalTopics: 45,
      difficulty: 'Hard',
      lastUpdated: '2024-01-10',
      completionRate: 28,
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      industry: 'Technology',
      location: 'Redmond, WA',
      syllabusCoverage: ['Data Structures', 'Algorithms', 'OOP', 'Cloud Concepts'],
      totalTopics: 42,
      difficulty: 'Hard',
      lastUpdated: '2024-01-12',
      completionRate: 40,
    },
    {
      id: 'accenture',
      name: 'Accenture',
      industry: 'Consulting',
      location: 'Multiple',
      syllabusCoverage: ['Core Java', 'SQL', 'Aptitude', 'Communication'],
      totalTopics: 35,
      difficulty: 'Medium',
      lastUpdated: '2024-01-08',
      completionRate: 55,
    },
    {
      id: 'tcs',
      name: 'TCS',
      industry: 'IT Services',
      location: 'Mumbai, India',
      syllabusCoverage: ['C++', 'Java', 'SQL', 'Aptitude'],
      totalTopics: 38,
      difficulty: 'Medium',
      lastUpdated: '2024-01-14',
      completionRate: 60,
    },
    {
      id: 'infosys',
      name: 'Infosys',
      industry: 'IT Services',
      location: 'Bangalore, India',
      syllabusCoverage: ['Java', 'SQL', 'Web Technologies', 'Aptitude'],
      totalTopics: 36,
      difficulty: 'Medium',
      lastUpdated: '2024-01-11',
      completionRate: 50,
    },
  ]

  useEffect(() => {
    setLoading(false)
  }, [])

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = !filterIndustry || company.industry === filterIndustry

    return matchesSearch && matchesIndustry
  })

  const industries = Array.from(new Set(companies.map((c) => c.industry)))

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Company Syllabuses</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Explore detailed syllabus and interview preparation guides for top companies
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Industry Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterIndustry(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterIndustry === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setFilterIndustry(industry)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterIndustry === industry
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Companies</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-200">{companies.length}</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Topics</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-200">
              {companies.reduce((sum, c) => sum + c.totalTopics, 0)}
            </p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Companies Filtered</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-200">{filteredCompanies.length}</p>
          </div>
        </Card>
      </div>

      {/* Companies Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Syllabuses</h2>
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/dashboard/syllabus/${company.id}`)}
              >
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{company.industry}</p>
                    </div>
                    <Badge className={getDifficultyColor(company.difficulty)}>
                      {company.difficulty}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {company.location}
                  </p>
                </div>

                {/* Syllabus Coverage */}
                <div className="my-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Topics Covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {company.syllabusCoverage.slice(0, 3).map((topic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {company.syllabusCoverage.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{company.syllabusCoverage.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 my-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Topics</span>
                    <span className="font-bold">{company.totalTopics}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Your Progress</span>
                    <span className="font-bold text-blue-600">{company.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${company.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Last Updated */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Updated: {new Date(company.lastUpdated).toLocaleDateString()}
                </p>

                {/* Button */}
                <Button className="w-full mt-4" onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/dashboard/syllabus/${company.id}`)
                }}>
                  View Syllabus <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No companies found matching your filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setFilterIndustry(null)
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Info Section */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900 dark:to-blue-900">
        <div className="space-y-3">
          <h3 className="text-lg font-bold">💡 How to Use Syllabuses</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>✓ Review company syllabuses to understand what topics are tested</li>
            <li>✓ Track your progress with the completion percentage</li>
            <li>✓ Click on a company to explore detailed topics and practice questions</li>
            <li>✓ Use syllabuses to create a structured study plan</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
