'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAptitude } from '@/hooks/useAptitude'
import { ChevronRight, ChevronLeft, Bookmark, BookmarkCheck, Clock, AlertCircle, Brain } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: 'rating' | 'personality'
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  timeLimit: number
  topic: string
}

export default function PsychometricPage() {
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
  const [score, setScore] = useState(0)

  // Sample psychometric questions
  const sampleQuestions: Question[] = [
    {
      id: '1',
      text: 'When faced with a challenging problem at work, you tend to:',
      type: 'personality',
      options: [
        'Analyze it systematically and create a detailed plan',
        'Discuss it with team members to gather different perspectives',
        'Take immediate action and adapt as you go',
        'Think about it quietly before deciding'
      ],
      correctAnswer: 'Analyze it systematically and create a detailed plan',
      explanation: 'This question assesses problem-solving approach and cognitive style. There\'s no universally "correct" answer - different approaches suit different situations. Systematic analysis indicates analytical thinking and planning orientation.',
      difficulty: 'Easy',
      timeLimit: 60,
      topic: 'Problem-Solving Style',
    },
    {
      id: '2',
      text: 'You feel most energized by:',
      type: 'personality',
      options: [
        'Working independently on meaningful projects',
        'Collaborating and brainstorming with others',
        'Leading a team towards a common goal',
        'Supporting team members in achieving their goals'
      ],
      correctAnswer: 'Collaborating and brainstorming with others',
      explanation: 'This assesses work preferences and interpersonal style. The answer reflects motivation patterns - those energized by collaboration tend to thrive in team environments and value diverse perspectives.',
      difficulty: 'Easy',
      timeLimit: 45,
      topic: 'Work Preference',
    },
    {
      id: '3',
      text: 'When receiving constructive criticism, you typically:',
      type: 'personality',
      options: [
        'Feel defensive and question the feedback',
        'Accept it gracefully and look for ways to improve',
        'Analyze the feedback to determine its validity',
        'Seek clarification to better understand the point'
      ],
      correctAnswer: 'Accept it gracefully and look for ways to improve',
      explanation: 'This measures openness to feedback and growth mindset. Accepting criticism positively indicates emotional intelligence, resilience, and a commitment to continuous improvement - valuable traits for professional development.',
      difficulty: 'Medium',
      timeLimit: 60,
      topic: 'Emotional Intelligence',
    },
    {
      id: '4',
      text: 'In a team conflict, your natural inclination is to:',
      type: 'personality',
      options: [
        'Avoid the conflict and hope it resolves itself',
        'Assert your viewpoint firmly to win the argument',
        'Seek to understand all perspectives and find common ground',
        'Compromise by splitting the difference'
      ],
      correctAnswer: 'Seek to understand all perspectives and find common ground',
      explanation: 'This assesses conflict resolution style and interpersonal awareness. Seeking common ground and understanding indicates collaborative skills, empathy, and the ability to navigate complex team dynamics effectively.',
      difficulty: 'Medium',
      timeLimit: 75,
      topic: 'Conflict Resolution',
    },
    {
      id: '5',
      text: 'Your approach to learning new skills is typically to:',
      type: 'personality',
      options: [
        'Learn by doing - jump in and experiment',
        'Study theory thoroughly before applying it',
        'Find a mentor or role model to learn from',
        'Take a structured course or training program'
      ],
      correctAnswer: 'Take a structured course or training program',
      explanation: 'This measures learning style and self-development approach. Those who prefer structured learning tend to acquire complex skills systematically, though different learning styles work for different people and contexts.',
      difficulty: 'Easy',
      timeLimit: 45,
      topic: 'Learning Style',
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
    if (isCorrect || selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setAnswered(false)
      setShowExplanation(false)
    } else {
      // Test completed - show results
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
            <h1 className="text-3xl font-bold">Psychometric Test</h1>
            <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Assess your personality traits and behavioral tendencies
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
        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex gap-2">
            <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>About this assessment:</strong> Psychometric tests assess personality, behavioral patterns, and cognitive styles. 
              There are no "wrong" answers - choose the option that best describes you or your tendency.
            </p>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <p className="text-xl font-semibold leading-relaxed">{currentQuestion.text}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Select the option that best describes you:</p>
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
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : isSelected && !answered
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                } disabled:cursor-default`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${showCorrect ? 'text-green-700 dark:text-green-300' : ''}`}>
                    {option}
                  </span>
                  {showCorrect && <span className="text-green-600">✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-purple-600" />
              <div>
                <p className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                  Understanding Your Response
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
            Submit Response
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="px-8"
          >
            {currentIndex === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
