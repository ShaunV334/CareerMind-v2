import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { getUser } from "../middleware.js";
import OpenAI from "openai";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const app = new Hono();

// Initialize Kimi K2 client
function getKimiClient() {
  return new OpenAI({
    apiKey: process.env.KIMI_API_KEY,
    baseURL: "https://api.moonshot.ai/v1",
  });
}

// Get all interview questions
app.get("/questions", async (c) => {
  const { category, difficulty } = c.req.query();

  try {
    const db = getDb();
    const collection = db.collection("interview_questions");
    const filter: any = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await collection.find(filter).toArray();

    const questionsFormatted = questions.map((q: any) => ({
      ...q,
      id: q._id?.toString(),
      _id: undefined,
    }));

    return c.json({ questions: questionsFormatted });
  } catch (error) {
    return c.json({ error: "Failed to fetch questions" }, 500);
  }
});

// Get single question
app.get("/questions/:id", async (c) => {
  const { id } = c.req.param();

  try {
    const db = getDb();
    const collection = db.collection("interview_questions");
    const question = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!question) return c.json({ error: "Question not found" }, 404);

    return c.json({
      ...question,
      id: question._id?.toString(),
      _id: undefined,
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch question" }, 500);
  }
});

// Submit answer and get AI feedback
app.post("/questions/:id/submit", async (c) => {
  const body = await c.req.json();
  const { id } = c.req.param();
  const { answer, timeSpent } = body;
  const userId = c.req.header("X-User-Id") || "anonymous";

  try {
    const db = getDb();
    const questionsCollection = db.collection("interview_questions");
    const responsesCollection = db.collection("interview_responses");

    const question = await questionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!question) return c.json({ error: "Question not found" }, 404);

    console.log("Getting AI feedback...");
    // Get AI feedback
    const feedback = await getAIFeedback(question, answer);
    console.log("Feedback received:", feedback);

    // Store the response
    const response = await responsesCollection.insertOne({
      userId,
      questionId: id,
      question: question.question,
      category: question.category,
      answer,
      feedback,
      timeSpent,
      createdAt: new Date(),
    });

    return c.json({
      id: response.insertedId.toString(),
      feedback,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get interview history
app.get("/history", async (c) => {
  const userId = c.req.header("X-User-Id") || "anonymous";

  try {
    const db = getDb();
    const collection = db.collection("interview_responses");
    const responses = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    const formatted = responses.map((r: any) => ({
      ...r,
      id: r._id?.toString(),
      _id: undefined,
    }));

    return c.json({ responses: formatted });
  } catch (error) {
    return c.json({ error: "Failed to fetch history" }, 500);
  }
});

// Get interview stats
app.get("/stats", async (c) => {
  const userId = c.req.header("X-User-Id") || "anonymous";

  try {
    const db = getDb();
    const collection = db.collection("interview_responses");
    const responses = await collection.find({ userId }).toArray();

    const totalInterviews = responses.length;
    const avgScore =
      responses.length > 0
        ? Math.round(
            responses.reduce((acc: number, r: any) => acc + (r.feedback?.score || 0), 0) /
              responses.length
          )
        : 0;

    const categoryStats: any = {};
    responses.forEach((r: any) => {
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = { count: 0, avgScore: 0 };
      }
      categoryStats[r.category].count++;
      categoryStats[r.category].avgScore += r.feedback?.score || 0;
    });

    Object.keys(categoryStats).forEach((cat) => {
      categoryStats[cat].avgScore = Math.round(
        categoryStats[cat].avgScore / categoryStats[cat].count
      );
    });

    return c.json({
      totalInterviews,
      avgScore,
      categoryStats,
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// Helper function to get AI feedback
async function getAIFeedback(question: any, answer: string) {
  const client = getKimiClient();
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question.question}
Question Category: ${question.category}
Question Type: ${question.type}

Candidate's Answer: ${answer}

Expected Keywords (hint, not required): ${question.expectedKeywords?.join(", ") || "N/A"}

Evaluate the answer and provide feedback in the following JSON format (IMPORTANT: Return ONLY the JSON, no other text):
{
  "score": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "feedback": "<detailed feedback about the answer>",
  "suggestions": ["suggestion1", "suggestion2"],
  "keywordsCovered": ["keyword1", "keyword2"]
}`;

  try {
    const response = await client.chat.completions.create({
      model: "kimi-k2-0905",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content || "";
    console.log("Kimi Response:", text);
    const feedback = JSON.parse(text);
    return feedback;
  } catch (error: any) {
    console.error("Kimi Error:", error);
    
    // Provide better feedback for development if API is unavailable
    const isBillingError = error?.status === 429 && error?.error?.type === 'exceeded_current_quota_error';
    
    if (isBillingError) {
      console.warn("⚠️ Kimi K2 account out of credits. Using mock feedback for development.");
      return {
        score: 75,
        strengths: [
          "Clear explanation of the concept",
          "Good use of examples",
          "Demonstrates understanding"
        ],
        weaknesses: [
          "Could include more technical depth",
          "Missing edge case considerations"
        ],
        feedback: "Your answer shows a good understanding of the fundamentals. To improve, consider exploring more advanced scenarios and edge cases. The explanation was clear but could benefit from more technical details. (Note: Using mock feedback - please recharge your Kimi K2 account)",
        suggestions: [
          "Deep dive into the underlying implementation details",
          "Discuss potential edge cases and error handling",
          "Consider performance implications and optimizations",
          "Explore alternative approaches and their trade-offs"
        ],
        keywordsCovered: (question.expectedKeywords || []).slice(0, 3),
      };
    }
    
    return {
      score: 0,
      strengths: [],
      weaknesses: ["Could not generate feedback"],
      feedback: "Failed to generate AI feedback. Please try again.",
      suggestions: [],
      keywordsCovered: [],
    };
  }
}

// ============ AI MOCK INTERVIEW ENDPOINTS ============

/**
 * POST /interview/mock/start
 * Initialize a new mock interview session and generate first question
 */
app.post("/mock/start", async (c) => {
  try {
    const body = await c.req.json();
    const { companyId, userId, role } = body;

    if (!companyId || !userId) {
      return c.json({ error: "companyId and userId are required" }, 400);
    }

    const db = getDb();
    const sessionsCollection = db.collection("mockInterviewSessions");

    const session = {
      sessionId: new ObjectId().toString(),
      userId,
      companyId,
      role: role || "Software Engineer",
      startedAt: new Date(),
      status: "active",
      messages: [],
      questionsAnswered: 0,
      score: 0,
    };

    await sessionsCollection.insertOne(session);

    // Generate first question using Gemini
    try {
      const systemPrompt = `You are conducting a technical interview for the role of ${role} at ${companyId.toUpperCase()}. 
Your responsibility is to ask thoughtful, progressive technical questions to assess the candidate's knowledge and problem-solving abilities.

Guidelines:
- Start with a moderate difficulty question to gauge the candidate's experience
- Ask questions that are relevant to the company and role
- Follow up on their answers with deeper questions
- Be conversational and encouraging
- Focus on practical experience and problem-solving approach
- After each answer, provide constructive feedback
- Progress the difficulty level based on their responses

Begin the interview by asking the first technical question.`;

      const { text } = await generateText({
        model: google("gemini-2.5-flash-lite"),
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Start a technical interview for ${role} position at ${companyId}. Ask the first question.`,
          },
        ],
        temperature: 0.7,
      });

      // Save the first question to the session
      await sessionsCollection.updateOne(
        { sessionId: session.sessionId },
        {
          $push: {
            messages: {
              timestamp: new Date(),
              type: "question",
              content: text,
              role: "assistant",
            },
          },
        }
      );

      return c.json({
        success: true,
        sessionId: session.sessionId,
        firstQuestion: text,
        message: "Interview session started",
      });
    } catch (aiError) {
      console.error("Error generating first question:", aiError);
      // Return session without question if AI fails, frontend can retry
      return c.json({
        success: true,
        sessionId: session.sessionId,
        message: "Interview session started",
      });
    }
  } catch (error) {
    console.error("Error starting interview:", error);
    return c.json({ error: "Failed to start interview session" }, 500);
  }
});

/**
 * POST /interview/mock/chat
 * AI-powered interview question and answer endpoint with streaming
 */
app.post("/mock/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { messages, sessionId, companyId, userId, role } = body;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "messages array is required" }, 400);
    }

    const COMPANY_QUESTIONS: Record<string, string[]> = {
      google: [
        "Tell me about a time you faced a complex technical challenge. How did you approach it?",
        "Describe a situation where you had to work with a difficult team member. How did you handle it?",
        "What is your experience with system design? Can you describe a large-scale system you've designed?",
        "How do you stay updated with new technologies and trends in software development?",
        "Tell me about a project where you took leadership. What was your role and impact?",
        "Describe a time when you had to learn something new quickly to complete a project.",
      ],
      amazon: [
        "Tell me about a time when you took ownership of a problem and solved it.",
        "Describe a situation where you had to make a decision with incomplete information.",
        "How do you approach learning and development in your role?",
        "Tell me about a time when you disagreed with your manager. How did you handle it?",
        "What's an example of when you used data to make a decision?",
      ],
      microsoft: [
        "Tell me about a time you worked on an innovative project. What was your contribution?",
        "Describe a challenge you faced in a team project and how you overcame it.",
        "How do you handle failure and learn from mistakes?",
        "Tell me about your experience with cloud technologies.",
        "Describe a situation where you had to adapt to change quickly.",
      ],
      accenture: [
        "Tell me about a time you worked with a client. How did you understand their needs?",
        "Describe your experience with project management and delivering on deadline.",
        "How do you work in a team-oriented environment?",
        "Tell me about a complex project you worked on and your role in it.",
      ],
      tcs: [
        "Tell me about your programming experience and projects.",
        "How would you approach a new technology you haven't used before?",
        "Describe your experience with databases and SQL.",
        "Tell me about a time you had to debug a difficult issue.",
      ],
      infosys: [
        "Tell me about your experience with software development.",
        "How do you ensure code quality in your projects?",
        "Describe a project you're proud of and why.",
        "How do you approach learning new technologies?",
      ],
    };

    const companyQuestions =
      COMPANY_QUESTIONS[companyId.toLowerCase()] || COMPANY_QUESTIONS.google;
    const questionIndex = messages.filter((m: any) => m.role === "user").length;

    let systemPrompt = `You are an experienced technical interviewer at ${companyId}. You are conducting a mock interview for a ${role} position.

Your job is to:
1. Ask relevant technical and behavioral questions specific to ${companyId}
2. Listen to the candidate's answers
3. Provide constructive feedback
4. Ask follow-up questions to understand their experience better
5. Rate their response (1-10)

Maintain a professional and friendly tone. Be encouraging but honest about areas for improvement.

Company Focus for ${companyId}:
- Google: Innovation, system design, problem-solving
- Amazon: Leadership principles, ownership, customer obsession
- Microsoft: Growth mindset, collaboration, cloud technologies
- Accenture: Client management, project delivery, teamwork
- TCS: Technical fundamentals, quality, process excellence
- Infosys: Code quality, continuous learning, delivery excellence

Current Interview Progress: Question ${questionIndex + 1} of ${companyQuestions.length}`;

    // Generate next question if this is the start or after an answer
    if (
      messages.length === 0 ||
      messages[messages.length - 1].role === "user"
    ) {
      const question = companyQuestions[
        Math.min(questionIndex, companyQuestions.length - 1)
      ];

      systemPrompt += `

Your next action:
1. Ask this question: "${question}"
2. Wait for the candidate's response
3. After they answer, provide feedback on:
   - Strengths in their answer
   - Areas for improvement
   - Rating (1-10)
   - Follow-up questions if needed`;
    }

    // Use AI SDK to generate response
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
    });

    // Save to database if sessionId is provided
    if (sessionId) {
      try {
        const db = getDb();
        await db.collection("mockInterviewSessions").updateOne(
          { sessionId },
          {
            $push: {
              messages: {
                timestamp: new Date(),
                type: "question",
                content: text,
                role: "assistant",
              },
            },
          }
        );
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
      }
    }

    return c.json({
      message: text,
      success: true,
    });
  } catch (error) {
    console.error("Error in mock interview chat:", error);
    return c.json({ error: "Failed to process interview response" }, 500);
  }
});

