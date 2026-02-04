'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react'

interface QuestionFeedback {
  question: string
  answer: string
  feedback: string
  index: number
}

export default function InterviewResultsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const companyId = (params.companyId as string).toLowerCase()
  
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const score = searchParams.get('score')
  const duration = searchParams.get('duration')
  const sessionId = searchParams.get('sessionId')

  useEffect(() => {
    if (!sessionId) {
      setError('No session data found')
      setLoading(false)
      return
    }

    const fetchSessionData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/interview/mock/${sessionId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch session data')
        }

        const data = await response.json()
        setSessionData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [sessionId])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50'
    if (score >= 60) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500' }
    if (score >= 80) return { level: 'Good', color: 'bg-blue-500' }
    if (score >= 70) return { level: 'Satisfactory', color: 'bg-yellow-500' }
    if (score >= 60) return { level: 'Needs Improvement', color: 'bg-orange-500' }
    return { level: 'Below Average', color: 'bg-red-500' }
  }

  const extractQuestionsAndFeedback = (): QuestionFeedback[] => {
    if (!sessionData?.messages) return []

    const questions: QuestionFeedback[] = []
    let currentQuestion = ''
    let currentAnswer = ''
    let questionIndex = 0

    // Parse messages to extract Q&A pairs
    for (let i = 0; i < sessionData.messages.length; i++) {
      const msg = sessionData.messages[i]
      const nextMsg = sessionData.messages[i + 1]

      // Identify assistant questions (longer than typical feedback, ends with ?)
      if (
        msg.role === 'assistant' &&
        msg.content &&
        msg.content.includes('?') &&
        msg.content.length < 1000
      ) {
        // If we have a previous question, save it with any feedback
        if (currentQuestion && currentAnswer) {
          // Look for feedback from assistant after this answer
          let feedback = ''
          for (let j = i - 1; j >= 0; j--) {
            if (sessionData.messages[j].role === 'assistant' && j > 0) {
              const prevUserMsg = sessionData.messages[j - 1]
              if (prevUserMsg?.role === 'user' && prevUserMsg.content === currentAnswer) {
                feedback = sessionData.messages[j].content
                break
              }
            }
          }

          questions.push({
            question: currentQuestion,
            answer: currentAnswer,
            feedback,
            index: questionIndex,
          })
          questionIndex++
          currentAnswer = ''
        }
        currentQuestion = msg.content
      }
      // User answers/responses
      else if (msg.role === 'user' && msg.type !== 'question') {
        currentAnswer = msg.content
      }
    }

    // Add the last Q&A pair if exists
    if (currentQuestion && currentAnswer) {
      questions.push({
        question: currentQuestion,
        answer: currentAnswer,
        feedback: '',
        index: questionIndex,
      })
    }

    return questions
  }

  const scoreValue = parseInt(score || '0')
  const durationMinutes = Math.floor(parseInt(duration || '0') / 60000)
  const durationSeconds = Math.floor((parseInt(duration || '0') % 60000) / 1000)
  const questionsAnswered = sessionData?.messages?.filter((m: any) => m.role === 'user').length || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const performance = getPerformanceLevel(scoreValue)
  const questionsData = extractQuestionsAndFeedback()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Interview Results</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Detailed feedback for your {companyId.charAt(0).toUpperCase() + companyId.slice(1)} mock interview
          </p>
        </div>

        {/* Score Card */}
        <Card className={`mb-8 border-2 ${getScoreBgColor(scoreValue)} dark:border-slate-700`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="dark:text-slate-50">Your Performance</CardTitle>
                <CardDescription className="dark:text-slate-400">Overall interview evaluation</CardDescription>
              </div>
              <Badge className={`${performance.color} text-white text-lg px-4 py-2`}>
                {performance.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Score */}
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(scoreValue)} mb-2`}>
                  {scoreValue}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Final Score</p>
                <p className="text-2xl text-slate-400 dark:text-slate-500">/100</p>
              </div>

              {/* Questions Answered */}
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">{questionsAnswered}</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Questions Answered</p>
              </div>

              {/* Duration */}
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {durationMinutes}:{durationSeconds.toString().padStart(2, '0')}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Time Taken</p>
              </div>

              {/* Analysis */}
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {((scoreValue / 100) * 100).toFixed(0)}%
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Proficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Tabs defaultValue="summary" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 dark:bg-slate-800">
            <TabsTrigger value="summary" className="dark:data-[state=active]:bg-slate-700">Summary</TabsTrigger>
            <TabsTrigger value="questions" className="dark:data-[state=active]:bg-slate-700">Questions & Feedback</TabsTrigger>
            <TabsTrigger value="tips" className="dark:data-[state=active]:bg-slate-700">Improvement Tips</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-slate-50">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scoreValue >= 80 && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        <strong>Strengths:</strong> You demonstrated strong technical knowledge and provided clear
                        answers. Your communication was effective.
                      </AlertDescription>
                    </Alert>
                  )}
                  {scoreValue >= 60 && scoreValue < 80 && (
                    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                      <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        <strong>Progress:</strong> You're on the right track. With some refinement in depth and
                        specificity, you'll excel in interviews.
                      </AlertDescription>
                    </Alert>
                  )}
                  {scoreValue < 60 && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <strong>Focus Areas:</strong> Consider practicing more on core concepts and structuring your
                        answers better.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      <strong>Interview Metrics:</strong>
                    </p>
                    <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                      <li>• Total Questions: {questionsAnswered}</li>
                      <li>• Avg Time/Question: {questionsAnswered > 0 ? Math.round(parseInt(duration || '0') / questionsAnswered / 1000) : 0}s</li>
                      <li>• Company: {companyId.charAt(0).toUpperCase() + companyId.slice(1)}</li>
                      <li>• Date: {new Date().toLocaleDateString()}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <div className="space-y-4">
              {questionsData.length > 0 ? (
                questionsData.map((item, idx) => (
                  <Card key={idx} className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="dark:border-slate-600 dark:text-slate-300">Question {item.index + 1}</Badge>
                          </div>
                          <CardTitle className="text-lg dark:text-slate-50">{item.question}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Your Answer:</p>
                        <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                          {item.answer}
                        </p>
                      </div>

                      {item.feedback && (
                        <div>
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Feedback:</p>
                          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-blue-800 dark:text-blue-200">{item.feedback}</AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-600 dark:text-slate-400 text-center">No detailed feedback available yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-slate-50">Personalized Improvement Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scoreValue >= 80 && (
                    <>
                      <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                        <div className="text-2xl">🎯</div>
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-200">Maintain Excellence</p>
                          <p className="text-sm text-green-800 dark:text-green-300">
                            You're performing well. Focus on staying updated with latest technologies and best
                            practices in your field.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900">
                        <div className="text-2xl">📚</div>
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-200">Deep Dive Learning</p>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            Practice explaining complex concepts in simpler terms. This helps in both interviews and
                            real-world communication.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {scoreValue >= 60 && scoreValue < 80 && (
                    <>
                      <div className="flex gap-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-900">
                        <div className="text-2xl">🔍</div>
                        <div>
                          <p className="font-semibold text-yellow-900 dark:text-yellow-200">Specificity Matters</p>
                          <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            Add real examples from your experience. Use the STAR method (Situation, Task, Action,
                            Result) for behavioral questions.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-900">
                        <div className="text-2xl">🗣️</div>
                        <div>
                          <p className="font-semibold text-purple-900 dark:text-purple-200">Practice Articulation</p>
                          <p className="text-sm text-purple-800 dark:text-purple-300">
                            Record yourself answering questions. Listen back to identify areas where you can be
                            clearer or more concise.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {scoreValue < 60 && (
                    <>
                      <div className="flex gap-4 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
                        <div className="text-2xl">📖</div>
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-200">Foundation Building</p>
                          <p className="text-sm text-red-800 dark:text-red-300">
                            Focus on core concepts and fundamentals. Review company-specific technologies and
                            frameworks they use.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-900">
                        <div className="text-2xl">⏱️</div>
                        <div>
                          <p className="font-semibold text-orange-900 dark:text-orange-200">Time Management</p>
                          <p className="text-sm text-orange-800 dark:text-orange-300">
                            Take 10-15 seconds to understand the question fully. Structure your answer before
                            speaking.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-900">
                    <div className="text-2xl">🔄</div>
                    <div>
                      <p className="font-semibold text-indigo-900 dark:text-indigo-200">Practice Again</p>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">
                        Try another mock interview with the same or different company to track your progress.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() =>
              router.push(`/dashboard/interview-prep/${companyId}`)
            }
            variant="outline"
            size="lg"
          >
            Back to Interview Prep
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/interview-prep/${companyId}/mock`)}
            size="lg"
            className="gap-2"
          >
            Try Another Mock Interview <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
