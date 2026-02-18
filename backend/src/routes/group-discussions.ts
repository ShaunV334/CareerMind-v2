import { Hono } from "hono"
import { getDb, connect } from "../db.js"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"

// Middleware to verify JWT and extract userId
async function verifyAuth(c: any) {
  const authHeader = c.req.header("authorization") || ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  
  if (!token) {
    return { error: "Missing token", user: null }
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    return { error: null, user: { userId: payload.userId, email: payload.email } }
  } catch (e) {
    return { error: "Invalid token", user: null }
  }
}

const groupDiscussions = new Hono()

groupDiscussions.use(async (c, next) => {
  await connect()
  await next()
})

// GET /api/group-discussions - Get all discussions with filters
groupDiscussions.get("/", async (c) => {
  try {
    const auth = await verifyAuth(c)
    const userId = auth.user?.userId || "anonymous"

    const db = getDb()
    const discussionsCollection = db.collection("discussions")

    // Query parameters for filtering and pagination
    const category = c.req.query("category")
    const searchTerm = c.req.query("searchTerm")
    const sortBy = c.req.query("sortBy") || "newest"
    const limit = parseInt(c.req.query("limit") || "20")
    const offset = parseInt(c.req.query("offset") || "0")

    // Build filter
    let filter: any = {}
    if (category) {
      filter.category = category
    }
    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ]
    }

    // Determine sort order
    let sortOrder: any = { createdAt: -1 }
    if (sortBy === "mostActive") {
      sortOrder = { replyCount: -1, createdAt: -1 }
    } else if (sortBy === "mostLiked") {
      sortOrder = { likes: -1, createdAt: -1 }
    }

    const discussions = await discussionsCollection
      .find(filter)
      .sort(sortOrder)
      .skip(offset)
      .limit(limit)
      .toArray()

    const total = await discussionsCollection.countDocuments(filter)

    // Format discussions
    const formattedDiscussions = discussions.map((d: any) => ({
      id: d._id.toString(),
      title: d.title,
      description: d.description,
      category: d.category,
      author: {
        id: d.authorId,
        name: d.authorName,
        email: d.authorEmail,
        avatar: d.authorAvatar,
      },
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      viewCount: d.viewCount || 0,
      replyCount: d.replyCount || 0,
      likes: d.likes || 0,
      liked: d.likedBy?.includes(userId) || false,
      isPinned: d.isPinned || false,
      tags: d.tags || [],
    }))

    return c.json({
      discussions: formattedDiscussions,
      total,
      limit,
      offset,
    })
  } catch (err: any) {
    console.error("ERROR in GET /api/group-discussions:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// GET /api/group-discussions/:id - Get single discussion with replies
groupDiscussions.get("/:id", async (c) => {
  try {
    const auth = await verifyAuth(c)
    const userId = auth.user?.userId || "anonymous"
    const { id } = c.req.param()

    const db = getDb()
    const discussionsCollection = db.collection("discussions")
    const repliesCollection = db.collection("discussion_replies")

    // Get current discussion first
    const discussion = await discussionsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!discussion) {
      return c.json({ error: "Discussion not found" }, 404)
    }

    // Only increment view count if user hasn't viewed before
    const viewedBy = discussion.viewedBy || []
    if (!viewedBy.includes(userId)) {
      await discussionsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: { viewCount: 1 },
          $push: { viewedBy: userId },
        }
      )
    }

    if (!discussion) {
      return c.json({ error: "Discussion not found" }, 404)
    }

    // Get replies
    const replies = await repliesCollection
      .find({ discussionId: id })
      .sort({ createdAt: 1 })
      .toArray()

    const formattedReplies = replies.map((r: any) => ({
      id: r._id.toString(),
      discussionId: r.discussionId,
      content: r.content,
      author: {
        id: r.authorId,
        name: r.authorName,
        email: r.authorEmail,
        avatar: r.authorAvatar,
      },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      likes: r.likes || 0,
      liked: r.likedBy?.includes(userId) || false,
      isAnswer: r.isAnswer || false,
    }))

    return c.json({
      id: discussion._id.toString(),
      title: discussion.title,
      description: discussion.description,
      content: discussion.content,
      category: discussion.category,
      author: {
        id: discussion.authorId,
        name: discussion.authorName,
        email: discussion.authorEmail,
        avatar: discussion.authorAvatar,
      },
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      viewCount: discussion.viewCount || 0,
      replyCount: discussion.replyCount || 0,
      likes: discussion.likes || 0,
      liked: discussion.likedBy?.includes(userId) || false,
      isPinned: discussion.isPinned || false,
      tags: discussion.tags || [],
      replies: formattedReplies,
    })
  } catch (err: any) {
    console.error("ERROR in GET /api/group-discussions/:id:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// POST /api/group-discussions - Create new discussion
groupDiscussions.post("/", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) {
      return c.json({ error: auth.error }, 401)
    }

    const body = await c.req.json()
    const { title, description, content, category, tags } = body

    if (!title || !description || !content || !category) {
      return c.json({ error: "Missing required fields" }, 400)
    }

    const db = getDb()
    const discussionsCollection = db.collection("discussions")

    const newDiscussion = {
      title,
      description,
      content,
      category,
      tags: tags || [],
      authorId: auth.user!.userId,
      authorName: auth.user!.email?.split("@")[0] || "Anonymous",
      authorEmail: auth.user!.email,
      authorAvatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      replyCount: 0,
      likes: 0,
      likedBy: [],
      isPinned: false,
    }

    const result = await discussionsCollection.insertOne(newDiscussion)

    return c.json(
      {
        id: result.insertedId.toString(),
        ...newDiscussion,
      },
      201
    )
  } catch (err: any) {
    console.error("ERROR in POST /api/group-discussions:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// POST /api/group-discussions/:id/replies - Add reply to discussion
groupDiscussions.post("/:id/replies", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) {
      return c.json({ error: auth.error }, 401)
    }

    const { id } = c.req.param()
    const body = await c.req.json()
    const { content } = body

    if (!content) {
      return c.json({ error: "Reply content is required" }, 400)
    }

    const db = getDb()
    const repliesCollection = db.collection("discussion_replies")
    const discussionsCollection = db.collection("discussions")

    // Verify discussion exists
    const discussion = await discussionsCollection.findOne({
      _id: new ObjectId(id),
    })
    if (!discussion) {
      return c.json({ error: "Discussion not found" }, 404)
    }

    const newReply = {
      discussionId: id,
      content,
      authorId: auth.user!.userId,
      authorName: auth.user!.email?.split("@")[0] || "Anonymous",
      authorEmail: auth.user!.email,
      authorAvatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      isAnswer: false,
    }

    const result = await repliesCollection.insertOne(newReply)

    // Update reply count in discussion
    await discussionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { replyCount: 1 } }
    )

    return c.json(
      {
        id: result.insertedId.toString(),
        ...newReply,
      },
      201
    )
  } catch (err: any) {
    console.error("ERROR in POST /api/group-discussions/:id/replies:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// PUT /api/group-discussions/:id/like - Toggle like on discussion
groupDiscussions.put("/:id/like", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) {
      return c.json({ error: auth.error }, 401)
    }

    const { id } = c.req.param()
    const userId = auth.user!.userId

    const db = getDb()
    const discussionsCollection = db.collection("discussions")

    const discussion = await discussionsCollection.findOne({
      _id: new ObjectId(id),
    })
    if (!discussion) {
      return c.json({ error: "Discussion not found" }, 404)
    }

    const likedBy = discussion.likedBy || []
    const alreadyLiked = likedBy.includes(userId)

    if (alreadyLiked) {
      await discussionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { likedBy: userId }, $inc: { likes: -1 } }
      )
    } else {
      await discussionsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { likedBy: userId }, $inc: { likes: 1 } }
      )
    }

    return c.json({ success: true, liked: !alreadyLiked })
  } catch (err: any) {
    console.error("ERROR in PUT /api/group-discussions/:id/like:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// PUT /api/group-discussions/replies/:replyId/like - Toggle like on reply
groupDiscussions.put("/replies/:replyId/like", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) {
      return c.json({ error: auth.error }, 401)
    }

    const { replyId } = c.req.param()
    const userId = auth.user!.userId

    const db = getDb()
    const repliesCollection = db.collection("discussion_replies")

    const reply = await repliesCollection.findOne({
      _id: new ObjectId(replyId),
    })
    if (!reply) {
      return c.json({ error: "Reply not found" }, 404)
    }

    const likedBy = reply.likedBy || []
    const alreadyLiked = likedBy.includes(userId)

    if (alreadyLiked) {
      await repliesCollection.updateOne(
        { _id: new ObjectId(replyId) },
        { $pull: { likedBy: userId }, $inc: { likes: -1 } }
      )
    } else {
      await repliesCollection.updateOne(
        { _id: new ObjectId(replyId) },
        { $push: { likedBy: userId }, $inc: { likes: 1 } }
      )
    }

    return c.json({ success: true, liked: !alreadyLiked })
  } catch (err: any) {
    console.error("ERROR in PUT /api/group-discussions/replies/:replyId/like:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// DELETE /api/group-discussions/:id - Delete discussion (only author)
groupDiscussions.delete("/:id", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) {
      return c.json({ error: auth.error }, 401)
    }

    const { id } = c.req.param()
    const db = getDb()
    const discussionsCollection = db.collection("discussions")

    const discussion = await discussionsCollection.findOne({
      _id: new ObjectId(id),
    })
    if (!discussion) {
      return c.json({ error: "Discussion not found" }, 404)
    }

    if (discussion.authorId !== auth.user!.userId) {
      return c.json({ error: "Unauthorized" }, 403)
    }

    await discussionsCollection.deleteOne({ _id: new ObjectId(id) })
    // Also delete all replies to this discussion
    const repliesCollection = db.collection("discussion_replies")
    await repliesCollection.deleteMany({ discussionId: id })

    return c.json({ success: true })
  } catch (err: any) {
    console.error("ERROR in DELETE /api/group-discussions/:id:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// DELETE /api/group-discussions/:id/replies/:replyId - Delete reply (only author)
groupDiscussions.delete("/:id/replies/:replyId", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) {
      return c.json({ error: auth.error }, 401)
    }

    const { id, replyId } = c.req.param()
    const db = getDb()
    const repliesCollection = db.collection("discussion_replies")

    const reply = await repliesCollection.findOne({
      _id: new ObjectId(replyId),
    })
    if (!reply) {
      return c.json({ error: "Reply not found" }, 404)
    }

    if (reply.authorId !== auth.user!.userId) {
      return c.json({ error: "Unauthorized" }, 403)
    }

    await repliesCollection.deleteOne({ _id: new ObjectId(replyId) })

    // Decrement reply count
    const discussionsCollection = db.collection("discussions")
    await discussionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { replyCount: -1 } }
    )

    return c.json({ success: true })
  } catch (err: any) {
    console.error("ERROR in DELETE /api/group-discussions/:id/replies/:replyId:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

export default groupDiscussions