/**
 * POST /interview/mock/:sessionId/message
 * Add a message/answer to mock interview session
 */
app.post("/mock/:sessionId/message", async (c) => {
  try {
    const db = getDb();
    const { sessionId } = c.req.param();
    const { message, type = "answer" } = await c.req.json();

    const session = await db.collection("mockInterviewSessions").findOne({
      sessionId,
    });

    if (!session) {
      return c.json({ error: "Mock interview session not found" }, 404);
    }

    const messageRecord = {
      timestamp: new Date(),
      type,
      content: message,
      role: "user",
    };

    await db.collection("mockInterviewSessions").updateOne(
      { sessionId },
      {
        $push: { messages: messageRecord },
        $inc: { currentQuestion: 1 },
      }
    );

    return c.json({
      success: true,
      sessionId,
      message: "Answer recorded",
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return c.json({ error: "Failed to save message" }, 500);
  }
});

/**
 * GET /interview/mock/:sessionId
 * Get mock interview session details
 */
app.get("/mock/:sessionId", async (c) => {
  try {
    const db = getDb();
    const { sessionId } = c.req.param();

    const session = await db.collection("mockInterviewSessions").findOne({
      sessionId,
    });

    if (!session) {
      return c.json({ error: "Mock interview session not found" }, 404);
    }

    return c.json(session);
  } catch (error) {
    console.error("Error fetching mock interview session:", error);
    return c.json({ error: "Failed to fetch mock interview session" }, 500);
  }
});

/**
 * POST /interview/mock/:sessionId/end
 * End mock interview session and calculate score
 */
app.post("/mock/:sessionId/end", async (c) => {
  try {
    const db = getDb();
    const { sessionId } = c.req.param();
    
    if (!sessionId) {
      return c.json({ error: "sessionId is required" }, 400);
    }

    const { feedback } = await c.req.json().catch(() => ({}));

    const session = await db.collection("mockInterviewSessions").findOne({
      sessionId,
    });

    if (!session) {
      console.error(`Session not found for sessionId: ${sessionId}`);
      return c.json({ error: "Mock interview session not found" }, 404);
    }

    // Calculate score based on number of questions answered
    const messageCount = session.messages ? session.messages.filter((m: any) => m.type === "answer").length : 0;
    const averageScore = Math.min(100, 50 + messageCount * 8); // Base score + points per answer

    const startedAt = session.startedAt || new Date();
    const duration = Math.floor(
      (new Date().getTime() - startedAt.getTime()) / 1000 / 60
    ); // minutes

    await db.collection("mockInterviewSessions").updateOne(
      { sessionId },
      {
        $set: {
          endedAt: new Date(),
          status: "completed",
          score: averageScore,
          feedback: feedback || "Great performance! Keep practicing.",
          duration,
        },
      }
    );

    return c.json({
      sessionId,
      score: averageScore,
      feedback: feedback || "Great performance! Keep practicing.",
      totalQuestions: messageCount,
      duration,
    });
  } catch (error) {
    console.error("Error ending mock interview:", error);
    return c.json({ error: "Failed to end mock interview", details: String(error) }, 500);
  }
});

/**
 * GET /interview/mock/:sessionId
 * Get a specific mock interview session
 */
app.get("/mock/:sessionId", async (c) => {
  try {
    const db = getDb();
    const { sessionId } = c.req.param();

    if (!sessionId) {
      return c.json({ error: "sessionId is required" }, 400);
    }

    const session = await db.collection("mockInterviewSessions").findOne({
      sessionId,
    });

    if (!session) {
      return c.json({ error: "Mock interview session not found" }, 404);
    }

    return c.json(session);
  } catch (error) {
    console.error("Error fetching mock interview session:", error);
    return c.json({ error: "Failed to fetch mock interview session" }, 500);
  }
});

/**
 * GET /interview/mock/user/:userId
 * Get user's mock interview history
 */
app.get("/mock/user/:userId", async (c) => {
  try {
    const db = getDb();
    const { userId } = c.req.param();

    const sessions = await db
      .collection("mockInterviewSessions")
      .find({ userId })
      .sort({ startedAt: -1 })
      .limit(20)
      .toArray();

    return c.json({
      userId,
      totalInterviews: sessions.length,
      averageScore:
        sessions.length > 0
          ? Math.round(
              sessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) /
                sessions.length
            )
          : 0,
      sessions,
    });
  } catch (error) {
    console.error("Error fetching mock interview history:", error);
    return c.json({ error: "Failed to fetch mock interview history" }, 500);
  }
});

// ============================================
// PROFILE ROUTES
// ============================================

// Get user profile
app.get("/profile", getUser, async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = getDb();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      id: user._id?.toString(),
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      bio: user.bio || "",
      profilePhoto: user.profilePhoto || "",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update user profile
app.put("/profile", getUser, async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { name, email, phone, location, bio, profilePhoto } = body;

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    const db = getDb();
    const usersCollection = db.collection("users");

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await usersCollection.findOne({
        email: email,
        _id: { $ne: new ObjectId(userId) },
      });
      if (existingUser) {
        return c.json({ error: "Email already in use" }, 400);
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      message: "Profile updated successfully",
      id: userId,
      ...updateData,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Delete profile photo
app.delete("/profile/avatar", getUser, async (c) => {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = getDb();
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { profilePhoto: null, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ message: "Profile photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    return c.json({ error: "Failed to delete profile photo" }, 500);
  }
});

export default app;
