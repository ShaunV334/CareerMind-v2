import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "coding" | "mcq" | "short-answer";
  tags: string[];
  explanation: string;
  correctAnswer?: string;
}

export function useQuestions() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(
    async (filters?: {
      category?: string;
      difficulty?: string;
      search?: string;
      limit?: number;
      skip?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.category) params.append("category", filters.category);
        if (filters?.difficulty)
          params.append("difficulty", filters.difficulty);
        if (filters?.search) params.append("search", filters.search);
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.skip) params.append("skip", filters.skip.toString());

        const res = await fetch(
          `http://localhost:3000/api/questions?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
    [token]
  );

  const fetchQuestion = useCallback(
    async (id: string, mode: "study" | "practice" = "practice") => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:3000/api/questions/${id}?mode=${mode}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch question");
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching question");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const recordAttempt = useCallback(
    async (
      id: string,
      isCorrect: boolean,
      timeSpent: number
    ) => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/questions/${id}/attempt`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isCorrect, timeSpent }),
          }
        );
        if (!res.ok) throw new Error("Failed to record attempt");
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error recording attempt");
        throw err;
      }
    },
    [token]
  );

  const fetchAttemptHistory = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/questions/${id}/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch history");
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching history");
        throw err;
      }
    },
    [token]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/questions/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching categories");
      throw err;
    }
  }, [token]);

  return {
    loading,
    error,
    fetchQuestions,
    fetchQuestion,
    recordAttempt,
    fetchAttemptHistory,
    fetchCategories,
  };
}
