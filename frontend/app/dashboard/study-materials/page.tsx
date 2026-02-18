"use client";

import { useEffect, useState } from "react";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";
import { StudyMaterial, StudyMaterialDetail } from "@/types/studyMaterials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Search,
  ArrowLeft,
  Star,
  Eye,
  Heart,
  FileText,
  Video,
  BookMarked,
  ExternalLink,
  Bookmark,
} from "lucide-react";

const MATERIAL_TYPES = [
  { id: "guide", label: "Guide", icon: "📋" },
  { id: "video", label: "Video", icon: "🎥" },
  { id: "article", label: "Article", icon: "📄" },
  { id: "documentation", label: "Docs", icon: "📚" },
  { id: "book", label: "Book", icon: "📖" },
  { id: "course", label: "Course", icon: "🎓" },
];

const CATEGORIES = [
  "Data Structures",
  "Algorithms",
  "System Design",
  "Database Design",
  "Web Development",
  "Mobile Development",
  "Cloud Computing",
  "DevOps",
  "AI/ML",
  "Soft Skills",
  "Communication",
  "Leadership",
  "Time Management",
  "Problem Solving",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "mostPopular", label: "Most Popular" },
  { id: "topRated", label: "Top Rated" },
  { id: "mostSaved", label: "Most Saved" },
];

export default function StudyMaterialsPage() {
  const {
    loading,
    error,
    fetchMaterials,
    fetchMaterial,
    toggleSaveMaterial,
    fetchSavedMaterials,
  } = useStudyMaterials();

  // List view state
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 12;

  // Detail view state
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterialDetail | null>(null);

  // Load materials
  useEffect(() => {
    loadMaterials();
  }, [selectedCategory, selectedType, selectedDifficulty, searchTerm, sortBy, offset, showSavedOnly]);

  async function loadMaterials() {
    try {
      if (showSavedOnly) {
        const data = await fetchSavedMaterials(limit, offset);
        setMaterials(data.materials || []);
        setTotal(data.total || 0);
      } else {
        const data = await fetchMaterials({
          category: (selectedCategory as any) || undefined,
          type: (selectedType as any) || undefined,
          difficulty: (selectedDifficulty as any) || undefined,
          searchTerm: searchTerm || undefined,
          sortBy: (sortBy as "newest" | "mostPopular" | "topRated" | "mostSaved") || undefined,
          limit,
          offset,
        });
        setMaterials(data.materials || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load materials:", err);
    }
  }

  async function handleSelectMaterial(material: StudyMaterial) {
    try {
      const full = await fetchMaterial(material.id);
      setSelectedMaterial(full);
    } catch (err) {
      console.error("Failed to load material details:", err);
    }
  }

  async function handleToggleSave(materialId: string) {
    try {
      const result = await toggleSaveMaterial(materialId);
      // Update local state
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === materialId
            ? {
                ...m,
                isSaved: result.saved,
                savedCount: m.savedCount + (result.saved ? 1 : -1),
              }
            : m
        )
      );
      if (selectedMaterial && selectedMaterial.id === materialId) {
        setSelectedMaterial({
          ...selectedMaterial,
          isSaved: result.saved,
          savedCount: selectedMaterial.savedCount + (result.saved ? 1 : -1),
        });
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  }

  // List View
  if (!selectedMaterial) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Study Materials</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Access curated study guides, videos, articles, and resources to boost your learning.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setOffset(0);
                }}
                className="pl-10"
              />
            </div>

            {/* Material Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedType("");
                    setOffset(0);
                  }}
                >
                  All
                </Button>
                {MATERIAL_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedType(type.id);
                      setOffset(0);
                    }}
                  >
                    {type.icon} {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setOffset(0);
                }}
                className="w-full p-2 border rounded-md dark:bg-gray-900"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDifficulty === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedDifficulty("");
                    setOffset(0);
                  }}
                >
                  All
                </Button>
                {DIFFICULTIES.map((diff) => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      setOffset(0);
                    }}
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    variant={sortBy === opt.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSortBy(opt.id);
                      setOffset(0);
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Saved Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="savedOnly"
                checked={showSavedOnly}
                onChange={(e) => {
                  setShowSavedOnly(e.target.checked);
                  setOffset(0);
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="savedOnly" className="text-sm font-medium cursor-pointer">
                Show saved materials only
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Materials Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Loading materials...
            </div>
          ) : materials.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <p className="text-gray-500 mb-4">
                  No materials found. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <Card
                  key={material.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                  onClick={() => handleSelectMaterial(material)}
                >
                  {/* Thumbnail */}
                  {material.thumbnail && (
                    <div className="w-full h-40 bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  )}

                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {material.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          by {material.author}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSave(material.id);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            material.isSaved ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {material.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {material.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {material.difficulty}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {material.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {material.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {material.savedCount}
                      </span>
                    </div>

                    {/* Duration */}
                    {material.duration && (
                      <p className="text-xs text-gray-500">
                        ⏱️ {material.duration}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex gap-2 items-center justify-center">
            <Button
              variant="outline"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Detail View
  if (selectedMaterial) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedMaterial(null)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Materials
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Material Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl">
                      {selectedMaterial.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      by {selectedMaterial.author} • {selectedMaterial.source}
                    </CardDescription>
                  </div>
                </div>

                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  {selectedMaterial.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedMaterial.type}</Badge>
                  <Badge variant="outline">{selectedMaterial.difficulty}</Badge>
                  <Badge variant="outline">{selectedMaterial.category}</Badge>
                  {selectedMaterial.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* CTA Button */}
                <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Full Material
                  </Button>
                </a>

                {/* Duration */}
                {selectedMaterial.duration && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ⏱️ Duration: {selectedMaterial.duration}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Related Materials */}
            {selectedMaterial.relatedMaterials && selectedMaterial.relatedMaterials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedMaterial.relatedMaterials.map((related) => (
                    <div
                      key={related.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition"
                      onClick={() => handleSelectMaterial(related)}
                    >
                      <p className="font-medium text-sm">{related.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {related.author}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {related.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {related.difficulty}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Material Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedMaterial.views}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {selectedMaterial.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Saved</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {selectedMaterial.savedCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={() => handleToggleSave(selectedMaterial.id)}
              variant={selectedMaterial.isSaved ? "default" : "outline"}
              className="w-full gap-2"
              size="lg"
            >
              <Bookmark
                className={`w-5 h-5 ${
                  selectedMaterial.isSaved ? "fill-current" : ""
                }`}
              />
              {selectedMaterial.isSaved ? "Saved" : "Save Material"}
            </Button>

            {/* Material Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedMaterial.type}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Category</p>
                  <p className="font-medium">{selectedMaterial.category}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Difficulty</p>
                  <Badge variant="outline">{selectedMaterial.difficulty}</Badge>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Source</p>
                  <p className="font-medium">{selectedMaterial.source}</p>
                </div>
                {selectedMaterial.duration && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                    <p className="font-medium">{selectedMaterial.duration}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
