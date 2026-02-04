'use client'

import { useParams } from 'next/navigation'
import InterviewPrepView, { InterviewPrepData } from '@/components/InterviewPrepView'

const INTERVIEW_PREP_DATA: Record<string, InterviewPrepData> = {
  google: {
    id: 'google',
    name: 'Google',
    industry: 'Technology',
    totalTopics: 28,
    totalMinutes: 2400,
    overallProgress: 25,
    mockInterviewCount: 5,
    mockInterviewsCompleted: 1,
    categories: [
      {
        name: 'Behavioral Questions',
        topics: [
          {
            id: 'beh-leadership',
            name: 'Leadership & Team Work',
            description: 'How to discuss your leadership experience and team collaboration',
            subtopics: ['Taking Initiative', 'Conflict Resolution', 'Team Motivation'],
            keyPoints: [
              'Use STAR method (Situation, Task, Action, Result)',
              'Focus on impact and growth',
              'Show humility and learning mindset',
            ],
            difficulty: 'Easy',
            estimatedMinutes: 30,
            isCompleted: true,
          },
          {
            id: 'beh-failure',
            name: 'Dealing with Failure',
            description: 'How to discuss your failures and learnings',
            subtopics: ['Learning from Mistakes', 'Problem Solving', 'Resilience'],
            keyPoints: [
              'Own your mistakes completely',
              'Focus on solutions implemented',
              'Show growth and improvement',
            ],
            difficulty: 'Medium',
            estimatedMinutes: 25,
            isCompleted: true,
          },
          {
            id: 'beh-innovation',
            name: 'Innovation & Creativity',
            description: 'Discuss how you bring innovation to your work',
            subtopics: ['Creative Problem Solving', 'Process Improvement', 'Big Thinking'],
            keyPoints: [
              'Share concrete examples of innovations',
              'Explain the impact and metrics',
              'Show Google-level ambition',
            ],
            difficulty: 'Hard',
            estimatedMinutes: 35,
            isCompleted: false,
          },
          {
            id: 'beh-diversity',
            name: 'Diversity & Inclusion',
            description: 'Google values diversity and inclusive culture',
            subtopics: ['Inclusion', 'Perspective Diversity', 'Belonging'],
            keyPoints: [
              'Show value for different perspectives',
              'Example of working with diverse teams',
              'Commitment to inclusive culture',
            ],
            difficulty: 'Medium',
            estimatedMinutes: 20,
            isCompleted: false,
          },
        ],
      },
      {
        name: 'Technical Deep Dives',
        topics: [
          {
            id: 'tech-design',
            name: 'System Design',
            description: 'Deep dive into designing large-scale systems',
            subtopics: [
              'Scalability',
              'Load Balancing',
              'Database Design',
              'Caching Strategies',
            ],
            keyPoints: [
              'Start with requirements clarification',
              'Focus on tradeoffs',
              'Discuss monitoring and scaling',
            ],
            difficulty: 'Hard',
            estimatedMinutes: 60,
            isCompleted: false,
          },
          {
            id: 'tech-coding',
            name: 'Coding Interview',
            description: 'Practice coding problems with optimal solutions',
            subtopics: ['Algorithms', 'Data Structures', 'Optimization', 'Testing'],
            keyPoints: [
              'Write clean, readable code',
              'Test edge cases',
              'Optimize for time and space',
            ],
            difficulty: 'Hard',
            estimatedMinutes: 90,
            isCompleted: false,
          },
          {
            id: 'tech-ml',
            name: 'ML & Data Science (if relevant)',
            description: 'For ML-focused roles',
            subtopics: ['ML Fundamentals', 'Model Selection', 'Evaluation Metrics'],
            keyPoints: [
              'Understand the problem context',
              'Know common pitfalls',
              'Discuss production considerations',
            ],
            difficulty: 'Hard',
            estimatedMinutes: 45,
            isCompleted: false,
          },
        ],
      },
      {
        name: 'Company-Specific',
        topics: [
          {
            id: 'comp-mission',
            name: 'Google Mission & Values',
            description: 'Understand Google\'s mission and how you fit',
            subtopics: ['Google\'s Mission', 'Company Values', 'Products & Impact'],
            keyPoints: [
              'Know the mission: "Organize world\'s information"',
              'Understand core values',
              'Be genuine in your interest',
            ],
            difficulty: 'Easy',
            estimatedMinutes: 20,
            isCompleted: true,
          },
          {
            id: 'comp-products',
            name: 'Google Products Deep Dive',
            description: 'Know about Google\'s major products and strategy',
            subtopics: ['Search', 'Cloud', 'AI/ML', 'Hardware'],
            keyPoints: [
              'Understand key product areas',
              'Know recent announcements',
              'Think about how you\'d contribute',
            ],
            difficulty: 'Medium',
            estimatedMinutes: 40,
            isCompleted: false,
          },
          {
            id: 'comp-culture',
            name: 'Google Culture Questions',
            description: 'Questions about working at Google',
            subtopics: [
              '20% Time',
              'Work-Life Balance',
              'Career Growth',
              'Perks',
            ],
            keyPoints: [
              'Research the actual culture',
              'Be honest about your needs',
              'Show enthusiasm for growth',
            ],
            difficulty: 'Easy',
            estimatedMinutes: 25,
            isCompleted: false,
          },
        ],
      },
    ],
  },

  amazon: {
    id: 'amazon',
    name: 'Amazon',
    industry: 'Technology',
    totalTopics: 25,
    totalMinutes: 2200,
    overallProgress: 15,
    mockInterviewCount: 5,
    mockInterviewsCompleted: 0,
    categories: [
      {
        name: 'Leadership Principles',
        topics: [
          {
            id: 'lp-ownership',
            name: 'Ownership Principle',
            description: 'Amazon\'s core principle of taking ownership',
            subtopics: ['Accountability', 'Long-term Thinking', 'Solutions Mindset'],
            keyPoints: [
              'Act like an owner',
              'Think long-term',
              'Find and fix problems',
            ],
            difficulty: 'Medium',
            estimatedMinutes: 30,
            isCompleted: false,
          },
          {
            id: 'lp-customer',
            name: 'Customer Obsession',
            description: 'Everything at Amazon revolves around customers',
            subtopics: ['Customer Focus', 'Data-Driven', 'Innovation'],
            keyPoints: [
              'Start with customer needs',
              'Use data to understand customers',
              'Be willing to be misunderstood',
            ],
            difficulty: 'Medium',
            estimatedMinutes: 25,
            isCompleted: false,
          },
        ],
      },
      {
        name: 'Technical Interview',
        topics: [
          {
            id: 'tech-coding',
            name: 'Coding Problems',
            description: 'Medium to Hard LeetCode-style problems',
            subtopics: ['Arrays', 'Trees', 'Dynamic Programming', 'Strings'],
            keyPoints: [
              'Practice 30-50 problems',
              'Focus on optimal solutions',
              'Explain your approach clearly',
            ],
            difficulty: 'Hard',
            estimatedMinutes: 120,
            isCompleted: false,
          },
        ],
      },
    ],
  },

  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    industry: 'Technology',
    totalTopics: 22,
    totalMinutes: 2000,
    overallProgress: 10,
    mockInterviewCount: 4,
    mockInterviewsCompleted: 0,
    categories: [
      {
        name: 'Behavioral',
        topics: [
          {
            id: 'beh-growth',
            name: 'Growth Mindset',
            description: 'Microsoft values continuous learning and growth',
            subtopics: ['Learning', 'Adaptability', 'Problem Solving'],
            keyPoints: [
              'Show willingness to learn',
              'Discuss learning experiences',
              'Value feedback and improvement',
            ],
            difficulty: 'Easy',
            estimatedMinutes: 25,
            isCompleted: false,
          },
        ],
      },
    ],
  },

  accenture: {
    id: 'accenture',
    name: 'Accenture',
    industry: 'Consulting',
    totalTopics: 18,
    totalMinutes: 1600,
    overallProgress: 5,
    mockInterviewCount: 3,
    mockInterviewsCompleted: 0,
    categories: [
      {
        name: 'Behavioral',
        topics: [
          {
            id: 'beh-client',
            name: 'Client Management',
            description: 'How to work with clients effectively',
            subtopics: ['Communication', 'Problem Solving', 'Project Management'],
            keyPoints: [
              'Show client focus',
              'Discuss stakeholder management',
              'Emphasize teamwork',
            ],
            difficulty: 'Easy',
            estimatedMinutes: 30,
            isCompleted: false,
          },
        ],
      },
    ],
  },

  tcs: {
    id: 'tcs',
    name: 'TCS',
    industry: 'IT Services',
    totalTopics: 15,
    totalMinutes: 1200,
    overallProgress: 0,
    mockInterviewCount: 2,
    mockInterviewsCompleted: 0,
    categories: [
      {
        name: 'Core Technical',
        topics: [
          {
            id: 'tech-basics',
            name: 'Technical Basics',
            description: 'Fundamentals of programming and CS',
            subtopics: ['OOP', 'Data Structures', 'Databases'],
            keyPoints: [
              'Strong fundamentals required',
              'Practice basic problems',
              'Know DBMS concepts',
            ],
            difficulty: 'Easy',
            estimatedMinutes: 60,
            isCompleted: false,
          },
        ],
      },
    ],
  },

  infosys: {
    id: 'infosys',
    name: 'Infosys',
    industry: 'IT Services',
    totalTopics: 16,
    totalMinutes: 1300,
    overallProgress: 0,
    mockInterviewCount: 2,
    mockInterviewsCompleted: 0,
    categories: [
      {
        name: 'Fundamentals',
        topics: [
          {
            id: 'fund-core',
            name: 'Core Programming',
            description: 'Basic programming concepts and problems',
            subtopics: ['Functions', 'Loops', 'Arrays', 'Strings'],
            keyPoints: [
              'Master basics thoroughly',
              'Practice array/string problems',
              'Know time complexity',
            ],
            difficulty: 'Easy',
            estimatedMinutes: 50,
            isCompleted: false,
          },
        ],
      },
    ],
  },
}

export default function InterviewPrepCompanyPage() {
  const params = useParams()
  const companyId = (params.companyId as string).toLowerCase()

  const prepData = INTERVIEW_PREP_DATA[companyId]

  if (!prepData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Company not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The company you're looking for doesn't exist in our database.
          </p>
        </div>
      </div>
    )
  }

  return <InterviewPrepView companyId={companyId} mockData={prepData} />
}
