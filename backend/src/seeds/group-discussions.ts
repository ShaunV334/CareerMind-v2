// backend/src/seeds/group-discussions.ts

import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "careermind"

export async function seedGroupDiscussionsData() {
  const client = new MongoClient(MONGO_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    console.log("🌱 Seeding Group Discussions data...")

    const discussionsCollection = db.collection("discussions")
    const repliesCollection = db.collection("discussion_replies")

    // Sample discussions
    const discussions = [
      {
        title: "Best resources for System Design interviews",
        description: "Looking for recommendations on learning system design patterns and concepts",
        content: `I'm preparing for system design interviews and want to know the best resources to study. 
        I've heard about designing scalable systems, database design, load balancing, caching strategies, etc. 
        What books, courses, or websites would you recommend? Any experience with specific topics being asked?`,
        category: "interview",
        authorId: "user-1",
        authorName: "John Developer",
        authorEmail: "john@example.com",
        authorAvatar: null,
        tags: ["system-design", "interviews", "backend"],
        viewCount: 0,
        replyCount: 0,
        likes: 0,
        likedBy: [],
        isPinned: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Quantitative Aptitude Tips for CAT/GATE",
        description: "Sharing strategies to improve speed and accuracy in quant",
        content: `Over the past year, I've improved my quant accuracy from 60% to 95%. 
        Here are some key strategies that helped me:
        1. Master the basics - don't skip fundamental concepts
        2. Practice time management - solve questions within time limits
        3. Identify patterns - many questions follow similar patterns
        4. Review mistakes - understand why you got it wrong
        5. Use shortcuts - but only after understanding the concept`,
        category: "aptitude",
        authorId: "user-2",
        authorName: "Sarah Math",
        authorEmail: "sarah@example.com",
        authorAvatar: null,
        tags: ["aptitude", "quantitative", "tips"],
        viewCount: 0,
        replyCount: 0,
        likes: 0,
        likedBy: [],
        isPinned: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "How to create an impressive resume",
        description: "Discussion on resume tips and best practices",
        content: `Your resume is your first impression! Here's what I've learned works best:
        - Keep it to 1 page (or 2 max for experienced professionals)
        - Use action verbs and quantifiable results
        - Tailor for each job you apply to
        - Include relevant keywords from the job posting
        - Check grammar and formatting multiple times`,
        category: "resume",
        authorId: "user-3",
        authorName: "Alex Resume",
        authorEmail: "alex@example.com",
        authorAvatar: null,
        tags: ["resume", "career", "tips"],
        viewCount: 0,
        replyCount: 0,
        likes: 0,
        likedBy: [],
        isPinned: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "FAANG Company Interview Experiences",
        description: "Sharing my interview experiences from Facebook, Amazon, Google, Netflix, Apple",
        content: `I recently went through interviews with multiple FAANG companies. Here's what I learned:
        
        Facebook/Meta: Focus on coding, system design for senior roles
        Amazon: Leadership principles are crucial, behavioral rounds are important
        Google: Data structures and algorithms, multiple technical rounds
        Netflix: Problem-solving approach matters more than quick solutions
        Apple: Product knowledge and attention to detail
        
        Feel free to ask specific questions about any of these!`,
        category: "companies",
        authorId: "user-4",
        authorName: "Emma Tech",
        authorEmail: "emma@example.com",
        authorAvatar: null,
        tags: ["faang", "interviews", "experience"],
        viewCount: 0,
        replyCount: 0,
        likes: 0,
        likedBy: [],
        isPinned: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: "General feedback on learning path",
        description: "How to structure your learning journey",
        content: `Many people ask about the best learning path. Here's what I recommend:
        1. Start with fundamentals - build strong basics
        2. Practice consistently - daily practice is key
        3. Learn from mistakes - review and understand
        4. Build projects - apply knowledge practically
        5. Stay updated - follow industry trends
        6. Network - connect with peers and mentors
        7. Be patient - growth takes time
        
        Remember, everyone's journey is different. Find what works for you!`,
        category: "general",
        authorId: "user-5",
        authorName: "Mike Learning",
        authorEmail: "mike@example.com",
        authorAvatar: null,
        tags: ["learning", "career-growth", "tips"],
        viewCount: 0,
        replyCount: 0,
        likes: 0,
        likedBy: [],
        isPinned: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]

    const result = await discussionsCollection.insertMany(discussions)
    const discussionIds = Object.values(result.insertedIds)
    console.log(`✓ Inserted ${result.insertedCount} discussions`)

    // Sample replies
    const replies = [
      {
        discussionId: discussionIds[0].toString(),
        content: "I highly recommend 'Designing Data-Intensive Applications' by Martin Kleppmann. It's the bible for system design!",
        authorId: "user-6",
        authorName: "Designer Pro",
        authorEmail: "designer@example.com",
        authorAvatar: null,
        likes: 5,
        likedBy: ["user-1", "user-2"],
        isAnswer: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        discussionId: discussionIds[0].toString(),
        content: "Also check out ByteByteGo YouTube channel and AlgoExpert's system design course. Both are excellent!",
        authorId: "user-7",
        authorName: "Learning Master",
        authorEmail: "learning@example.com",
        authorAvatar: null,
        likes: 3,
        likedBy: ["user-1"],
        isAnswer: false,
        createdAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000),
      },
      {
        discussionId: discussionIds[1].toString(),
        content: "These are great tips! I especially agree with mastering the basics first. Too many people try shortcuts without understanding concepts.",
        authorId: "user-8",
        authorName: "Math Enthusiast",
        authorEmail: "math@example.com",
        authorAvatar: null,
        likes: 2,
        likedBy: [],
        isAnswer: false,
        createdAt: new Date(Date.now() - 4.8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4.8 * 24 * 60 * 60 * 1000),
      },
      {
        discussionId: discussionIds[2].toString(),
        content: "One more tip: use ConvertKit or Canva to create a visually appealing resume. The formatting makes a huge difference!",
        authorId: "user-9",
        authorName: "Design Expert",
        authorEmail: "design@example.com",
        authorAvatar: null,
        likes: 4,
        likedBy: ["user-3", "user-4"],
        isAnswer: false,
        createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
      },
    ]

    const repliesResult = await repliesCollection.insertMany(replies)
    console.log(`✓ Inserted ${repliesResult.insertedCount} replies`)

    // Update reply count in discussions
    for (let i = 0; i < discussionIds.length; i++) {
      const replyCount = replies.filter(
        (r) => r.discussionId === discussionIds[i].toString()
      ).length
      if (replyCount > 0) {
        await discussionsCollection.updateOne(
          { _id: discussionIds[i] },
          { $set: { replyCount } }
        )
      }
    }

    console.log("✅ Group Discussions data seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding group discussions:", error)
    throw error
  } finally {
    await client.close()
  }
}

// Export for use in main seed orchestrator
export default seedGroupDiscussionsData
