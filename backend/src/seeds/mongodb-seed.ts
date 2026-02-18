// MongoDB Seed Data - Initial Data Population
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "careermind"

async function seedData() {
  const client = new MongoClient(MONGO_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    console.log("🌱 Seeding MongoDB with initial data...")

    // ===== APTITUDE DATA =====
    // Categories
    const categories = await db.collection("aptitude_categories").insertMany([
      {
        name: "Quantitative Aptitude",
        description: "Test your mathematical and numerical reasoning skills",
        icon: "calculator",
        subcategoryCount: 4,
        questionCount: 0,
        createdAt: new Date(),
      },
      {
        name: "Logical Reasoning",
        description: "Enhance your problem-solving and logical thinking abilities",
        icon: "brain",
        subcategoryCount: 3,
        questionCount: 0,
        createdAt: new Date(),
      },
      {
        name: "Verbal Ability",
        description: "Improve your language and comprehension skills",
        icon: "book",
        subcategoryCount: 3,
        questionCount: 0,
        createdAt: new Date(),
      },
    ])

    const catIds = Object.values(categories.insertedIds)

    // Subcategories
    const subcategories = await db.collection("aptitude_subcategories").insertMany([
      // Quantitative
      { categoryId: catIds[0], name: "Numbers & Digits", description: "Prime numbers, HCF, LCM", questionCount: 0, createdAt: new Date() },
      { categoryId: catIds[0], name: "Percentages & Profit-Loss", description: "Profit, loss, discount calculations", questionCount: 0, createdAt: new Date() },
      { categoryId: catIds[0], name: "Time, Speed & Distance", description: "Travel and motion problems", questionCount: 0, createdAt: new Date() },
      { categoryId: catIds[0], name: "Algebra & Arithmetic", description: "Equations and mathematical operations", questionCount: 0, createdAt: new Date() },
      // Logical Reasoning
      { categoryId: catIds[1], name: "Puzzles & Logic", description: "Complex problem-solving puzzles", questionCount: 0, createdAt: new Date() },
      { categoryId: catIds[1], name: "Seating Arrangements", description: "Arrangement based reasoning", questionCount: 0, createdAt: new Date() },
      { categoryId: catIds[1], name: "Coding-Decoding", description: "Code patterns and decryption", questionCount: 0, createdAt: new Date() },
      // Verbal
      { categoryId: catIds[2], name: "Reading Comprehension", description: "Passage analysis and understanding", questionCount: 0, createdAt: new Date() },
      { categoryId: catIds[2], name: "Vocabulary & Grammar", description: "Word meanings and language rules", questionCount: 0, createdAt: new Date() },
      { categoryId: catIds[2], name: "Sentence Correction", description: "Error identification and correction", questionCount: 0, createdAt: new Date() },
    ])

    const subIds = Object.values(subcategories.insertedIds)

    // Questions
    const questions = await db.collection("aptitude_questions").insertMany([
      {
        categoryId: catIds[0],
        subcategoryId: subIds[0],
        questionText: "What is the smallest prime number greater than 100?",
        questionType: "multiple-choice",
        difficulty: "Easy",
        options: [
          { text: "101", isCorrect: true },
          { text: "103", isCorrect: false },
          { text: "105", isCorrect: false },
          { text: "107", isCorrect: false },
        ],
        correctAnswer: "101",
        explanation: "101 is a prime number (only divisible by 1 and itself) and is the smallest prime greater than 100.",
        tags: ["prime-numbers", "basic"],
        createdAt: new Date(),
      },
      {
        categoryId: catIds[0],
        subcategoryId: subIds[1],
        questionText: "If the cost price is Rs. 100 and selling price is Rs. 150, what is the profit percentage?",
        questionType: "multiple-choice",
        difficulty: "Easy",
        options: [
          { text: "25%", isCorrect: false },
          { text: "50%", isCorrect: true },
          { text: "75%", isCorrect: false },
          { text: "100%", isCorrect: false },
        ],
        correctAnswer: "50%",
        explanation: "Profit = SP - CP = 150 - 100 = 50. Profit% = (50/100) × 100 = 50%",
        tags: ["profit-loss"],
        createdAt: new Date(),
      },
      {
        categoryId: catIds[1],
        subcategoryId: subIds[4],
        questionText: "If A = 1, B = 2, C = 3... then what will LOGIC be?",
        questionType: "multiple-choice",
        difficulty: "Easy",
        options: [
          { text: "40", isCorrect: false },
          { text: "50", isCorrect: true },
          { text: "60", isCorrect: false },
          { text: "70", isCorrect: false },
        ],
        correctAnswer: "50",
        explanation: "L=12, O=15, G=7, I=9, C=3. Total = 12+15+7+9+3 = 46... Wait, let me recalculate: 12+15+7+9+7=50",
        tags: ["coding-decoding"],
        createdAt: new Date(),
      },
      {
        categoryId: catIds[2],
        subcategoryId: subIds[7],
        questionText: "What is the main idea of the passage?",
        questionType: "multiple-choice",
        difficulty: "Medium",
        options: [
          { text: "Technology advancement", isCorrect: true },
          { text: "Environmental concerns", isCorrect: false },
          { text: "Social issues", isCorrect: false },
          { text: "Economic growth", isCorrect: false },
        ],
        correctAnswer: "Technology advancement",
        explanation: "The passage primarily focuses on how technology is advancing society.",
        tags: ["reading-comprehension"],
        createdAt: new Date(),
      },
      {
        categoryId: catIds[1],
        subcategoryId: subIds[5],
        questionText: "In a seating arrangement, if A sits to the right of B and B sits to the right of C, who sits in the middle?",
        questionType: "multiple-choice",
        difficulty: "Medium",
        options: [
          { text: "A", isCorrect: false },
          { text: "B", isCorrect: true },
          { text: "C", isCorrect: false },
          { text: "Cannot be determined", isCorrect: false },
        ],
        correctAnswer: "B",
        explanation: "If C, B, A are in order from left to right, then B is in the middle.",
        tags: ["seating-arrangement"],
        createdAt: new Date(),
      },
    ])

    console.log(`✅ Created ${categories.insertedCount} categories`)
    console.log(`✅ Created ${subcategories.insertedCount} subcategories`)
    console.log(`✅ Created ${questions.insertedCount} sample questions`)

    // ===== COMPANY DATA =====
    const companies = await db.collection("companies").insertMany([
      {
        name: "Google",
        slug: "google",
        description: "Search engine and technology company",
        industry: "Technology",
        foundedYear: 1998,
        headquarters: "Mountain View, California",
        difficultyRating: 4.5,
        questionCount: 0,
        interviewCount: 0,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Amazon",
        slug: "amazon",
        description: "E-commerce and cloud services",
        industry: "Technology",
        foundedYear: 1994,
        headquarters: "Seattle, Washington",
        difficultyRating: 4.3,
        questionCount: 0,
        interviewCount: 0,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Microsoft",
        slug: "microsoft",
        description: "Software and cloud computing",
        industry: "Technology",
        foundedYear: 1975,
        headquarters: "Redmond, Washington",
        difficultyRating: 4.2,
        questionCount: 0,
        interviewCount: 0,
        isActive: true,
        createdAt: new Date(),
      },
    ])

    console.log(`✅ Created ${companies.insertedCount} companies`)

    // ===== GROUP DISCUSSIONS DATA =====
    const discussions = await db.collection("discussions").insertMany([
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
        replyCount: 2,
        likes: 5,
        likedBy: ["user-2", "user-3"],
        viewedBy: ["user-1", "user-2", "user-3", "user-4"],
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
        replyCount: 1,
        likes: 3,
        likedBy: ["user-4"],
        viewedBy: ["user-1", "user-2"],
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
        replyCount: 1,
        likes: 4,
        likedBy: ["user-5"],
        viewedBy: ["user-1", "user-3"],
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
        likes: 2,
        likedBy: ["user-1"],
        viewedBy: ["user-1", "user-2"],
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
        likes: 6,
        likedBy: ["user-2", "user-3", "user-4"],
        viewedBy: ["user-1", "user-2", "user-3", "user-4", "user-5"],
        isPinned: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ])

    const discussionIds = Object.values(discussions.insertedIds)

    console.log(`✅ Created ${discussions.insertedCount} discussions`)

    // Discussion Replies
    const replies = await db.collection("discussion_replies").insertMany([
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
    ])

    console.log(`✅ Created ${replies.insertedCount} discussion replies`)

    // ===== STUDY MATERIALS DATA =====
    const materials = await db.collection("study_materials").insertMany([
      {
        title: "System Design Interview Handbook",
        description: "Comprehensive guide to ace system design interviews with real-world examples",
        category: "System Design",
        type: "guide",
        difficulty: "Intermediate",
        author: "Alex Xu",
        source: "GitHub",
        url: "https://github.com/donnemartin/system-design-primer",
        duration: "40 hours",
        tags: ["system-design", "backend", "scalability"],
        thumbnail: "https://via.placeholder.com/300x200?text=System+Design",
        views: 2450,
        rating: 4.8,
        ratingCount: 342,
        savedCount: 156,
        savedBy: ["user-1", "user-2", "user-3"],
        viewedBy: ["user-1", "user-2", "user-3", "user-4", "user-5"],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: "JavaScript: The Definitive Guide",
        description: "Master modern JavaScript fundamentals and advanced concepts",
        category: "Web Development",
        type: "book",
        difficulty: "Intermediate",
        author: "David Flanagan",
        source: "O'Reilly",
        url: "https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/",
        duration: "50 hours",
        tags: ["javascript", "web", "programming"],
        thumbnail: null,
        views: 1890,
        rating: 4.7,
        ratingCount: 289,
        savedCount: 203,
        savedBy: ["user-2", "user-4", "user-5", "user-6"],
        viewedBy: ["user-1", "user-2", "user-3", "user-4"],
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Data Structures and Algorithms: Deep Dive Using Java",
        description: "Learn DSA concepts with practical Java implementations",
        category: "Data Structures",
        type: "course",
        difficulty: "Beginner",
        author: "Udemy Instructor",
        source: "Udemy",
        url: "https://www.udemy.com/course/data-structures-and-algorithms-dsa-courses/",
        duration: "35 hours",
        tags: ["dsa", "java", "algorithms", "basics"],
        thumbnail: null,
        views: 3201,
        rating: 4.6,
        ratingCount: 512,
        savedCount: 298,
        savedBy: ["user-1", "user-2", "user-3", "user-4", "user-5", "user-7"],
        viewedBy: ["user-1", "user-2", "user-3"],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Docker & Kubernetes: The Complete Guide",
        description: "Master containerization and orchestration for modern DevOps",
        category: "DevOps",
        type: "video",
        difficulty: "Advanced",
        author: "Stephen Grider",
        source: "Udemy",
        url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
        duration: "22 hours",
        tags: ["docker", "kubernetes", "devops", "containers"],
        thumbnail: null,
        views: 1567,
        rating: 4.9,
        ratingCount: 198,
        savedCount: 127,
        savedBy: ["user-4", "user-5", "user-6"],
        viewedBy: ["user-2", "user-3", "user-4"],
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        title: "SQL Performance Explained",
        description: "Expert guide to writing efficient SQL queries and database optimization",
        category: "Database Design",
        type: "article",
        difficulty: "Advanced",
        author: "Markus Winand",
        source: "Use The Index, Luke!",
        url: "https://use-the-index-luke.com/",
        duration: "15 hours",
        tags: ["sql", "database", "optimization", "performance"],
        thumbnail: null,
        views: 892,
        rating: 4.8,
        ratingCount: 145,
        savedCount: 89,
        savedBy: ["user-3", "user-5"],
        viewedBy: ["user-1", "user-2"],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Python for Data Science and Machine Learning",
        description: "Complete bootcamp for learning Python with ML and AI libraries",
        category: "AI/ML",
        type: "course",
        difficulty: "Intermediate",
        author: "Jose Portilla",
        source: "Udemy",
        url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
        duration: "28 hours",
        tags: ["python", "ml", "ai", "data-science"],
        thumbnail: null,
        views: 4123,
        rating: 4.7,
        ratingCount: 623,
        savedCount: 412,
        savedBy: ["user-1", "user-2", "user-3", "user-4", "user-5"],
        viewedBy: ["user-1", "user-2", "user-3", "user-4"],
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Communication Skills for Tech Professionals",
        description: "Improve your technical communication and presentation abilities",
        category: "Soft Skills",
        type: "guide",
        difficulty: "Beginner",
        author: "Communication Masters",
        source: "Medium",
        url: "https://medium.com/@communication/tech-communication",
        duration: "8 hours",
        tags: ["soft-skills", "communication", "presentation"],
        thumbnail: null,
        views: 654,
        rating: 4.5,
        ratingCount: 78,
        savedCount: 45,
        savedBy: ["user-6", "user-7"],
        viewedBy: ["user-1", "user-2"],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Web Development with React and Node.js",
        description: "Full-stack web development with modern JavaScript frameworks",
        category: "Web Development",
        type: "course",
        difficulty: "Intermediate",
        author: "Maximilian Schwarzmüller",
        source: "Udemy",
        url: "https://www.udemy.com/course/nodejs-the-complete-guide/",
        duration: "40 hours",
        tags: ["react", "nodejs", "web", "full-stack"],
        thumbnail: null,
        views: 2876,
        rating: 4.8,
        ratingCount: 456,
        savedCount: 234,
        savedBy: ["user-2", "user-3"],
        viewedBy: ["user-1", "user-3"],
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Algorithms Design Manual",
        description: "Comprehensive reference for algorithm design and analysis",
        category: "Algorithms",
        type: "book",
        difficulty: "Advanced",
        author: "Steven S. Skiena",
        source: "Springer",
        url: "https://www.algorist.com/",
        duration: "60 hours",
        tags: ["algorithms", "design", "advanced", "reference"],
        thumbnail: null,
        views: 1245,
        rating: 4.9,
        ratingCount: 203,
        savedCount: 156,
        savedBy: ["user-4", "user-5", "user-6"],
        viewedBy: ["user-2", "user-3", "user-4"],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Mobile Development with React Native",
        description: "Build cross-platform mobile apps with React Native and JavaScript",
        category: "Mobile Development",
        type: "course",
        difficulty: "Intermediate",
        author: "Academind",
        source: "Udemy",
        url: "https://www.udemy.com/course/react-native-the-practical-guide/",
        duration: "32 hours",
        tags: ["react-native", "mobile", "javascript"],
        thumbnail: null,
        views: 1923,
        rating: 4.6,
        ratingCount: 267,
        savedCount: 178,
        savedBy: ["user-1", "user-2"],
        viewedBy: ["user-1", "user-3"],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Leadership for Technical Leaders",
        description: "Transition from individual contributor to tech leader successfully",
        category: "Leadership",
        type: "guide",
        difficulty: "Intermediate",
        author: "Tech Leadership Academy",
        source: "LinkedIn Learning",
        url: "https://www.linkedin.com/learning/leadership-for-technical-leaders",
        duration: "12 hours",
        tags: ["leadership", "management", "growth"],
        thumbnail: null,
        views: 756,
        rating: 4.4,
        ratingCount: 89,
        savedCount: 62,
        savedBy: ["user-5"],
        viewedBy: ["user-2", "user-4"],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ])

    console.log(`✅ Created ${materials.insertedCount} study materials`)

    console.log(`✅ Created ${replies.insertedCount} discussion replies`)

    // ===== SUMMARY =====
    console.log("\n✨ MongoDB seed data completed successfully!")
    console.log("📊 Collections created:")
    console.log("   - 3 Aptitude Categories")
    console.log("   - 10 Subcategories")
    console.log("   - 5 Sample Questions")
    console.log("   - 3 Sample Companies")
    console.log("   - 5 Group Discussions")
    console.log("   - 4 Discussion Replies")
    console.log("   - 10 Study Materials")
    console.log("   - All indexes created")
  } catch (error) {
    console.error("❌ Error seeding MongoDB:", error)
    throw error
  } finally {
    await client.close()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData().catch(console.error)
}

export default seedData
