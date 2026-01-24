"use client";

import { useState, useEffect } from "react";
import { useInterview } from "@/hooks/useInterview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function InterviewPrepPage() {
  const { fetchQuestions, fetchQuestion, submitAnswer, loading, error } =
    useInterview();
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [category, setCategory] = useState("Behavioral");

  const categories = ["Behavioral", "Technical", "System Design"];

  useEffect(() => {
    loadQuestions();
  }, [category]);

  async function loadQuestions() {
    try {
      const data = await fetchQuestions({ category });
      setQuestions(data.questions || []);
      setFeedback(null);
      setAnswer("");
    } catch (err) {
      console.error("Failed to load questions", err);
    }
  }

  async function selectQuestion(q: any) {
    try {
      const full = await fetchQuestion(q.id);
      setSelectedQuestion(full);
      setAnswer("");
      setFeedback(null);
      setStartTime(Date.now());
    } catch (err) {
      console.error("Failed to load question", err);
    }
  }

  async function handleSubmitAnswer() {
    if (!selectedQuestion || !answer.trim()) return;

    setSubmitting(true);
    try {
      const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      const result = await submitAnswer(selectedQuestion.id, answer, timeSpent);
      setFeedback(result.feedback);
    } catch (err) {
      console.error("Failed to submit answer", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (selectedQuestion && feedback) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedQuestion(null)}>
          ← Back to Questions
        </Button>

        <div className="space-y-6">
          {/* Question */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-2">{selectedQuestion.question}</h2>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {selectedQuestion.category}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200">
                {selectedQuestion.difficulty}
              </span>
            </div>
          </div>

          {/* Your Answer */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-3">Your Answer</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{answer}</p>
          </div>

          {/* AI Feedback */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-4xl font-bold text-blue-600">{feedback.score}/100</p>
              </div>
              <div className="flex-1 h-20 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg relative">
                <div
                  className="absolute top-0 left-0 h-full w-1 bg-black rounded-lg"
                  style={{ left: `${feedback.score}%` }}
                ></div>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✓ Strengths</h4>
              <ul className="space-y-1">
                {feedback.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="font-semibold text-red-600 mb-2">⚠ Areas for Improvement</h4>
              <ul className="space-y-1">
                {feedback.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    • {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feedback */}
            <div>
              <h4 className="font-semibold mb-2">Detailed Feedback</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {feedback.feedback}
              </p>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">💡 Suggestions</h4>
              <ul className="space-y-1">
                {feedback.suggestions?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Keywords */}
            {feedback.keywordsCovered?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Keywords Mentioned</h4>
                <div className="flex flex-wrap gap-2">
                  {feedback.keywordsCovered.map((k: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => setSelectedQuestion(null)}
            className="w-full"
          >
            Try Another Question
          </Button>
        </div>
      </div>
    );
  }

  if (selectedQuestion) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedQuestion(null)}>
          ← Back to Questions
        </Button>

        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {selectedQuestion.category}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200">
                {selectedQuestion.difficulty}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{selectedQuestion.question}</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here. Take your time to provide a comprehensive response..."
              className="w-full h-64 p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-2">
              Time spent: {startTime ? Math.round((Date.now() - startTime) / 1000) : 0}s
            </p>
          </div>

          <Button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              "Submit Answer"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Interview Preparation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Practice interview questions with AI-powered feedback
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b dark:border-slate-700">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              category === cat
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No questions available in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <button
              key={question.id}
              onClick={() => selectQuestion(question)}
              className="w-full text-left bg-white dark:bg-slate-900 p-4 rounded-lg border hover:border-blue-500 transition-colors"
            >
              <div>
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {question.question}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {question.type}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-700">
                    {question.difficulty}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
