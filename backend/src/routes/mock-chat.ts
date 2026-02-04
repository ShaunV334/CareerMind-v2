import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Hono } from 'hono'
import { getDb } from '../db.js'

const mockChatRoute = new Hono()

const COMPANY_QUESTIONS: Record<string, string[]> = {
  google: [
    'Tell me about a time you faced a complex technical challenge. How did you approach it?',
    'Describe a situation where you had to work with a difficult team member. How did you handle it?',
    'What is your experience with system design? Can you describe a large-scale system you\'ve designed?',
    'How do you stay updated with new technologies and trends in software development?',
    'Tell me about a project where you took leadership. What was your role and impact?',
    'Describe a time when you had to learn something new quickly to complete a project.',
  ],
  amazon: [
    'Tell me about a time when you took ownership of a problem and solved it.',
    'Describe a situation where you had to make a decision with incomplete information.',
    'How do you approach learning and development in your role?',
    'Tell me about a time when you disagreed with your manager. How did you handle it?',
    'What\'s an example of when you used data to make a decision?',
  ],
  microsoft: [
    'Tell me about a time you worked on an innovative project. What was your contribution?',
    'Describe a challenge you faced in a team project and how you overcame it.',
    'How do you handle failure and learn from mistakes?',
    'Tell me about your experience with cloud technologies.',
    'Describe a situation where you had to adapt to change quickly.',
  ],
  accenture: [
    'Tell me about a time you worked with a client. How did you understand their needs?',
    'Describe your experience with project management and delivering on deadline.',
    'How do you work in a team-oriented environment?',
    'Tell me about a complex project you worked on and your role in it.',
  ],
  tcs: [
    'Tell me about your programming experience and projects.',
    'How would you approach a new technology you haven\'t used before?',
    'Describe your experience with databases and SQL.',
    'Tell me about a time you had to debug a difficult issue.',
  ],
  infosys: [
    'Tell me about your experience with software development.',
    'How do you ensure code quality in your projects?',
    'Describe a project you\'re proud of and why.',
    'How do you approach learning new technologies?',
  ],
}

/**
 * POST /api/interview/mock/chat
 * AI-powered interview question and answer endpoint
 */
mockChatRoute.post('/chat', async (c) => {
  try {
    const body = await c.req.json()
    const { messages, sessionId, companyId, userId, role } = body

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'messages array is required' }, 400)
    }

    const companyQuestions = COMPANY_QUESTIONS[companyId.toLowerCase()] || COMPANY_QUESTIONS.google
    const questionIndex = messages.filter((m: any) => m.role === 'user').length

    let systemPrompt = `You are an experienced technical interviewer at ${companyId}. You are conducting a mock interview for a ${role} position.

Your job is to:
1. Ask relevant technical and behavioral questions specific to ${companyId}
2. Listen to the candidate's answers
3. Provide constructive feedback
4. Ask follow-up questions to understand their experience better
5. Rate their response (1-10)

Maintain a professional and friendly tone. Be encouraging but honest about areas for improvement.

Company Focus for ${companyId}:
- Google: Innovation, system design, problem-solving
- Amazon: Leadership principles, ownership, customer obsession
- Microsoft: Growth mindset, collaboration, cloud technologies
- Accenture: Client management, project delivery, teamwork
- TCS: Technical fundamentals, quality, process excellence
- Infosys: Code quality, continuous learning, delivery excellence

Current Interview Progress: Question ${questionIndex + 1} of ${companyQuestions.length}`

    // Generate next question if this is the start or after an answer
    if (messages.length === 0 || (messages[messages.length - 1].role === 'user')) {
      const question = companyQuestions[Math.min(questionIndex, companyQuestions.length - 1)]
      
      systemPrompt += `

Your next action:
1. Ask this question: "${question}"
2. Wait for the candidate's response
3. After they answer, provide feedback on:
   - Strengths in their answer
   - Areas for improvement
   - Rating (1-10)
   - Follow-up questions if needed`
    }

    // Use AI SDK to stream response
    const response = await streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
    })

    // Save to database if sessionId is provided
    if (sessionId) {
      try {
        const db = getDb()
        const assistantResponse = await response.text
        
        await db.collection('mockInterviewSessions').updateOne(
          { sessionId },
          {
            $push: {
              messages: {
                timestamp: new Date(),
                type: 'question',
                content: assistantResponse,
                role: 'assistant',
              },
            },
          }
        )
      } catch (dbError) {
        console.error('Error saving to database:', dbError)
      }
    }

    // Return text stream for streaming response
    return new Response(response.textStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in mock interview chat:', error)
    return c.json({ error: 'Failed to process interview response' }, 500)
  }
})

export default mockChatRoute
