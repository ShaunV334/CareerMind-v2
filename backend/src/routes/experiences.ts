// backend/src/routes/experiences.ts - MongoDB Implementation

import { Hono } from "hono";
import { getDb } from "../db.js";
import { ObjectId } from "mongodb";

const experiences = new Hono();

/**
 * GET /experiences
 * Get user's interview experiences
 */
experiences.get("/", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const { companyId, limit = "20", skip = "0", outcome } = c.req.query();

    const filter: any = { userId };
    if (companyId) filter.companyId = new ObjectId(companyId);
    if (outcome) filter.outcome = outcome;

    const experiences = await db.collection("interview_experiences")
      .find(filter)
      .sort({ interviewDate: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("interview_experiences").countDocuments(filter);

    return c.json({ experiences, total });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return c.json({ error: "Failed to fetch experiences" }, 500);
  }
});

/**
 * GET /experiences/:experienceId
 * Get detailed interview experience
 */
experiences.get("/:experienceId", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { experienceId } = c.req.param();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const experience = await db.collection("interview_experiences").findOne({
      _id: new ObjectId(experienceId),
      userId
    });

    if (!experience) {
      return c.json({ error: "Experience not found" }, 404);
    }

    const questionHistory = await db.collection("interview_question_history")
      .find({ interviewExperienceId: new ObjectId(experienceId) })
      .toArray();

    return c.json({ ...experience, questionHistory });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return c.json({ error: "Failed to fetch experience" }, 500);
  }
});

/**
 * POST /experiences
 * Create a new interview experience
 */
experiences.post("/", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const {
      companyId,
      roleId,
      interviewDate,
      interviewRound,
      interviewType,
      durationMinutes,
      difficultyRating,
      experienceRating,
      outcome,
      feedback,
      questionsAsked
    } = await c.req.json();

    if (!companyId || !interviewDate || !interviewType || !outcome) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const experience = {
      userId,
      companyId: new ObjectId(companyId),
      companyRoleId: roleId ? new ObjectId(roleId) : null,
      interviewDate: new Date(interviewDate),
      interviewRound,
      interviewType,
      durationMinutes,
      difficultyRating,
      experienceRating,
      outcome,
      feedback,
      questionsAsked: questionsAsked || [],
      createdAt: new Date()
    };

    const result = await db.collection("interview_experiences").insertOne(experience);

    return c.json({
      id: result.insertedId,
      message: "Interview experience recorded successfully"
    });
  } catch (error) {
    console.error("Error creating experience:", error);
    return c.json({ error: "Failed to create experience" }, 500);
  }
});

/**
 * PUT /experiences/:experienceId
 * Update interview experience
 */
experiences.put("/:experienceId", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { experienceId } = c.req.param();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const { feedback, outcome, rating } = await c.req.json();

    await db.collection("interview_experiences").updateOne(
      { _id: new ObjectId(experienceId), userId },
      {
        $set: {
          feedback,
          outcome,
          experienceRating: rating,
          updatedAt: new Date()
        }
      }
    );

    return c.json({ message: "Experience updated successfully" });
  } catch (error) {
    console.error("Error updating experience:", error);
    return c.json({ error: "Failed to update experience" }, 500);
  }
});

/**
 * GET /experiences/dashboard/stats
 * Get dashboard statistics
 */
experiences.get("/dashboard/stats", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const total = await db.collection("interview_experiences").countDocuments({ userId });
    const passed = await db.collection("interview_experiences").countDocuments({
      userId,
      outcome: "Pass"
    });

    const stats = {
      totalInterviews: total,
      successRate: total > 0 ? (passed / total) * 100 : 0,
      avgDifficulty: 0,
      companiesInterviewed: 0,
      upcomingInterviews: 0,
      pendingFeedback: 0
    };

    return c.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

/**
 * GET /experiences/preparation-plans
 * Get user's interview prep plans
 */
experiences.get("/preparation-plans", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { status, limit = "20", skip = "0" } = c.req.query();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const filter: any = { userId };
    if (status) filter.status = status;

    const plans = await db.collection("interview_preparation_plans")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("interview_preparation_plans").countDocuments(filter);

    return c.json({ plans, total });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return c.json({ error: "Failed to fetch plans" }, 500);
  }
});

/**
 * POST /experiences/preparation-plans
 * Create a prep plan
 */
experiences.post("/preparation-plans", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const { companyId, roleId, planName, startDate, targetInterviewDate } = await c.req.json();

    if (!companyId || !startDate || !targetInterviewDate) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const plan = {
      userId,
      companyId: new ObjectId(companyId),
      companyRoleId: roleId ? new ObjectId(roleId) : null,
      planName,
      startDate: new Date(startDate),
      targetInterviewDate: new Date(targetInterviewDate),
      status: "Planned",
      completionPercentage: 0,
      createdAt: new Date()
    };

    const result = await db.collection("interview_preparation_plans").insertOne(plan);

    return c.json({
      planId: result.insertedId,
      message: "Preparation plan created successfully"
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    return c.json({ error: "Failed to create plan" }, 500);
  }
});

