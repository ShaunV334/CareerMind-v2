import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'careermind';

async function seedTestUser() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Check if test user already exists
    const existing = await usersCollection.findOne({ email: 'test@gmail.com' });
    if (existing) {
      console.log('Test user already exists');
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password', 10);
    const result = await usersCollection.insertOne({
      name: 'Test User',
      email: 'test@gmail.com',
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    console.log('✅ Test user created successfully');
    console.log(`Email: test@gmail.com`);
    console.log(`Password: password`);
    console.log(`User ID: ${result.insertedId}`);
  } catch (error) {
    console.error('Error seeding test user:', error);
  } finally {
    await client.close();
  }
}

seedTestUser();
