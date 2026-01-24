"use client";

import { useState, useEffect } from "react";
import { useQuestions } from "@/hooks/useQuestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: string;
  tags: string[];
}

export default function QuestionBankPage() {
  const { fetchQuestions, fetchQuestion, fetchCategories, loading, error } = useQuestions();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fullQuestion, setFullQuestion] = useState<any>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory, selectedDifficulty, searchQuery, currentPage]);

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  }

  async function loadQuestions() {
    try {
      const data = await fetchQuestions({
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        search: searchQuery || undefined,
        limit: ITEMS_PER_PAGE,
        skip: currentPage * ITEMS_PER_PAGE,
      });
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load questions", err);
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (selectedQuestion) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedQuestion(null);
            setFullQuestion(null);
            setShowAnswer(false);
          }}
        >
          ← Back to Questions
        </Button>

        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">
                {selectedQuestion.question}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}
                >
                  {selectedQuestion.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {selectedQuestion.category}
                </span>
                {selectedQuestion.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <Button
              onClick={() => setShowAnswer(!showAnswer)}
              className="w-full"
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </Button>

            {showAnswer && (
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Explanation:</h3>
                  <p className="text-sm">{fullQuestion?.explanation || "No explanation available"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Solution:</h3>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto text-xs">
                    {fullQuestion?.correctAnswer || "No solution available"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Question Bank</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Practice with {total} DSA and coding interview questions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No questions found. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <button
              key={question.id}
              onClick={async () => {
                setSelectedQuestion(question);
                try {
                  const full = await fetchQuestion(question.id, "study");
                  setFullQuestion(full);
                } catch (err) {
                  console.error("Failed to load full question", err);
                }
              }}
              className="w-full text-left bg-white dark:bg-slate-900 p-4 rounded-lg border hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {question.question}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                    >
                      {question.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {question.category}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage > 2 ? currentPage - 2 + i : i;
              if (pageNum >= totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
