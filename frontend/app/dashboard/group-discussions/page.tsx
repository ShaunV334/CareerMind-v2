"use client";

import { useEffect, useState } from "react";
import { useGroupDiscussions } from "@/hooks/useGroupDiscussions";
import { Discussion, DiscussionDetail } from "@/types/groupDiscussions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  Eye,
  Clock,
  User,
} from "lucide-react";

const CATEGORIES = [
  { id: "interview", label: "Interview" },
  { id: "aptitude", label: "Aptitude" },
  { id: "resume", label: "Resume" },
  { id: "companies", label: "Companies" },
  { id: "general", label: "General" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "mostActive", label: "Most Active" },
  { id: "mostLiked", label: "Most Liked" },
];

export default function GroupDiscussionsPage() {
  const {
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
  } = useGroupDiscussions();

  // List view state
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  // Detail view state
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<DiscussionDetail | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Create view state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    description: "",
    content: "",
    category: "general" as const,
    tags: "",
  });
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);

  // Load discussions
  useEffect(() => {
    loadDiscussions();
  }, [selectedCategory, searchTerm, sortBy, offset]);

  async function loadDiscussions() {
    try {
      const data = await fetchDiscussions({
        category: selectedCategory || undefined,
        searchTerm: searchTerm || undefined,
        sortBy: (sortBy as "newest" | "mostActive" | "mostLiked") || undefined,
        limit,
        offset,
      });
      setDiscussions(data.discussions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load discussions:", err);
    }
  }

  async function handleSelectDiscussion(discussion: Discussion) {
    try {
      const full = await fetchDiscussion(discussion.id);
      setSelectedDiscussion(full);
      setReplyContent("");
    } catch (err) {
      console.error("Failed to load discussion details:", err);
    }
  }

  async function handleCreateDiscussion() {
    if (
      !newDiscussion.title.trim() ||
      !newDiscussion.description.trim() ||
      !newDiscussion.content.trim()
    ) {
      return;
    }

    setCreatingDiscussion(true);
    try {
      const tags = newDiscussion.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      await createDiscussion({
        title: newDiscussion.title,
        description: newDiscussion.description,
        content: newDiscussion.content,
        category: newDiscussion.category,
        tags,
      });

      setNewDiscussion({
        title: "",
        description: "",
        content: "",
        category: "general",
        tags: "",
      });
      setShowCreateForm(false);
      loadDiscussions();
    } catch (err) {
      console.error("Failed to create discussion:", err);
    } finally {
      setCreatingDiscussion(false);
    }
  }

  async function handleAddReply() {
    if (!selectedDiscussion || !replyContent.trim()) return;

    setReplySubmitting(true);
    try {
      await addReply(selectedDiscussion.id, { content: replyContent });
      setReplyContent("");
      // Refresh discussion detail
      const updated = await fetchDiscussion(selectedDiscussion.id);
      setSelectedDiscussion(updated);
    } catch (err) {
      console.error("Failed to add reply:", err);
    } finally {
      setReplySubmitting(false);
    }
  }

  async function handleToggleLikeDiscussion() {
    if (!selectedDiscussion) return;

    try {
      const result = await toggleLikeDiscussion(selectedDiscussion.id);
      setSelectedDiscussion({
        ...selectedDiscussion,
        liked: result.liked,
        likes: selectedDiscussion.likes + (result.liked ? 1 : -1),
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  }

  async function handleToggleLikeReply(replyId: string) {
    if (!selectedDiscussion) return;

    try {
      const result = await toggleLikeReply(replyId);
      const updatedReplies = selectedDiscussion.replies.map((r) =>
        r.id === replyId
          ? {
              ...r,
              liked: result.liked,
              likes: r.likes + (result.liked ? 1 : -1),
            }
          : r
      );
      setSelectedDiscussion({
        ...selectedDiscussion,
        replies: updatedReplies,
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  }

  async function handleDeleteReply(replyId: string) {
    if (!selectedDiscussion) return;

    try {
      await deleteReply(selectedDiscussion.id, replyId);
      const updatedReplies = selectedDiscussion.replies.filter(
        (r) => r.id !== replyId
      );
      setSelectedDiscussion({
        ...selectedDiscussion,
        replies: updatedReplies,
        replyCount: selectedDiscussion.replyCount - 1,
      });
    } catch (err) {
      console.error("Failed to delete reply:", err);
    }
  }

  async function handleDeleteDiscussion(id: string) {
    try {
      await deleteDiscussion(id);
      setSelectedDiscussion(null);
      loadDiscussions();
    } catch (err) {
      console.error("Failed to delete discussion:", err);
    }
  }

  // List View
  if (!selectedDiscussion && !showCreateForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Group Discussions</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Participate in group discussions and improve your communication and
            leadership skills.
          </p>
        </div>

        {/* Create Button */}
        <Button
          onClick={() => setShowCreateForm(true)}
          className="gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Start New Discussion
        </Button>

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
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setOffset(0);
                }}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("");
                    setOffset(0);
                  }}
                >
                  All
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={
                      selectedCategory === cat.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setOffset(0);
                    }}
                  >
                    {cat.label}
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
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Discussions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500">
              Loading discussions...
            </div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <p className="text-gray-500 mb-4">
                  No discussions found. Start one now!
                </p>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectDiscussion(discussion)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl but">
                          {discussion.title}
                        </CardTitle>
                        {discussion.isPinned && (
                          <Badge variant="secondary">Pinned</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {discussion.description}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 pt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {discussion.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {discussion.viewCount} views
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Badge variant="outline">{discussion.category}</Badge>
                      {discussion.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {discussion.replyCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {discussion.likes}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
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
              Page {Math.floor(offset / limit) + 1} of{" "}
              {Math.ceil(total / limit)}
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

  // Create Form View
  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setShowCreateForm(false)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discussions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form - 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Start a New Discussion</CardTitle>
              <CardDescription>
                Create a new discussion thread to ask questions and share insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="What's your discussion about?"
                  value={newDiscussion.title}
                  onChange={(e) =>
                    setNewDiscussion({ ...newDiscussion, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Short Description
                </label>
                <Input
                  placeholder="Brief summary of your discussion"
                  value={newDiscussion.description}
                  onChange={(e) =>
                    setNewDiscussion({
                      ...newDiscussion,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Full Content
                </label>
                <textarea
                  placeholder="Write your discussion content here..."
                  value={newDiscussion.content}
                  onChange={(e) =>
                    setNewDiscussion({ ...newDiscussion, content: e.target.value })
                  }
                  className="w-full h-40 p-3 border rounded-md dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={newDiscussion.category}
                  onChange={(e) =>
                    setNewDiscussion({
                      ...newDiscussion,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border rounded-md dark:bg-gray-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tags (comma-separated, optional)
                </label>
                <Input
                  placeholder="e.g., javascript, react, web-development"
                  value={newDiscussion.tags}
                  onChange={(e) =>
                    setNewDiscussion({ ...newDiscussion, tags: e.target.value })
                  }
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateDiscussion}
                  disabled={
                    creatingDiscussion ||
                    !newDiscussion.title.trim() ||
                    !newDiscussion.content.trim()
                  }
                >
                  {creatingDiscussion ? "Creating..." : "Create Discussion"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Help - 1 column */}
          <div className="space-y-6">
            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <p className="font-medium mb-1">Be descriptive</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use a clear, specific title that describes your topic
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Add context</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Provide enough detail for others to understand and help
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Use tags wisely</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add relevant tags to help others find your discussion
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Categories Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <Badge variant="outline" className="mb-1">
                      {cat.label}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Detail View
  if (selectedDiscussion) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedDiscussion(null)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discussions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discussion Detail */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-3xl">
                      {selectedDiscussion.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedDiscussion.description}
                    </CardDescription>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div>
                    <p className="font-medium">{selectedDiscussion.author.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedDiscussion.content}
                </p>

                {/* Tags and Meta */}
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedDiscussion.category}</Badge>
                    {selectedDiscussion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedDiscussion.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {selectedDiscussion.replyCount} replies
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <Button
                    variant={selectedDiscussion.liked ? "default" : "outline"}
                    onClick={handleToggleLikeDiscussion}
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {selectedDiscussion.likes}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Replies Section */}
            <Card>
              <CardHeader>
                <CardTitle>Replies ({selectedDiscussion.replyCount})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reply Form */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Reply</label>
                  <textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full h-24 p-3 border rounded-md dark:bg-gray-900"
                  />
                  <Button
                    onClick={handleAddReply}
                    disabled={replySubmitting || !replyContent.trim()}
                  >
                    {replySubmitting ? "Posting..." : "Post Reply"}
                  </Button>
                </div>

                <Separator />

                {/* Replies List */}
                <div className="space-y-4">
                  {selectedDiscussion.replies.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No replies yet. Be the first to reply!
                    </p>
                  ) : (
                    selectedDiscussion.replies.map((reply) => (
                      <div key={reply.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{reply.author.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {reply.content}
                        </p>
                        <button
                          onClick={() => handleToggleLikeReply(reply.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${
                              reply.liked ? "fill-current" : ""
                            }`}
                          />
                          {reply.likes}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Discussion Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discussion Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                    <span className="font-semibold">{selectedDiscussion.viewCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Replies</span>
                    <span className="font-semibold">{selectedDiscussion.replyCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Likes</span>
                    <span className="font-semibold">{selectedDiscussion.likes}</span>
                  </div>
                  {selectedDiscussion.isPinned && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <Badge variant="default">Pinned</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-base py-2 px-3" variant="outline">
                  {selectedDiscussion.category.charAt(0).toUpperCase() + 
                   selectedDiscussion.category.slice(1)}
                </Badge>
                <p className="text-xs text-gray-500 mt-3">
                  {CATEGORIES.find(c => c.id === selectedDiscussion.category)?.label ||
                   selectedDiscussion.category}
                </p>
              </CardContent>
            </Card>

            {/* Discussion Author */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Author</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {selectedDiscussion.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedDiscussion.author.name}</p>
                    <p className="text-xs text-gray-500">{selectedDiscussion.author.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tags */}
            {selectedDiscussion.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedDiscussion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
