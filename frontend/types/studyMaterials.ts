// frontend/types/studyMaterials.ts

export type MaterialType = "guide" | "video" | "article" | "documentation" | "book" | "course";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type Category = 
  | "Data Structures"
  | "Algorithms"
  | "System Design"
  | "Database Design"
  | "Web Development"
  | "Mobile Development"
  | "Cloud Computing"
  | "DevOps"
  | "AI/ML"
  | "Soft Skills"
  | "Communication"
  | "Leadership"
  | "Time Management"
  | "Problem Solving";

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  category: Category;
  type: MaterialType;
  difficulty: DifficultyLevel;
  author: string;
  source: string;
  url: string;
  duration?: string; // For videos: "45 mins", "2 hours"
  tags: string[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  rating: number; // 0-5
  ratingCount: number;
  savedCount: number;
  isSaved?: boolean; // For current user
}

export interface StudyMaterialDetail extends StudyMaterial {
  fullContent?: string;
  relatedMaterials?: StudyMaterial[];
  reviews?: MaterialReview[];
}

export interface MaterialReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateMaterialRequest {
  title: string;
  description: string;
  category: Category;
  type: MaterialType;
  difficulty: DifficultyLevel;
  author: string;
  source: string;
  url: string;
  duration?: string;
  tags?: string[];
  thumbnail?: string;
}

export interface StudyMaterialFilters {
  category?: Category;
  type?: MaterialType;
  difficulty?: DifficultyLevel;
  searchTerm?: string;
  sortBy?: "newest" | "mostPopular" | "topRated" | "mostSaved";
  limit?: number;
  offset?: number;
}
