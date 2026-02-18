import { useState, useCallback } from "react";
import {
  Discussion,
  DiscussionDetail,
  Reply,
  CreateDiscussionRequest,
  CreateReplyRequest,
  DiscussionFilters,
} from "@/types/groupDiscussions";

export function useGroupDiscussions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscussions = useCallback(
    async (filters?: DiscussionFilters) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.category) params.append("category", filters.category);
        if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);
        if (filters?.sortBy) params.append("sortBy", filters.sortBy);
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.offset) params.append("offset", filters.offset.toString());

        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(
          `http://localhost:3000/api/group-discussions?${params}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to fetch discussions");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error fetching discussions";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchDiscussion = useCallback(
    async (id: string): Promise<DiscussionDetail> => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(
          `http://localhost:3000/api/group-discussions/${id}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to fetch discussion");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error fetching discussion";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createDiscussion = useCallback(
    async (data: CreateDiscussionRequest): Promise<Discussion> => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(
          "http://localhost:3000/api/group-discussions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error("Failed to create discussion");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error creating discussion";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addReply = useCallback(
    async (
      discussionId: string,
      data: CreateReplyRequest
    ): Promise<Reply> => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(
          `http://localhost:3000/api/group-discussions/${discussionId}/replies`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error("Failed to add reply");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error adding reply";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const toggleLikeDiscussion = useCallback(
    async (discussionId: string): Promise<{ liked: boolean }> => {
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(
          `http://localhost:3000/api/group-discussions/${discussionId}/like`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to toggle like");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error toggling like";
        setError(message);
        throw err;
      }
    },
    []
  );

  const toggleLikeReply = useCallback(
    async (replyId: string): Promise<{ liked: boolean }> => {
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(
          `http://localhost:3000/api/group-discussions/replies/${replyId}/like`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to toggle like");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error toggling like";
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteDiscussion = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const res = await fetch(
        `http://localhost:3000/api/group-discussions/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete discussion");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error deleting discussion";
      setError(message);
      throw err;
    }
  }, []);

  const deleteReply = useCallback(
    async (discussionId: string, replyId: string): Promise<void> => {
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(
          `http://localhost:3000/api/group-discussions/${discussionId}/replies/${replyId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to delete reply");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error deleting reply";
        setError(message);
        throw err;
      }
    },
    []
  );

  return {
    loading,
    error,
    fetchDiscussions,
    fetchDiscussion,
    createDiscussion,
    addReply,
    toggleLikeDiscussion,
    toggleLikeReply,
    deleteDiscussion,
    deleteReply,
  };
}
