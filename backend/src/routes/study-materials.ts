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
    return { error: null, user: null }
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    return { error: null, user: { userId: payload.userId, email: payload.email } }
  } catch (e) {
    return { error: null, user: null }
  }
}

const studyMaterials = new Hono()

studyMaterials.use(async (c, next) => {
  await connect()
  await next()
})

// GET /api/study-materials - Get all study materials with filters
studyMaterials.get("/", async (c) => {
  try {
    const auth = await verifyAuth(c)
    const userId = auth.user?.userId || "anonymous"

    const db = getDb()
    const materialsCollection = db.collection("study_materials")

    // Query parameters for filtering and pagination
    const category = c.req.query("category")
    const type = c.req.query("type")
    const difficulty = c.req.query("difficulty")
    const searchTerm = c.req.query("searchTerm")
    const sortBy = c.req.query("sortBy") || "newest"
    const limit = parseInt(c.req.query("limit") || "20")
    const offset = parseInt(c.req.query("offset") || "0")

    // Build filter
    let filter: any = {}
    if (category) filter.category = category
    if (type) filter.type = type
    if (difficulty) filter.difficulty = difficulty
    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { tags: { $in: [new RegExp(searchTerm, "i")] } },
      ]
    }

    // Determine sort order
    let sortOrder: any = { createdAt: -1 }
    if (sortBy === "mostPopular") {
      sortOrder = { views: -1, createdAt: -1 }
    } else if (sortBy === "topRated") {
      sortOrder = { rating: -1, ratingCount: -1, createdAt: -1 }
    } else if (sortBy === "mostSaved") {
      sortOrder = { savedCount: -1, createdAt: -1 }
    }

    const materials = await materialsCollection
      .find(filter)
      .sort(sortOrder)
      .skip(offset)
      .limit(limit)
      .toArray()

    const total = await materialsCollection.countDocuments(filter)

    // Format materials and check if saved by current user
    const formattedMaterials = materials.map((m: any) => ({
      id: m._id.toString(),
      title: m.title,
      description: m.description,
      category: m.category,
      type: m.type,
      difficulty: m.difficulty,
      author: m.author,
      source: m.source,
      url: m.url,
      duration: m.duration,
      tags: m.tags || [],
      thumbnail: m.thumbnail,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      views: m.views || 0,
      rating: m.rating || 0,
      ratingCount: m.ratingCount || 0,
      savedCount: m.savedCount || 0,
      isSaved: m.savedBy?.includes(userId) || false,
    }))

    return c.json({
      materials: formattedMaterials,
      total,
      limit,
      offset,
    })
  } catch (err: any) {
    console.error("ERROR in GET /api/study-materials:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// GET /api/study-materials/:id - Get single material detail
studyMaterials.get("/:id", async (c) => {
  try {
    const auth = await verifyAuth(c)
    const userId = auth.user?.userId || "anonymous"
    const { id } = c.req.param()

    const db = getDb()
    const materialsCollection = db.collection("study_materials")

    // Get current material first
    const material = await materialsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!material) {
      return c.json({ error: "Material not found" }, 404)
    }

    // Only increment view count if user hasn't viewed before
    const viewedBy = material.viewedBy || []
    if (!viewedBy.includes(userId)) {
      await materialsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: { views: 1 },
          $push: { viewedBy: userId },
        }
      )
    }

    // Get related materials (same category)
    const relatedMaterials = await materialsCollection
      .find({
        _id: { $ne: new ObjectId(id) },
        category: material.category,
      })
      .limit(3)
      .toArray()

    const formattedRelated = relatedMaterials.map((m: any) => ({
      id: m._id.toString(),
      title: m.title,
      description: m.description,
      category: m.category,
      type: m.type,
      difficulty: m.difficulty,
      author: m.author,
      source: m.source,
      url: m.url,
      duration: m.duration,
      tags: m.tags || [],
      thumbnail: m.thumbnail,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      views: m.views || 0,
      rating: m.rating || 0,
      ratingCount: m.ratingCount || 0,
      savedCount: m.savedCount || 0,
      isSaved: m.savedBy?.includes(userId) || false,
    }))

    return c.json({
      id: material._id.toString(),
      title: material.title,
      description: material.description,
      category: material.category,
      type: material.type,
      difficulty: material.difficulty,
      author: material.author,
      source: material.source,
      url: material.url,
      duration: material.duration,
      tags: material.tags || [],
      thumbnail: material.thumbnail,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
      views: material.views || 0,
      rating: material.rating || 0,
      ratingCount: material.ratingCount || 0,
      savedCount: material.savedCount || 0,
      isSaved: material.savedBy?.includes(userId) || false,
      relatedMaterials: formattedRelated,
    })
  } catch (err: any) {
    console.error("ERROR in GET /api/study-materials/:id:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// POST /api/study-materials - Create new material (admin only)
studyMaterials.post("/", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error || !auth.user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const body = await c.req.json()
    const { title, description, category, type, difficulty, author, source, url, duration, tags, thumbnail } = body

    if (!title || !description || !category || !type || !difficulty || !url) {
      return c.json({ error: "Missing required fields" }, 400)
    }

    const db = getDb()
    const materialsCollection = db.collection("study_materials")

    const newMaterial = {
      title,
      description,
      category,
      type,
      difficulty,
      author: author || "Unknown",
      source: source || "Unknown",
      url,
      duration: duration || null,
      tags: tags || [],
      thumbnail: thumbnail || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      rating: 0,
      ratingCount: 0,
      savedCount: 0,
      savedBy: [],
      viewedBy: [],
    }

    const result = await materialsCollection.insertOne(newMaterial)

    return c.json(
      {
        id: result.insertedId.toString(),
        ...newMaterial,
      },
      201
    )
  } catch (err: any) {
    console.error("ERROR in POST /api/study-materials:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// PUT /api/study-materials/:id/save - Toggle save/bookmark
studyMaterials.put("/:id/save", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error || !auth.user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const { id } = c.req.param()
    const userId = auth.user.userId

    const db = getDb()
    const materialsCollection = db.collection("study_materials")

    const material = await materialsCollection.findOne({
      _id: new ObjectId(id),
    })
    if (!material) {
      return c.json({ error: "Material not found" }, 404)
    }

    const savedBy = material.savedBy || []
    const alreadySaved = savedBy.includes(userId)

    if (alreadySaved) {
      await materialsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { savedBy: userId }, $inc: { savedCount: -1 } }
      )
    } else {
      await materialsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { savedBy: userId }, $inc: { savedCount: 1 } }
      )
    }

    return c.json({ success: true, saved: !alreadySaved })
  } catch (err: any) {
    console.error("ERROR in PUT /api/study-materials/:id/save:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// GET /api/study-materials/saved - Get user's saved materials
studyMaterials.get("/saved/list", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error || !auth.user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const userId = auth.user.userId
    const db = getDb()
    const materialsCollection = db.collection("study_materials")

    const limit = parseInt(c.req.query("limit") || "20")
    const offset = parseInt(c.req.query("offset") || "0")

    const materials = await materialsCollection
      .find({ savedBy: userId })
      .skip(offset)
      .limit(limit)
      .toArray()

    const total = await materialsCollection.countDocuments({ savedBy: userId })

    const formattedMaterials = materials.map((m: any) => ({
      id: m._id.toString(),
      title: m.title,
      description: m.description,
      category: m.category,
      type: m.type,
      difficulty: m.difficulty,
      author: m.author,
      source: m.source,
      url: m.url,
      duration: m.duration,
      tags: m.tags || [],
      thumbnail: m.thumbnail,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      views: m.views || 0,
      rating: m.rating || 0,
      ratingCount: m.ratingCount || 0,
      savedCount: m.savedCount || 0,
      isSaved: true,
    }))

    return c.json({
      materials: formattedMaterials,
      total,
      limit,
      offset,
    })
  } catch (err: any) {
    console.error("ERROR in GET /api/study-materials/saved:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

// DELETE /api/study-materials/:id - Delete material (admin only)
studyMaterials.delete("/:id", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error || !auth.user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const { id } = c.req.param()
    const db = getDb()
    const materialsCollection = db.collection("study_materials")

    const material = await materialsCollection.findOne({
      _id: new ObjectId(id),
    })
    if (!material) {
      return c.json({ error: "Material not found" }, 404)
    }

    await materialsCollection.deleteOne({ _id: new ObjectId(id) })

    return c.json({ success: true })
  } catch (err: any) {
    console.error("ERROR in DELETE /api/study-materials/:id:", err)
    return c.json({ error: err.message || "Internal server error" }, 500)
  }
})

export default studyMaterials
