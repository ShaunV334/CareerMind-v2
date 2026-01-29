'use client'

import { useParams } from 'next/navigation'
import CompanySyllabusView, { CompanyData } from '@/components/CompanySyllabusView'

// Mock data for different companies - can be fetched from backend later
const COMPANY_DATA: Record<string, CompanyData> = {
  google: {
    id: 'google',
    name: 'Google',
    industry: 'Technology',
    totalTopics: 48,
    totalHours: 120,
    overallProgress: 35,
    categories: [
      {
        name: 'Data Structures',
        topics: [
          {
            id: 'ds-arrays',
            name: 'Arrays & Strings',
            description: 'Master array manipulation, string algorithms, and common patterns',
            subtopics: ['Two Pointers', 'Sliding Window', 'Prefix Sums', 'String Manipulation'],
            difficulty: 'Easy',
            questionCount: 45,
            completedQuestions: 28,
            estimatedHours: 12,
            isCompleted: false,
          },
          {
            id: 'ds-linked',
            name: 'Linked Lists',
            description: 'Understand node-based data structures and pointer manipulation',
            subtopics: ['Single Linked List', 'Doubly Linked List', 'Fast & Slow Pointers'],
            difficulty: 'Easy',
            questionCount: 35,
            completedQuestions: 12,
            estimatedHours: 8,
            isCompleted: false,
          },
          {
            id: 'ds-stacks',
            name: 'Stacks & Queues',
            description: 'Learn LIFO and FIFO data structures with practical applications',
            subtopics: ['Stack Operations', 'Queue Operations', 'Monotonic Stack'],
            difficulty: 'Medium',
            questionCount: 40,
            completedQuestions: 0,
            estimatedHours: 10,
            isCompleted: false,
          },
          {
            id: 'ds-trees',
            name: 'Trees & Graphs',
            description: 'Master hierarchical and network data structures',
            subtopics: ['Binary Trees', 'BST', 'DFS/BFS', 'Topological Sort'],
            difficulty: 'Hard',
            questionCount: 60,
            completedQuestions: 0,
            estimatedHours: 18,
            isCompleted: false,
          },
        ],
      },
      {
        name: 'Algorithms',
        topics: [
          {
            id: 'algo-sorting',
            name: 'Sorting & Searching',
            description: 'Master fundamental sorting algorithms and binary search variants',
            subtopics: ['Merge Sort', 'Quick Sort', 'Binary Search', 'Counting Sort'],
            difficulty: 'Medium',
            questionCount: 25,
            completedQuestions: 0,
            estimatedHours: 8,
            isCompleted: false,
          },
          {
            id: 'algo-dp',
            name: 'Dynamic Programming',
            description: 'Learn memoization and optimization techniques for complex problems',
            subtopics: [
              '0/1 Knapsack',
              'Longest Subsequence',
              'Matrix DP',
              'Interval DP',
            ],
            difficulty: 'Hard',
            questionCount: 50,
            completedQuestions: 0,
            estimatedHours: 20,
            isCompleted: false,
          },
          {
            id: 'algo-greedy',
            name: 'Greedy Algorithms',
            description: 'Understand greedy approach and when to apply it',
            subtopics: ['Activity Selection', 'Huffman Coding', 'Fractional Knapsack'],
            difficulty: 'Medium',
            questionCount: 20,
            completedQuestions: 0,
            estimatedHours: 6,
            isCompleted: false,
          },
        ],
      },
      {
        name: 'System Design',
        topics: [
          {
            id: 'sys-fundamentals',
            name: 'System Design Fundamentals',
            description: 'Learn scalability, load balancing, and distributed systems concepts',
            subtopics: [
              'Scalability',
              'Load Balancing',
              'Caching',
              'Database Sharding',
            ],
            difficulty: 'Hard',
            questionCount: 30,
            completedQuestions: 0,
            estimatedHours: 15,
            isCompleted: false,
          },
          {
            id: 'sys-database',
            name: 'Database Design',
            description: 'Master SQL/NoSQL databases, indexing, and query optimization',
            subtopics: ['SQL vs NoSQL', 'Indexing', 'Transactions', 'Replication'],
            difficulty: 'Hard',
            questionCount: 25,
            completedQuestions: 0,
            estimatedHours: 12,
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
    totalTopics: 42,
    totalHours: 105,
    overallProgress: 20,
    categories: [
      {
        name: 'Data Structures',
        topics: [
          {
            id: 'ds-arrays',
            name: 'Arrays & Strings',
            description: 'Master array manipulation, string algorithms, and common patterns',
            subtopics: ['Two Pointers', 'Sliding Window', 'Prefix Sums'],
            difficulty: 'Easy',
            questionCount: 40,
            completedQuestions: 8,
            estimatedHours: 10,
            isCompleted: false,
          },
          {
            id: 'ds-trees',
            name: 'Trees & Graphs',
            description: 'Master hierarchical and network data structures',
            subtopics: ['Binary Trees', 'BST', 'DFS/BFS', 'Graph Traversal'],
            difficulty: 'Hard',
            questionCount: 55,
            completedQuestions: 0,
            estimatedHours: 16,
            isCompleted: false,
          },
        ],
      },
      {
        name: 'Algorithms',
        topics: [
          {
            id: 'algo-dp',
            name: 'Dynamic Programming',
            description: 'Learn memoization and optimization techniques',
            subtopics: ['Knapsack', 'Longest Subsequence', 'Matrix DP'],
            difficulty: 'Hard',
            questionCount: 45,
            completedQuestions: 0,
            estimatedHours: 18,
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
    totalTopics: 45,
    totalHours: 112,
    overallProgress: 15,
    categories: [
      {
        name: 'Data Structures',
        topics: [
          {
            id: 'ds-arrays',
            name: 'Arrays & Strings',
            description: 'Master array manipulation and string algorithms',
            subtopics: ['Two Pointers', 'Sliding Window', 'String Matching'],
            difficulty: 'Easy',
            questionCount: 38,
            completedQuestions: 5,
            estimatedHours: 9,
            isCompleted: false,
          },
        ],
      },
      {
        name: 'Advanced Topics',
        topics: [
          {
            id: 'adv-design',
            name: 'System Design',
            description: 'Scalable systems and architectural patterns',
            subtopics: ['Microservices', 'API Design', 'Caching Strategies'],
            difficulty: 'Hard',
            questionCount: 35,
            completedQuestions: 0,
            estimatedHours: 14,
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
    totalTopics: 35,
    totalHours: 85,
    overallProgress: 25,
    categories: [
      {
        name: 'Core DSA',
        topics: [
          {
            id: 'ds-basics',
            name: 'Arrays & Strings',
            description: 'Fundamental array and string operations',
            subtopics: ['Sorting', 'Searching', 'Pattern Matching'],
            difficulty: 'Easy',
            questionCount: 30,
            completedQuestions: 7,
            estimatedHours: 7,
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
    totalTopics: 30,
    totalHours: 70,
    overallProgress: 30,
    categories: [
      {
        name: 'Basics',
        topics: [
          {
            id: 'ds-arrays',
            name: 'Arrays & Strings',
            description: 'Basic array operations',
            subtopics: ['Linear Search', 'Binary Search', 'Sorting'],
            difficulty: 'Easy',
            questionCount: 25,
            completedQuestions: 7,
            estimatedHours: 6,
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
    totalTopics: 32,
    totalHours: 75,
    overallProgress: 22,
    categories: [
      {
        name: 'Programming',
        topics: [
          {
            id: 'ds-arrays',
            name: 'Arrays & Strings',
            description: 'Core array and string concepts',
            subtopics: ['Array Operations', 'String Algorithms'],
            difficulty: 'Easy',
            questionCount: 28,
            completedQuestions: 6,
            estimatedHours: 7,
            isCompleted: false,
          },
        ],
      },
    ],
  },
}

export default function CompanySyllabusPage() {
  const params = useParams()
  const companyId = (params.companyId as string).toLowerCase()

  // Get company data from mock data (in future, fetch from backend)
  const companyData = COMPANY_DATA[companyId]

  if (!companyData) {
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

  return <CompanySyllabusView companyId={companyId} mockData={companyData} />
}


