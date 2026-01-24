import { Hono } from "hono";
import { getDb } from "../db";
import { getUser } from "../middleware";

const app = new Hono();

// Get all questions (with filtering and pagination)
app.get("/", getUser, async (c) => {
  const userId = c.get("userId");
  const { category, difficulty, search, limit = 20, skip = 0 } = c.req.query();

  try {
    const db = getDb();
    const collection = db.collection("questions");
    const filter: any = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const total = await collection.countDocuments(filter);
    const questions = await collection
      .find(filter)
      .skip(parseInt(skip as string) || 0)
      .limit(parseInt(limit as string) || 20)
      .toArray();

    // Don't include correctAnswer in response (for practice mode)
    const questionsWithoutAnswers = questions.map((q: any) => ({
      ...q,
      id: q._id?.toString(),
      _id: undefined,
      correctAnswer: undefined,
    }));

    return c.json({ questions: questionsWithoutAnswers, total });
  } catch (error) {
    return c.json({ error: "Failed to fetch questions" }, 500);
  }
});

// Get question by ID (includes answer for studying)
app.get("/:id", getUser, async (c) => {
  const { id } = c.req.param();
  const mode = c.req.query("mode"); // "study" or "practice"

  try {
    const db = getDb();
    const collection = db.collection("questions");
    const question = await collection.findOne({
      _id: new (await import("mongodb")).ObjectId(id),
    });

    if (!question) return c.json({ error: "Question not found" }, 404);

    const result = {
      ...question,
      id: question._id?.toString(),
      _id: undefined,
    };

    // Only include answer in study mode
    if (mode !== "study") delete result.correctAnswer;

    return c.json(result);
  } catch (error) {
    return c.json({ error: "Failed to fetch question" }, 500);
  }
});

// Create question (admin only - not exposed in UI yet)
app.post("/", getUser, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  try {
    const db = getDb();
    const collection = db.collection("questions");
    const result = await collection.insertOne({
      ...body,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attempts: 0,
      correctAttempts: 0,
    });

    return c.json({
      id: result.insertedId.toString(),
      ...body,
    });
  } catch (error) {
    return c.json({ error: "Failed to create question" }, 500);
  }
});

// Update question
app.put("/:id", getUser, async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const db = getDb();
    const collection = db.collection("questions");
    const result = await collection.updateOne(
      { _id: new (await import("mongodb")).ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0)
      return c.json({ error: "Question not found" }, 404);

    return c.json({ ok: true });
  } catch (error) {
    return c.json({ error: "Failed to update question" }, 500);
  }
});

// Delete question
app.delete("/:id", getUser, async (c) => {
  const { id } = c.req.param();

  try {
    const db = getDb();
    const collection = db.collection("questions");
    const result = await collection.deleteOne({
      _id: new (await import("mongodb")).ObjectId(id),
    });

    if (result.deletedCount === 0)
      return c.json({ error: "Question not found" }, 404);

    return c.json({ ok: true });
  } catch (error) {
    return c.json({ error: "Failed to delete question" }, 500);
  }
});

// Record attempt
app.post("/:id/attempt", getUser, async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();
  const { isCorrect, timeSpent } = await c.req.json();

  try {
    const db = getDb();
    const collection = db.collection("questions");
    const attemptCollection = db.collection("question_attempts");

    // Record the attempt
    await attemptCollection.insertOne({
      userId,
      questionId: id,
      isCorrect,
      timeSpent,
      createdAt: new Date(),
    });

    // Update question stats
    await collection.updateOne(
      { _id: new (await import("mongodb")).ObjectId(id) },
      {
        $inc: {
          attempts: 1,
          correctAttempts: isCorrect ? 1 : 0,
        },
      }
    );

    return c.json({ ok: true });
  } catch (error) {
    return c.json({ error: "Failed to record attempt" }, 500);
  }
});

// Get user's attempt history
app.get("/:id/history", getUser, async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.param();

  try {
    const db = getDb();
    const collection = db.collection("question_attempts");
    const attempts = await collection
      .find({ userId, questionId: id })
      .sort({ createdAt: -1 })
      .toArray();

    const stats = {
      total: attempts.length,
      correct: attempts.filter((a: any) => a.isCorrect).length,
      incorrect: attempts.filter((a: any) => !a.isCorrect).length,
      accuracy:
        attempts.length > 0
          ? Math.round(
              (attempts.filter((a: any) => a.isCorrect).length /
                attempts.length) *
                100
            )
          : 0,
      attempts: attempts.slice(0, 10), // Last 10 attempts
    };

    return c.json(stats);
  } catch (error) {
    return c.json({ error: "Failed to fetch history" }, 500);
  }
});

// Get categories
app.get("/categories", getUser, async (c) => {
  try {
    const db = getDb();
    const collection = db.collection("questions");
    const categories = await collection.distinct("category");
    return c.json({ categories });
  } catch (error) {
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

export default app;
