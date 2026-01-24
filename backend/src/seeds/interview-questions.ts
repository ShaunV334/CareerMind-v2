// Interview Prep Questions - Behavioral, Technical, System Design
export const interviewQuestions = [
  // Behavioral Questions
  {
    question: "Tell me about a time you had to deal with a difficult team member. How did you handle it?",
    category: "Behavioral",
    type: "STAR",
    difficulty: "Medium",
    tags: ["Communication", "Teamwork", "Conflict Resolution"],
    expectedKeywords: ["situation", "action", "result", "communication", "resolution"],
  },
  {
    question: "Describe a project where you had to learn a new technology quickly. What was your approach?",
    category: "Behavioral",
    type: "STAR",
    difficulty: "Medium",
    tags: ["Learning", "Problem Solving", "Adaptability"],
    expectedKeywords: ["learning", "research", "practice", "result", "applied"],
  },
  {
    question: "Tell me about a time you failed. What did you learn from it?",
    category: "Behavioral",
    type: "STAR",
    difficulty: "Medium",
    tags: ["Resilience", "Growth Mindset", "Learning"],
    expectedKeywords: ["failure", "learning", "improvement", "reflection", "lesson"],
  },
  {
    question: "Describe a situation where you had to work under pressure to meet a deadline.",
    category: "Behavioral",
    type: "STAR",
    difficulty: "Medium",
    tags: ["Time Management", "Pressure Handling", "Prioritization"],
    expectedKeywords: ["deadline", "prioritize", "communication", "solution", "delivered"],
  },

  // Technical Questions
  {
    question: "Explain the difference between SQL and NoSQL databases. When would you use each?",
    category: "Technical",
    type: "Explanation",
    difficulty: "Medium",
    tags: ["Databases", "Data Structures", "Architecture"],
    expectedKeywords: ["ACID", "scalability", "flexibility", "relational", "document", "use case"],
  },
  {
    question: "What is REST API? Explain its principles and HTTP methods.",
    category: "Technical",
    type: "Explanation",
    difficulty: "Medium",
    tags: ["APIs", "Web Development", "Backend"],
    expectedKeywords: ["stateless", "HTTP", "GET", "POST", "PUT", "DELETE", "resource", "URL"],
  },
  {
    question: "How does caching work? What are different caching strategies?",
    category: "Technical",
    type: "Explanation",
    difficulty: "Medium",
    tags: ["Performance", "System Design", "Optimization"],
    expectedKeywords: ["cache", "LRU", "TTL", "memory", "speed", "hit rate"],
  },
  {
    question: "What is the difference between authentication and authorization?",
    category: "Technical",
    type: "Explanation",
    difficulty: "Easy",
    tags: ["Security", "Authentication", "Web Security"],
    expectedKeywords: ["authentication", "authorization", "identity", "permissions", "JWT", "OAuth"],
  },

  // System Design Questions
  {
    question: "Design a URL shortener (like bit.ly). Walk me through your approach.",
    category: "System Design",
    type: "Design",
    difficulty: "Hard",
    tags: ["System Design", "Scalability", "Database Design"],
    expectedKeywords: ["hash", "database", "sharding", "caching", "load balancing", "scalability"],
  },
  {
    question: "How would you design a social media feed system that needs to handle millions of users?",
    category: "System Design",
    type: "Design",
    difficulty: "Hard",
    tags: ["System Design", "Scalability", "Real-time"],
    expectedKeywords: ["database", "cache", "queue", "load balancing", "replication", "sharding"],
  },
  {
    question: "Design a rate limiter for an API. How would you implement it?",
    category: "System Design",
    type: "Design",
    difficulty: "Hard",
    tags: ["System Design", "Security", "Performance"],
    expectedKeywords: ["token bucket", "sliding window", "Redis", "requests per second", "throttle"],
  },
];
