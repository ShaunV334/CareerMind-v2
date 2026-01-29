'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAptitude } from '@/hooks/useAptitude'
import { ChevronRight, ChevronLeft, Bookmark, BookmarkCheck, Clock, AlertCircle, BarChart3 } from 'lucide-react'

interface Question {
  id: string
  text: string
  data?: string // ASCII representation of chart/table
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  timeLimit: number
  topic: string
}

export default function DataInterpretationPage() {
  const router = useRouter()
  const { fetchQuestions } = useAptitude()
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)

  // Sample data interpretation questions
  const sampleQuestions: Question[] = [
    {
      id: '1',
      text: 'Based on the sales data below:\n\nQuarter | Sales (in lakhs)\n Q1     | 50\n Q2     | 75\n Q3     | 60\n Q4     | 90\n\nWhat is the average sales across all quarters?',
      options: [
        '68.75 lakhs',
        '70 lakhs',
        '72.5 lakhs',
        '75 lakhs'
      ],
      correctAnswer: '68.75 lakhs',
      explanation: 'Total sales = 50 + 75 + 60 + 90 = 275 lakhs. Average = 275 ÷ 4 = 68.75 lakhs.',
      difficulty: 'Easy',
      timeLimit: 60,
      topic: 'Table Analysis',
    },
    {
      id: '2',
      text: 'Study the following data:\n\nProduct Distribution (%)\nProduct A: 30%\nProduct B: 25%\nProduct C: 20%\nProduct D: 15%\nProduct E: 10%\n\nIf total revenue is 100 crores, what is the revenue from Product A and Product B combined?',
      options: [
        '45 crores',
        '50 crores',
        '55 crores',
        '60 crores'
      ],
      correctAnswer: '55 crores',
      explanation: 'Product A = 30% of 100 = 30 crores. Product B = 25% of 100 = 25 crores. Combined = 30 + 25 = 55 crores.',
      difficulty: 'Easy',
      timeLimit: 45,
      topic: 'Percentage Calculation',
    },
    {
      id: '3',
      text: 'The following table shows employee count by department:\n\nDepartment | 2022 | 2023\nIT         | 150  | 180\nHR         | 50   | 55\nFinance    | 80   | 95\nSales      | 120  | 145\n\nWhich department showed the highest growth rate?',
      options: [
        'IT (20%)',
        'HR (10%)',
        'Finance (18.75%)',
        'Sales (20.83%)'
      ],
      correctAnswer: 'Sales (20.83%)',
      explanation: 'Growth rates: IT = (180-150)/150 = 20%, HR = (55-50)/50 = 10%, Finance = (95-80)/80 = 18.75%, Sales = (145-120)/120 = 20.83%. Sales has the highest at 20.83%.',
      difficulty: 'Hard',
      timeLimit: 120,
      topic: 'Growth Rate Analysis',
    },
    {
      id: '4',
      text: 'Company profit distribution across regions:\n\nNorth: 35%\nSouth: 25%\nEast: 20%\nWest: 15%\nNortheast: 5%\n\nIf North and South together contributed 12 crores profit, what is the total profit?',
      options: [
        '18 crores',
        '20 crores',
        '24 crores',
        '30 crores'
      ],
      correctAnswer: '24 crores',
      explanation: 'North + South = 35% + 25% = 60% of total profit. If 60% = 12 crores, then total = 12 ÷ 0.60 = 20 crores. Wait, let me recalculate: If North + South = 12 crores and they represent 60%, then 12 ÷ 0.60 = 20 crores. Actually the answer should be 20. Let me verify: 60% of 20 = 12. But the answer says 24. Let me recalculate with 24: 60% of 24 = 14.4. So it\'s 20 crores.',
      correctAnswer: '20 crores',
      explanation: 'North + South = 35% + 25% = 60% of total profit. If this equals 12 crores, then total profit = 12 ÷ 0.60 = 20 crores.',
      difficulty: 'Medium',
      timeLimit: 75,
      topic: 'Proportion Analysis',
    },
    {
      id: '5',
      text: 'Monthly website traffic trend:\n\nMonth  | Users\nJan    | 10,000\nFeb    | 12,500\nMar    | 15,000\nApr    | 18,750\nMay    | 23,438\n\nWhat is the approximate month-on-month growth rate?',
      options: [
        '20%',
        '22%',
        '25%',
        '30%'
      ],
      correctAnswer: '25%',
      explanation: 'Growth is compounded. Jan to Feb: 25% growth (12.5K/10K). Feb to Mar: 20% growth. Mar to Apr: 25% growth. Apr to May: 25% growth. The approximate consistent growth rate is 25%.',
      difficulty: 'Hard',
      timeLimit: 90,
      topic: 'Trend Analysis',
    },
  ]

  useEffect(() => {
    setQuestions(sampleQuestions)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading && !answered && currentQuestion) {
      setTimeRemaining(currentQuestion.timeLimit)
    }
  }, [currentIndex, loading, answered])

  useEffect(() => {
    if (timeRemaining === null || answered) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev! <= 1) {
          handleSubmit()
          return 0
        }
        return prev! - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, answered])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleSelectAnswer = (option: string) => {
    if (!answered) {
      setSelectedAnswer(option)
    }
  }

  const handleSubmit = () => {
    setAnswered(true)
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setAnswered(false)
      setShowExplanation(false)
    } else {
      router.push('/dashboard/aptitude')
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(null)
      setAnswered(false)
      setShowExplanation(false)
    }
  }

  const handleBookmark = () => {
    const newBookmarked = new Set(bookmarked)
    if (newBookmarked.has(currentQuestion.id)) {
      newBookmarked.delete(currentQuestion.id)
    } else {
      newBookmarked.add(currentQuestion.id)
    }
    setBookmarked(newBookmarked)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Data Interpretation</h1>
            <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Topic: {currentQuestion.topic}
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <Button
            variant={bookmarked.has(currentQuestion.id) ? 'default' : 'outline'}
            size="sm"
            onClick={handleBookmark}
          >
            {bookmarked.has(currentQuestion.id) ? (
              <>
                <BookmarkCheck className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Timer */}
      <Card className={`p-4 flex items-center justify-between ${timeRemaining! < 10 ? 'bg-red-50 dark:bg-red-900/30' : ''}`}>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Time Remaining</span>
        </div>
        <div className={`text-2xl font-bold ${timeRemaining! < 10 ? 'text-red-600 dark:text-red-400' : ''}`}>
          {Math.floor(timeRemaining! / 60)}:{String(timeRemaining! % 60).padStart(2, '0')}
        </div>
      </Card>

      {/* Question Card */}
      <Card className="p-8 space-y-6">
        {/* Data/Chart Section */}
        <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-sm">Data Reference</p>
          </div>
          <pre className="font-mono text-sm whitespace-pre-wrap break-words overflow-x-auto">
            {currentQuestion.text}
          </pre>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <p className="text-lg font-semibold leading-relaxed">Based on the data above, answer the following question:</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Select your answer:</p>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrectOption = option === currentQuestion.correctAnswer
            const showCorrect = answered && isCorrectOption
            const showIncorrect = answered && isSelected && !isCorrectOption

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={answered}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : showIncorrect
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    : isSelected && !answered
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                } disabled:cursor-default`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${showCorrect ? 'text-green-700 dark:text-green-300' : showIncorrect ? 'text-red-700 dark:text-red-300' : ''}`}>
                    {option}
                  </span>
                  {showCorrect && <span className="text-green-600">✓</span>}
                  {showIncorrect && <span className="text-red-600">✗</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
            <div className="flex gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isCorrect ? 'text-green-600' : 'text-orange-600'}`} />
              <div>
                <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                  {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {!answered ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="px-8"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="px-8"
          >
            {currentIndex === questions.length - 1 ? 'Complete' : 'Next Question'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
