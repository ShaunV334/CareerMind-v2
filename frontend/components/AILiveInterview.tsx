'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Mic,
  Send,
  Square,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface MockInterviewProps {
  companyId: string
  userId: string
  role?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AILiveInterview({ companyId, userId, role = 'Software Engineer' }: MockInterviewProps): React.ReactElement {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  // Timer effect
  useEffect(() => {
    if (!interviewStarted || !startTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [interviewStarted, startTime])

  const startInterview = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${API_BASE}/interview/mock/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          companyId,
          userId,
          role,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSessionId(data.sessionId)
        setInterviewStarted(true)
        setStartTime(new Date())
        setQuestionIndex(0)

        // Initialize with Gemini-generated first question
        if (data.firstQuestion) {
          setMessages([
            {
              id: '1',
              role: 'assistant',
              content: data.firstQuestion,
            },
          ])
        } else {
          setMessages([
            {
              id: '1',
              role: 'assistant',
              content: 'Hello! Let\'s begin your technical interview. Please share a bit about your experience.',
            },
          ])
        }
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      alert('Failed to start interview')
    }
  }, [companyId, userId, role])

  const startRecording = useCallback(async () => {
    try {
      // Initialize Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        alert('Speech Recognition not supported in your browser')
        return
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.continuous = true
      recognition.interimResults = true
      recognition.language = 'en-US'

      let interimTranscript = ''

      recognition.onstart = () => {
        setIsRecording(true)
        console.log('Speech recognition started')
      }

      recognition.onresult = (event: any) => {
        interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            setInput((prev) => prev + transcript + ' ')
          } else {
            interimTranscript += transcript
          }
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        alert(`Error: ${event.error}`)
      }

      recognition.onend = () => {
        setIsRecording(false)
        console.log('Speech recognition ended')
      }

      recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      alert('Error starting voice input')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }, [])

  const submitAnswer = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!input.trim()) return

    const userMessage: Message = {
      id: String(messages.length + 1),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Save to session
      if (sessionId) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/interview/mock/${sessionId}/message`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            body: JSON.stringify({
              message: input,
              type: 'answer',
            }),
          }
        )
      }

      // Get AI feedback on the answer
      const messagesForAI = [
        ...messages,
        { role: 'user' as const, content: input }
      ]

      try {
        const feedbackResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/interview/mock/chat`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            body: JSON.stringify({
              messages: messagesForAI,
              sessionId,
              companyId,
              userId,
              role: 'Software Engineer',
            }),
          }
        )

        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json()
          const feedbackMessage: Message = {
            id: String(messages.length + 2),
            role: 'assistant',
            content: feedbackData.message || 'Great answer! Moving to the next question.',
          }
          setMessages((prev) => [...prev, feedbackMessage])
        }
      } catch (aiError) {
        console.error('Error getting AI feedback:', aiError)
        // Fall back to static feedback if AI call fails
      }

      // Next question will be generated by Gemini in the /mock/chat endpoint
      // The AI will naturally ask follow-up questions based on the conversation context
      setIsLoading(false)
    } catch (error) {
      console.error('Error submitting answer:', error)
      setIsLoading(false)
    }
  }, [input, messages.length, sessionId, userId, companyId])

  const endInterview = useCallback(async () => {
    if (!sessionId) return

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${API_BASE}/interview/mock/${sessionId}/end`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          feedback: 'Interview completed',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const duration = Math.floor((new Date().getTime() - startTime!.getTime()))
        
        // Navigate to results page with query parameters
        const searchParams = new URLSearchParams({
          score: data.score?.toString() || '0',
          duration: duration.toString(),
          sessionId: sessionId,
        })
        
        router.push(`/dashboard/interview-prep/${companyId}/results?${searchParams.toString()}`)
        setInterviewStarted(false)
        setMessages([])
      }
    } catch (error) {
      console.error('Error ending interview:', error)
    }
  }, [sessionId, userId, companyId, startTime, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!interviewStarted && !sessionId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                AI Mock Interview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Practice your {role} interview with AI-powered questions and real-time feedback
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  What to Expect:
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>✓ 5-8 company-specific questions</li>
                  <li>✓ Real-time feedback on your answers</li>
                  <li>✓ Performance scoring and analytics</li>
                  <li>✓ Detailed improvement suggestions</li>
                </ul>
              </div>

              <Button
                onClick={startInterview}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-8 py-3 text-lg"
              >
                Start Interview
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                Make sure your microphone is connected and permissions are granted.
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {companyId.charAt(0).toUpperCase() + companyId.slice(1)} Interview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{role}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-mono">{formatTime(elapsedTime)}</span>
            </div>
            <p className="text-sm mt-1">Question {questionIndex + 1}</p>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="p-6 bg-white dark:bg-gray-900 mb-6 h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg rounded-bl-none p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Input Area */}
        <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <form onSubmit={submitAnswer} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isLoading}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              {!isRecording ? (
                <Button
                  type="button"
                  onClick={startRecording}
                  variant="outline"
                  className="flex-1"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {isRecording
                ? '🔴 Recording... Speak your answer'
                : 'Type or use voice to answer questions'}
            </p>
            <Button
              onClick={endInterview}
              variant="destructive"
              className="w-full"
            >
              End Interview
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Tip:</strong> Take your time to think before answering. Use STAR method
              for behavioral questions (Situation, Task, Action, Result).
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

