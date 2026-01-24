import { MongoClient } from "mongodb";
import { sampleQuestions } from "./questions";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "careermind";

async function seedQuestions() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const collection = db.collection("questions");

    // Check if questions already exist
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} questions. Skipping seed.`);
      return;
    }

    // Insert sample questions
    const result = await collection.insertMany(
      sampleQuestions.map((q) => ({
        ...q,
        createdAt: new Date(),
        updatedAt: new Date(),
        attempts: 0,
        correctAttempts: 0,
      }))
    );

    console.log(`Successfully inserted ${result.insertedIds.length} questions`);

    // Create indexes
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ difficulty: 1 });
    await collection.createIndex({ tags: 1 });
    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedQuestions();
