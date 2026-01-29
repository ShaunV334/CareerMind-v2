// frontend/app/dashboard/aptitude/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAptitude } from '@/hooks/useAptitude';
import { BookOpen, ChevronRight, Zap, Award, Clock, BarChart3 } from 'lucide-react';

interface AptitudeSubModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  questionCount: number;
  progress: number; // 0-100
  difficulty: 'Easy' | 'Medium' | 'Hard';
  color: string;
  url: string;
}

export default function AptitudePage() {
  const router = useRouter();
  const { fetchCategories, categories, isLoading } = useAptitude();
  const [submodules] = useState<AptitudeSubModule[]>([
    {
      id: 'quantitative',
      name: 'Quantitative',
      description: 'Numbers, algebra, geometry, and mathematical reasoning',
      icon: <BarChart3 className="w-8 h-8" />,
      questionCount: 250,
      progress: 35,
      difficulty: 'Hard',
      color: 'from-blue-500 to-blue-600',
      url: '/dashboard/aptitude/quantitative',
    },
    {
      id: 'logical',
      name: 'Logical Reasoning',
      description: 'Pattern recognition, deduction, and analytical thinking',
      icon: <Zap className="w-8 h-8" />,
      questionCount: 200,
      progress: 45,
      difficulty: 'Medium',
      color: 'from-purple-500 to-purple-600',
      url: '/dashboard/aptitude/logical',
    },
    {
      id: 'verbal',
      name: 'Verbal Ability',
      description: 'English comprehension, vocabulary, and grammar',
      icon: <BookOpen className="w-8 h-8" />,
      questionCount: 180,
      progress: 60,
      difficulty: 'Medium',
      color: 'from-green-500 to-green-600',
      url: '/dashboard/aptitude/verbal',
    },
    {
      id: 'data-interpretation',
      name: 'Data Interpretation',
      description: 'Charts, graphs, tables, and data analysis',
      icon: <Award className="w-8 h-8" />,
      questionCount: 150,
      progress: 25,
      difficulty: 'Hard',
      color: 'from-orange-500 to-orange-600',
      url: '/dashboard/aptitude/data-interpretation',
    },
    {
      id: 'psychometric',
      name: 'Psychometric Tests',
      description: 'Personality, behavioral, and cognitive assessments',
      icon: <Clock className="w-8 h-8" />,
      questionCount: 80,
      progress: 10,
      difficulty: 'Easy',
      color: 'from-pink-500 to-pink-600',
      url: '/dashboard/aptitude/psychometric',
    },
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const totalQuestions = submodules.reduce((sum, m) => sum + m.questionCount, 0);
  const avgProgress = Math.round(submodules.reduce((sum, m) => sum + m.progress, 0) / submodules.length);
  const completedQuestions = Math.round((avgProgress / 100) * totalQuestions);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Aptitude Preparation</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Master quantitative aptitude, logical reasoning, verbal ability, and more
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Questions</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-200">{totalQuestions}</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-200">{completedQuestions}</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Modules</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-200">{submodules.length}</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Progress</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-200">{avgProgress}%</p>
          </div>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <span className="text-sm text-gray-600 dark:text-gray-300">{avgProgress}%</span>
        </div>
        <Progress value={avgProgress} className="h-3" />
      </div>

      {/* Submodules Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submodules.map((module) => (
            <Card
              key={module.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4"
              onClick={() => router.push(module.url)}
            >
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                  {module.icon}
                </div>
                <Badge variant={
                  module.difficulty === 'Easy' ? 'default' :
                  module.difficulty === 'Medium' ? 'secondary' :
                  'destructive'
                }>
                  {module.difficulty}
                </Badge>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold">{module.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {module.description}
                  </p>
                </div>

                {/* Question Count */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {module.questionCount} questions
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round((module.progress / 100) * module.questionCount)}/{module.questionCount}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <Progress value={module.progress} className="h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{module.progress}% complete</p>
                </div>

                {/* Start Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(module.url);
                  }}
                  className="w-full mt-4"
                  variant="default"
                >
                  {module.progress > 0 ? 'Continue' : 'Start Practice'} <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900 dark:to-blue-900">
        <div className="space-y-3">
          <h3 className="text-lg font-bold">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>✓ Start with Easy difficulty levels to build confidence</li>
            <li>✓ Practice daily for consistent improvement</li>
            <li>✓ Review mistakes to understand concepts better</li>
            <li>✓ Set achievable goals and track your progress</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
