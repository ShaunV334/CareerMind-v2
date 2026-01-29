import { MongoClient } from "mongodb";
import { interviewQuestions } from "./interview-questions";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "careermind";
async function seedInterviewQuestions() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db(DB_NAME);
        const collection = db.collection("interview_questions");
        // Check if questions already exist
        const count = await collection.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} interview questions. Skipping seed.`);
            return;
        }
        // Insert interview questions
        const result = await collection.insertMany(interviewQuestions.map((q) => ({
            ...q,
            createdAt: new Date(),
            updatedAt: new Date(),
            attempts: 0,
        })));
        console.log(`Successfully inserted ${result.insertedIds.length} interview questions`);
        // Create indexes
        await collection.createIndex({ category: 1 });
        await collection.createIndex({ difficulty: 1 });
        console.log("Indexes created successfully");
    }
    catch (error) {
        console.error("Error seeding interview questions:", error);
    }
    finally {
        await client.close();
    }
}
seedInterviewQuestions();