/**
 * GET /experiences/preparation-plans/:planId/tasks
 * Get daily tasks for a plan
 */
experiences.get("/preparation-plans/:planId/tasks", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { planId } = c.req.param();
    const { completed } = c.req.query();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const filter: any = { prepPlanId: new ObjectId(planId), userId };
    if (completed) filter.isCompleted = completed === "true";

    const tasks = await db.collection("interview_daily_tasks")
      .find(filter)
      .sort({ taskDayNumber: 1 })
      .toArray();

    return c.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return c.json({ error: "Failed to fetch tasks" }, 500);
  }
});

/**
 * POST /experiences/preparation-plans/:planId/tasks/:taskId/complete
 * Mark task as complete
 */
experiences.post("/preparation-plans/:planId/tasks/:taskId/complete", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { taskId } = c.req.param();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const { performanceScore } = await c.req.json();

    await db.collection("interview_daily_tasks").updateOne(
      { _id: new ObjectId(taskId), userId },
      {
        $set: {
          isCompleted: true,
          completionDate: new Date(),
          performanceScore
        }
      }
    );

    return c.json({ message: "Task marked as complete" });
  } catch (error) {
    console.error("Error completing task:", error);
    return c.json({ error: "Failed to complete task" }, 500);
  }
});

/**
 * POST /experiences/mock-interviews
 * Start a mock interview
 */
experiences.post("/mock-interviews", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const { companyId, roleId, interviewType, difficultyLevel, questionCount } = await c.req.json();

    if (!companyId || !interviewType || !questionCount) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const session = {
      userId,
      companyId: new ObjectId(companyId),
      companyRoleId: roleId ? new ObjectId(roleId) : null,
      sessionStartTime: new Date(),
      interviewType,
      difficultyLevel,
      questionsCount: questionCount,
      questionsCorrect: 0,
      sessionStatus: "In Progress",
      createdAt: new Date()
    };

    const result = await db.collection("mock_interview_sessions").insertOne(session);

    return c.json({ sessionId: result.insertedId, ...session });
  } catch (error) {
    console.error("Error starting mock interview:", error);
    return c.json({ error: "Failed to start mock interview" }, 500);
  }
});

/**
 * POST /experiences/mock-interviews/:sessionId/complete
 * Complete a mock interview
 */
experiences.post("/mock-interviews/:sessionId/complete", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");
    const { sessionId } = c.req.param();

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const session = await db.collection("mock_interview_sessions").findOne({
      _id: new ObjectId(sessionId),
      userId
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    const accuracyPercentage = (session.questionsCorrect / session.questionsCount) * 100;

    await db.collection("mock_interview_sessions").updateOne(
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
      accuracyPercentage,
      strengths: ["Problem solving"],
      areasToImprove: ["Code optimization"]
    });
  } catch (error) {
    console.error("Error completing mock interview:", error);
    return c.json({ error: "Failed to complete mock interview" }, 500);
  }
});

/**
 * GET /experiences/tips
 * Get community interview tips
 */
experiences.get("/tips", async (c) => {
  try {
    const db = getDb();
    const { companyId, interviewType, limit = "20", skip = "0" } = c.req.query();

    const filter: any = {};
    if (companyId) filter.companyId = new ObjectId(companyId);
    if (interviewType) filter.interviewType = interviewType;

    const tips = await db.collection("interview_tips_shared")
      .find(filter)
      .sort({ helpfulCount: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("interview_tips_shared").countDocuments(filter);

    return c.json({ tips, total });
  } catch (error) {
    console.error("Error fetching tips:", error);
    return c.json({ error: "Failed to fetch tips" }, 500);
  }
});

/**
 * POST /experiences/tips
 * Share an interview tip
 */
experiences.post("/tips", async (c) => {
  try {
    const db = getDb();
    const userId = c.req.header("x-user-id");

    if (!userId) {
      return c.json({ error: "User ID required" }, 401);
    }

    const { companyId, roleId, interviewType, tipTitle, tipContent, tipCategory, confidenceLevel } = await c.req.json();

    if (!tipTitle || !tipContent || tipContent.length < 20) {
      return c.json({ error: "Invalid tip content" }, 400);
    }

    const tip = {
      userId,
      companyId: new ObjectId(companyId),
      companyRoleId: roleId ? new ObjectId(roleId) : null,
      interviewType,
      tipTitle,
      tipContent,
      tipCategory,
      confidenceLevel,
      helpfulCount: 0,
      createdAt: new Date()
    };

    const result = await db.collection("interview_tips_shared").insertOne(tip);

    return c.json({
      tipId: result.insertedId,
      message: "Tip shared successfully"
    });
  } catch (error) {
    console.error("Error sharing tip:", error);
    return c.json({ error: "Failed to share tip" }, 500);
  }
});

export default experiences;
