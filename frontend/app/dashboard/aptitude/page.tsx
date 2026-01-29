// frontend/app/dashboard/aptitude/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAptitude } from '@/hooks/useAptitude';
import type { AptitudeCategory } from '@/types/aptitude';

export default function AptitudePage() {
  const router = useRouter();
  const { fetchCategories, categories, isLoading } = useAptitude();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleStartPractice = (categoryId: string) => {
    router.push(`/dashboard/aptitude/${categoryId}`);
  };

  const handleViewQuestions = (categoryId: string) => {
    router.push(`/dashboard/aptitude/${categoryId}/questions`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Aptitude Preparation</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Master quantitative aptitude, logical reasoning, and verbal ability with our comprehensive question bank
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Questions</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-200">500+</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Categories</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-200">{categories.length}</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Difficulty Levels</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-200">3</p>
          </div>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Choose a Category</h2>
        {isLoading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: AptitudeCategory) => (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="p-6 space-y-4">
                  {/* Icon & Name */}
                  <div className="space-y-2">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {category.description}
                    </p>
                  </div>

                  {/* Subcategories */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {category.subcategoryCount || 0} SUBCATEGORIES
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {category.questionCount || 0} Questions
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPractice(category.id);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Practice
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewQuestions(category.id);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Questions
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
        <h3 className="font-bold mb-3">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <li>✓ Start with Easy questions to build confidence</li>
          <li>✓ Time yourself to improve speed and accuracy</li>
          <li>✓ Review explanations to understand concepts</li>
          <li>✓ Bookmark difficult questions for later revision</li>
          <li>✓ Practice regularly to maintain consistency</li>
        </ul>
      </Card>
    </div>
  );
}
