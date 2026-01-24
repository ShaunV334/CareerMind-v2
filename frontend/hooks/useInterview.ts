import { useState, useCallback } from "react";

export interface InterviewQuestion {
  id: string;
  question: string;
  category: "Behavioral" | "Technical" | "System Design";
  type: string;
  difficulty: string;
  tags: string[];
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  suggestions: string[];
  keywordsCovered: string[];
}

export function useInterview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(
    async (filters?: { category?: string; difficulty?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.category) params.append("category", filters.category);
        if (filters?.difficulty)
          params.append("difficulty", filters.difficulty);

        const res = await fetch(
          `http://localhost:3000/api/interview/questions?${params}`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (!res.ok) throw new Error("Failed to fetch questions");
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching questions");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchQuestion = useCallback(async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/interview/questions/${id}`,
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to fetch question");
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching question");
      throw err;
    }
  }, []);

  const submitAnswer = useCallback(
    async (
      questionId: string,
      answer: string,
      timeSpent: number
    ): Promise<{ feedback: InterviewFeedback }> => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await fetch(
          `http://localhost:3000/api/interview/questions/${questionId}/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ answer, timeSpent }),
          }
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("API Error:", errorData);
          throw new Error(errorData.error || "Failed to submit answer");
        }
        return await res.json();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error submitting answer";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`http://localhost:3000/api/interview/history`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching history");
      throw err;
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`http://localhost:3000/api/interview/stats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching stats");
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    fetchQuestions,
    fetchQuestion,
    submitAnswer,
    fetchHistory,
    fetchStats,
  };
}
