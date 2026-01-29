// backend/src/routes/companies.ts - MongoDB Implementation

import { Hono } from "hono";
import { getDb } from "../db.js";
import { ObjectId } from "mongodb";

const companies = new Hono();

/**
 * GET /companies
 * Get all companies with filters
 */
companies.get("/", async (c) => {
  try {
    const db = getDb();
    const { industry, search, limit = "20", skip = "0" } = c.req.query();

    const filter: any = {};
    if (industry) filter.industry = industry;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const companies = await db.collection("companies")
      .find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("companies").countDocuments(filter);

    return c.json({ companies, total });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return c.json({ error: "Failed to fetch companies" }, 500);
  }
});

/**
 * GET /companies/:companyId
 * Get company details
 */
companies.get("/:companyId", async (c) => {
  try {
    const db = getDb();
    const { companyId } = c.req.param();

    const company = await db.collection("companies").findOne({
      _id: new ObjectId(companyId)
    });

    if (!company) {
      return c.json({ error: "Company not found" }, 404);
    }

    return c.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return c.json({ error: "Failed to fetch company" }, 500);
  }
});

/**
 * GET /companies/:companyId/roles
 * Get roles for a company
 */
companies.get("/:companyId/roles", async (c) => {
  try {
    const db = getDb();
    const { companyId } = c.req.param();

    const roles = await db.collection("company_roles")
      .find({ companyId: new ObjectId(companyId) })
      .toArray();

    return c.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return c.json({ error: "Failed to fetch roles" }, 500);
  }
});

/**
 * GET /companies/:companyId/questions
 * Get questions for a company
 */
companies.get("/:companyId/questions", async (c) => {
  try {
    const db = getDb();
    const { companyId } = c.req.param();
    const { roleId, difficulty, limit = "20", skip = "0" } = c.req.query();

    const filter: any = { companyId: new ObjectId(companyId) };
    if (roleId) filter.companyRoleId = new ObjectId(roleId);
    if (difficulty) filter.avgDifficulty = difficulty;

    const questions = await db.collection("company_questions")
      .find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("company_questions").countDocuments(filter);

    return c.json({ questions, total });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return c.json({ error: "Failed to fetch questions" }, 500);
  }
});

/**
 * GET /companies/:companyId/tips
 * Get tips for a company
 */
companies.get("/:companyId/tips", async (c) => {
  try {
    const db = getDb();
    const { companyId } = c.req.param();
    const { limit = "20", skip = "0" } = c.req.query();

    const tips = await db.collection("company_interview_tips")
      .find({ companyId: new ObjectId(companyId) })
      .sort({ helpfulCount: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    return c.json(tips);
  } catch (error) {
    console.error("Error fetching tips:", error);
    return c.json({ error: "Failed to fetch tips" }, 500);
  }
});

/**
 * GET /companies/:companyId/user-progress
 * Get user's progress for a company
 */
companies.get("/:companyId/user-progress", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { companyId } = c.req.param();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const progress = await db.collection("user_company_progress").findOne({
      userId,
      companyId: new ObjectId(companyId)
    });

    return c.json(progress || { userId, companyId, status: "Not Started" });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return c.json({ error: "Failed to fetch progress" }, 500);
  }
});

/**
 * POST /companies/:companyId/start-practice
 * Start practice for a company
 */
companies.post("/:companyId/start-practice", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { companyId } = c.req.param();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const { roleId, questionCount, timeLimit, difficultyFilter } = await c.req.json();

    if (!questionCount || questionCount < 1 || questionCount > 50) {
      return c.json({ error: "Invalid question count" }, 400);
    }

    const session = {
      userId,
      companyId: new ObjectId(companyId),
      companyRoleId: roleId ? new ObjectId(roleId) : null,
      sessionStartTime: new Date(),
      totalQuestions: questionCount,
      questionsCorrect: 0,
      sessionStatus: "In Progress",
      difficultyFilter
    };

    const result = await db.collection("company_practice_sessions").insertOne(session);

    return c.json({ sessionId: result.insertedId, ...session });
  } catch (error) {
    console.error("Error starting practice:", error);
    return c.json({ error: "Failed to start practice session" }, 500);
  }
});

/**
 * POST /companies/:companyId/sessions/:sessionId/complete
 * Complete a practice session
 */
companies.post("/:companyId/sessions/:sessionId/complete", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { sessionId } = c.req.param();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const session = await db.collection("company_practice_sessions").findOne({
      _id: new ObjectId(sessionId),
      userId
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    const accuracyPercentage = (session.questionsCorrect / session.totalQuestions) * 100;

    await db.collection("company_practice_sessions").updateOne(
      { _id: new ObjectId(sessionId) },
      {
        $set: {
          sessionEndTime: new Date(),
          sessionStatus: "Completed",
          accuracyPercentage
        }
      }
    );

    return c.json({
      sessionId,
      totalQuestions: session.totalQuestions,
      correctAnswers: session.questionsCorrect,
      accuracyPercentage
    });
  } catch (error) {
    console.error("Error completing session:", error);
    return c.json({ error: "Failed to complete session" }, 500);
  }
});

/**
 * POST /companies/:companyId/tips
 * Share a tip for a company
 */
companies.post("/:companyId/tips", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { companyId } = c.req.param();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const { roleId, tipCategory, tipText } = await c.req.json();

    if (!tipText || tipText.trim().length < 10) {
      return c.json({ error: "Tip must be at least 10 characters" }, 400);
    }

    const tip = {
      companyId: new ObjectId(companyId),
      companyRoleId: roleId ? new ObjectId(roleId) : null,
      tipCategory,
      tipText,
      authorUserId: userId,
      helpfulCount: 0,
      createdAt: new Date()
    };

    const result = await db.collection("company_interview_tips").insertOne(tip);

    return c.json({ id: result.insertedId, message: "Tip saved successfully" });
  } catch (error) {
    console.error("Error saving tip:", error);
    return c.json({ error: "Failed to save tip" }, 500);
  }
});

/**
 * GET /companies/trending
 * Get trending companies
 */
companies.get("/trending", async (c) => {
  try {
    const db = getDb();
    const { limit = "10" } = c.req.query();

    const companies = await db.collection("companies")
      .find({})
      .sort({ interviewCount: -1, questionCount: -1 })
      .limit(parseInt(limit))
      .toArray();

    return c.json(companies);
  } catch (error) {
    console.error("Error fetching trending companies:", error);
    return c.json({ error: "Failed to fetch trending companies" }, 500);
  }
});

export default companies;
