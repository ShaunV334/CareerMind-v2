import { useState, useCallback } from "react";
import {
  StudyMaterial,
  StudyMaterialDetail,
  CreateMaterialRequest,
  StudyMaterialFilters,
} from "@/types/studyMaterials";

export function useStudyMaterials() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(
    async (filters?: StudyMaterialFilters) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.category) params.append("category", filters.category);
        if (filters?.type) params.append("type", filters.type);
        if (filters?.difficulty) params.append("difficulty", filters.difficulty);
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
          `http://localhost:3000/api/study-materials?${params}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to fetch materials");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error fetching materials";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMaterial = useCallback(
    async (id: string): Promise<StudyMaterialDetail> => {
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
          `http://localhost:3000/api/study-materials/${id}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to fetch material");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error fetching material";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createMaterial = useCallback(
    async (data: CreateMaterialRequest): Promise<StudyMaterial> => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(
          "http://localhost:3000/api/study-materials",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error("Failed to create material");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error creating material";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const toggleSaveMaterial = useCallback(
    async (materialId: string): Promise<{ saved: boolean }> => {
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(
          `http://localhost:3000/api/study-materials/${materialId}/save`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to toggle save");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error toggling save";
        setError(message);
        throw err;
      }
    },
    []
  );

  const fetchSavedMaterials = useCallback(
    async (limit?: number, offset?: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (limit) params.append("limit", limit.toString());
        if (offset) params.append("offset", offset.toString());

        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const res = await fetch(
          `http://localhost:3000/api/study-materials/saved/list?${params}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch saved materials");
        return await res.json();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error fetching saved materials";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteMaterial = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const res = await fetch(
        `http://localhost:3000/api/study-materials/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete material");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error deleting material";
      setError(message);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    fetchMaterials,
    fetchMaterial,
    createMaterial,
    toggleSaveMaterial,
    fetchSavedMaterials,
    deleteMaterial,
  };
}
