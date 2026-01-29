import { MongoClient } from 'mongodb';

async function test() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('careermind');
    const categories = await db.collection('aptitude_categories').countDocuments();
    const companies = await db.collection('companies').countDocuments();
    const questions = await db.collection('questions').countDocuments();
    console.log(`aptitude_categories: ${categories}`);
    console.log(`companies: ${companies}`);
    console.log(`questions: ${questions}`);
  } finally {
    await client.close();
  }
}
test();
