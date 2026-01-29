'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCompanies } from '@/hooks/useCompanies'
import { Input } from '@/components/ui/input'
import type { Company } from '@/types/companies'

export default function CompaniesPage() {
  const router = useRouter()
  const { fetchCompanies, companies, isLoading, error } = useCompanies()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)

  useEffect(() => {
    // Always fetch with current filters
    fetchCompanies({
      search: searchQuery || undefined,
      industry: selectedIndustry || undefined,
    })
  }, [searchQuery, selectedIndustry, fetchCompanies])

  const handleSelectCompany = (companyId: string) => {
    router.push(`/dashboard/companies/${companyId}`)
  }

  const handleStartPractice = (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation()
    router.push(`/dashboard/companies/${companyId}/practice`)
  }

  const industries = ['Technology', 'Finance', 'Healthcare', 'Consulting', 'Retail']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Company-Specific Preparation</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Practice with company-specific questions, tips, and insights from real interviews
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />

        <div className="flex gap-2 flex-wrap">
          {industries.map((industry) => (
            <Badge
              key={industry}
              variant={selectedIndustry === industry ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() =>
                setSelectedIndustry(selectedIndustry === industry ? null : industry)
              }
            >
              {industry}
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Total Companies
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-200">
              {companies.length}
            </p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              FAANG Companies
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-200">
              {companies.filter((c) => ['Google', 'Amazon', 'Apple', 'Meta', 'Microsoft'].includes(c.name)).length}
            </p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Avg Difficulty
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-200">
              {(
                companies.reduce((sum, c) => sum + (c.difficultyRating || 0), 0) / companies.length
              ).toFixed(1)}
            </p>
          </div>
        </Card>
      </div>

      {/* Companies Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Browse Companies</h2>
        {error && (
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded text-red-800 dark:text-red-200">
            Error: {error}
          </div>
        )}
        {isLoading ? (
          <div className="text-center py-8">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No companies found. Try adjusting your search filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company: Company) => (
              <Card
                key={company._id || company.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                onClick={() => handleSelectCompany(company._id || company.id)}
              >
                <div className="p-6 space-y-4">
                  {/* Company Name & Industry */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </h3>
                    <Badge variant="secondary">{company.industry}</Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {company.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Founded</p>
                      <p className="font-semibold">{company.foundedYear}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Difficulty</p>
                      <p className="font-semibold text-orange-600">
                        {company.difficultyRating?.toFixed(1)}/5
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Questions</p>
                      <p className="font-semibold">{company.questionCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Interviews</p>
                      <p className="font-semibold">{company.interviewCount || 0}</p>
                    </div>
                  </div>

                  {/* Headquarters */}
                  <div className="text-xs text-gray-500">
                    📍 {company.headquarters}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={(e) => handleStartPractice(e, company._id || company.id)}
                    className="w-full mt-4"
                  >
                    Start Practice
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
