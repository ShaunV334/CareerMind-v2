// frontend/app/dashboard/aptitude/[categoryId]/practice/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAptitude } from '@/hooks/useAptitude';
import type { PracticeOptions } from '@/types/aptitude';

export default function PracticePage({ params }: { params: { categoryId: string } }) {
  const router = useRouter();
  const { startPracticeSession, fetchCategory, isLoading } = useAptitude();
  const [category, setCategory] = useState<any>(null);
  const [options, setOptions] = useState<Partial<PracticeOptions>>({
    categoryId: params.categoryId,
    difficulty: 'Easy',
    questionCount: 10,
    timeLimitMinutes: 30
  });

  useEffect(() => {
    loadCategory();
  }, []);

  const loadCategory = async () => {
    const data = await fetchCategory(params.categoryId);
    if (data) setCategory(data);
  };

  const handleStartSession = async () => {
    const session = await startPracticeSession(options as PracticeOptions);
    if (session) {
      router.push(`/dashboard/aptitude/practice/${session.sessionId}`);
    }
  };

  if (!category) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
      </div>

      {/* Configuration Card */}
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-bold">Customize Your Practice Session</h2>

        {/* Difficulty Selection */}
        <div className="space-y-3">
          <label className="block font-semibold">Difficulty Level</label>
          <div className="flex gap-3">
            {['Easy', 'Medium', 'Hard'].map((level) => (
              <button
                key={level}
                onClick={() => setOptions({ ...options, difficulty: level as any })}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  options.difficulty === level
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <label className="block font-semibold">Number of Questions</label>
          <input
            type="number"
            min="5"
            max="50"
            value={options.questionCount}
            onChange={(e) => setOptions({ ...options, questionCount: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">Recommended: 10-20 questions</p>
        </div>

        {/* Time Limit */}
        <div className="space-y-3">
          <label className="block font-semibold">Time Limit (minutes)</label>
          <div className="flex gap-2">
            {[15, 30, 45, 60].map((minutes) => (
              <button
                key={minutes}
                onClick={() => setOptions({ ...options, timeLimitMinutes: minutes })}
                className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                  options.timeLimitMinutes === minutes
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>
        </div>

        {/* Options Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Show timer during practice</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Show explanations after each answer</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span>Exclude questions I've already attempted</span>
          </label>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">Session Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Questions:</span>
              <span className="font-semibold">{options.questionCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Difficulty:</span>
              <span className="font-semibold">{options.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Limit:</span>
              <span className="font-semibold">{options.timeLimitMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="font-semibold">{category.name}</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStartSession}
          disabled={isLoading || !options.questionCount}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
        >
          {isLoading ? 'Starting...' : 'Start Practice Session'}
        </Button>
      </Card>

      {/* Info */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-900 space-y-2">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">ℹ️ INFO</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Once started, you'll be presented with questions one at a time. Answer each question and proceed to the next. 
          You can skip questions, and your progress will be tracked automatically.
        </p>
      </Card>
    </div>
  );
}
