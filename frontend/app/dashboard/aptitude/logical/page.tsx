'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAptitude } from '@/hooks/useAptitude'
import { ChevronRight, ChevronLeft, Bookmark, BookmarkCheck, Clock, AlertCircle } from 'lucide-react'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  timeLimit: number
  topic: string
}

export default function LogicalPage() {
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

  // Sample logical reasoning questions
  const sampleQuestions: Question[] = [
    {
      id: '1',
      text: 'If all roses are flowers and some flowers fade quickly, then which of the following must be true?\nA) All roses fade quickly\nB) Some flowers are not roses\nC) All flowers are roses\nD) Some roses fade quickly',
      options: [
        'All roses fade quickly',
        'Some flowers are not roses',
        'All flowers are roses',
        'Some roses fade quickly'
      ],
      correctAnswer: 'Some flowers are not roses',
      explanation: 'Since some flowers fade quickly, but we don\'t know if all roses fade quickly, some flowers must not be roses. This is because not all flowers can be roses if some fade and some don\'t.',
      difficulty: 'Medium',
      timeLimit: 90,
      topic: 'Deductive Logic',
    },
    {
      id: '2',
      text: 'In a sequence: 2, 4, 8, 16, 32... What is the next number?',
      options: ['48', '64', '56', '40'],
      correctAnswer: '64',
      explanation: 'Each number is multiplied by 2. 32 × 2 = 64. This is a geometric sequence with ratio 2.',
      difficulty: 'Easy',
      timeLimit: 45,
      topic: 'Pattern Recognition',
    },
    {
      id: '3',
      text: 'If A > B, B > C, and C > D, which of the following is definitely true?',
      options: [
        'A > D',
        'D > A',
        'B = D',
        'C = D'
      ],
      correctAnswer: 'A > D',
      explanation: 'By transitive property: A > B, B > C, C > D means A > D. This is a fundamental property of inequalities.',
      difficulty: 'Easy',
      timeLimit: 60,
      topic: 'Logical Deduction',
    },
    {
      id: '4',
      text: 'Five friends P, Q, R, S, and T sit in a row. P sits to the right of Q. R sits in the middle. S does not sit next to P. Who sits to the right of R?\nA) P or T\nB) T or Q\nC) Only P\nD) Only T',
      options: [
        'P or T',
        'T or Q',
        'Only P',
        'Only T'
      ],
      correctAnswer: 'P or T',
      explanation: 'With R in the middle and the given constraints, P or T could sit to the right of R. The arrangement possibilities satisfy this condition.',
      difficulty: 'Hard',
      timeLimit: 120,
      topic: 'Seating Arrangement',
    },
    {
      id: '5',
      text: 'Complete the series: 1, 1, 2, 3, 5, 8, 13, ?',
      options: ['19', '20', '21', '22'],
      correctAnswer: '21',
      explanation: 'This is the Fibonacci sequence where each number is the sum of the two preceding numbers. 8 + 13 = 21.',
      difficulty: 'Medium',
      timeLimit: 75,
      topic: 'Number Series',
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
            <h1 className="text-3xl font-bold">Logical Reasoning</h1>
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
        {/* Question Text */}
        <div className="space-y-4">
          <p className="text-xl font-semibold leading-relaxed whitespace-pre-line">{currentQuestion.text}</p>
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
                <p className="text-sm text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
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
