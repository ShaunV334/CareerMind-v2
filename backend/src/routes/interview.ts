import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { getDb } from "../db";
import { getUser } from "../middleware";
import OpenAI from "openai";

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

export default app;
