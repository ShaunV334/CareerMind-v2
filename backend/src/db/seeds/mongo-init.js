// MongoDB Collection Initialization
// Run this in MongoDB Compass or mongosh to create all collections and indexes

// ===== STAGE 1: APTITUDE COLLECTIONS =====

// 1. Aptitude Categories
db.createCollection("aptitude_categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "description"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string", enum: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"] },
        description: { bsonType: "string" },
        icon: { bsonType: "string" },
        subcategoryCount: { bsonType: "int" },
        questionCount: { bsonType: "int" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.aptitude_categories.createIndex({ name: 1 }, { unique: true })

// 2. Aptitude Subcategories
db.createCollection("aptitude_subcategories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["categoryId", "name"],
      properties: {
        _id: { bsonType: "objectId" },
        categoryId: { bsonType: "objectId" },
        name: { bsonType: "string" },
        description: { bsonType: "string" },
        questionCount: { bsonType: "int" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.aptitude_subcategories.createIndex({ categoryId: 1 })
db.aptitude_subcategories.createIndex({ categoryId: 1, name: 1 }, { unique: true })

// 3. Aptitude Questions
db.createCollection("aptitude_questions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["subcategoryId", "questionText", "options", "correctAnswer"],
      properties: {
        _id: { bsonType: "objectId" },
        subcategoryId: { bsonType: "objectId" },
        categoryId: { bsonType: "objectId" },
        questionText: { bsonType: "string" },
        questionType: { bsonType: "string", enum: ["multiple-choice", "numerical", "true-false"] },
        difficulty: { bsonType: "string", enum: ["Easy", "Medium", "Hard"] },
        options: { bsonType: "array", items: { bsonType: "object" } },
        correctAnswer: { bsonType: "string" },
        explanation: { bsonType: "string" },
        tags: { bsonType: "array", items: { bsonType: "string" } },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.aptitude_questions.createIndex({ subcategoryId: 1 })
db.aptitude_questions.createIndex({ categoryId: 1 })
db.aptitude_questions.createIndex({ difficulty: 1 })

// 4. User Aptitude Responses
db.createCollection("user_aptitude_responses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "questionId", "selectedAnswer"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        sessionId: { bsonType: "objectId" },
        questionId: { bsonType: "objectId" },
        selectedAnswer: { bsonType: "string" },
        isCorrect: { bsonType: "bool" },
        timeTaken: { bsonType: "int" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.user_aptitude_responses.createIndex({ userId: 1, createdAt: -1 })
db.user_aptitude_responses.createIndex({ sessionId: 1 })
db.user_aptitude_responses.createIndex({ userId: 1, questionId: 1 })

// 5. Aptitude Practice Sessions
db.createCollection("aptitude_practice_sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "categoryId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        categoryId: { bsonType: "objectId" },
        subcategoryId: { bsonType: "objectId" },
        sessionStartTime: { bsonType: "date" },
        sessionEndTime: { bsonType: "date" },
        durationSeconds: { bsonType: "int" },
        totalQuestions: { bsonType: "int" },
        questionsCorrect: { bsonType: "int" },
        accuracyPercentage: { bsonType: "double" },
        questionsSkipped: { bsonType: "int" },
        sessionStatus: { bsonType: "string", enum: ["In Progress", "Completed", "Abandoned"] },
        difficultyFilter: { bsonType: "string" }
      }
    }
  }
})

db.aptitude_practice_sessions.createIndex({ userId: 1, sessionStartTime: -1 })
db.aptitude_practice_sessions.createIndex({ userId: 1, categoryId: 1 })

// 6. User Bookmarked Questions
db.createCollection("user_bookmarked_aptitude_questions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "questionId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        questionId: { bsonType: "objectId" },
        bookmarkedAt: { bsonType: "date" }
      }
    }
  }
})

db.user_bookmarked_aptitude_questions.createIndex({ userId: 1 })
db.user_bookmarked_aptitude_questions.createIndex({ userId: 1, questionId: 1 }, { unique: true })

// 7. User Aptitude Progress
db.createCollection("user_aptitude_progress", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        categoryId: { bsonType: "objectId" },
        questionsAttempted: { bsonType: "int" },
        questionsCompleted: { bsonType: "int" },
        accuracyPercentage: { bsonType: "double" },
        lastAccessedAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.user_aptitude_progress.createIndex({ userId: 1 })

// ===== STAGE 2: COMPANY COLLECTIONS =====

// 8. Companies
db.createCollection("companies", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        slug: { bsonType: "string" },
        description: { bsonType: "string" },
        logoUrl: { bsonType: "string" },
        industry: { bsonType: "string" },
        foundedYear: { bsonType: "int" },
        headquarters: { bsonType: "string" },
        websiteUrl: { bsonType: "string" },
        difficultyRating: { bsonType: "double" },
        questionCount: { bsonType: "int" },
        interviewCount: { bsonType: "int" },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.companies.createIndex({ name: 1 }, { unique: true })
db.companies.createIndex({ slug: 1 }, { unique: true })
db.companies.createIndex({ industry: 1 })

// 9. Company Roles
db.createCollection("company_roles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "roleName"],
      properties: {
        _id: { bsonType: "objectId" },
        companyId: { bsonType: "objectId" },
        roleName: { bsonType: "string" },
        description: { bsonType: "string" },
        focusAreas: { bsonType: "string" },
        difficultyLevel: { bsonType: "string", enum: ["Easy", "Medium", "Hard"] },
        experienceLevel: { bsonType: "string" },
        questionCount: { bsonType: "int" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.company_roles.createIndex({ companyId: 1 })
db.company_roles.createIndex({ companyId: 1, roleName: 1 }, { unique: true })

// 10. Company Questions
db.createCollection("company_questions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId"],
      properties: {
        _id: { bsonType: "objectId" },
        companyId: { bsonType: "objectId" },
        companyRoleId: { bsonType: "objectId" },
        aptitudeQuestionId: { bsonType: "objectId" },
        customQuestionText: { bsonType: "string" },
        questionSource: { bsonType: "string", enum: ["aptitude", "custom", "leetcode", "glassdoor"] },
        frequencyScore: { bsonType: "double" },
        askedCount: { bsonType: "int" },
        avgDifficulty: { bsonType: "double" },
        tags: { bsonType: "array", items: { bsonType: "string" } },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.company_questions.createIndex({ companyId: 1 })
db.company_questions.createIndex({ companyId: 1, frequencyScore: -1 })
db.company_questions.createIndex({ companyRoleId: 1 })

// 11. User Company Progress
db.createCollection("user_company_progress", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "companyId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        companyId: { bsonType: "objectId" },
        companyRoleId: { bsonType: "objectId" },
        prepStartDate: { bsonType: "date" },
        questionsAttempted: { bsonType: "int" },
        questionsCompleted: { bsonType: "int" },
        accuracyPercentage: { bsonType: "double" },
        status: { bsonType: "string", enum: ["Not Started", "In Progress", "Completed", "Paused"] },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

db.user_company_progress.createIndex({ userId: 1 })
db.user_company_progress.createIndex({ userId: 1, companyId: 1 }, { unique: true })

// 12. Company Interview Tips
db.createCollection("company_interview_tips", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "tipText"],
      properties: {
        _id: { bsonType: "objectId" },
        companyId: { bsonType: "objectId" },
        companyRoleId: { bsonType: "objectId" },
        tipCategory: { bsonType: "string", enum: ["Preparation", "Interview", "Negotiation", "Culture Fit"] },
        tipText: { bsonType: "string" },
        authorUserId: { bsonType: "string" },
        helpfulCount: { bsonType: "int" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.company_interview_tips.createIndex({ companyId: 1 })
db.company_interview_tips.createIndex({ helpfulCount: -1 })

// ===== STAGE 3: INTERVIEW COLLECTIONS =====

// 13. Interview Experiences
db.createCollection("interview_experiences", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "companyId", "interviewDate"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        companyId: { bsonType: "objectId" },
        companyRoleId: { bsonType: "objectId" },
        interviewDate: { bsonType: "date" },
        interviewRound: { bsonType: "int" },
        interviewType: { bsonType: "string", enum: ["Phone Screen", "Technical", "System Design", "Behavioral", "Group Discussion", "HR"] },
        durationMinutes: { bsonType: "int" },
        difficultyRating: { bsonType: "double" },
        experienceRating: { bsonType: "double" },
        outcome: { bsonType: "string", enum: ["Pass", "Fail", "Pending", "Unknown"] },
        feedback: { bsonType: "string" },
        topicsDiscussed: { bsonType: "array", items: { bsonType: "string" } },
        questionsAsked: { bsonType: "array", items: { bsonType: "string" } },
        isAnonymous: { bsonType: "bool" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.interview_experiences.createIndex({ userId: 1, interviewDate: -1 })
db.interview_experiences.createIndex({ companyId: 1 })
db.interview_experiences.createIndex({ outcome: 1 })

// 14. Interview Question History
db.createCollection("interview_question_history", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["interviewExperienceId", "questionText"],
      properties: {
        _id: { bsonType: "objectId" },
        interviewExperienceId: { bsonType: "objectId" },
        questionText: { bsonType: "string" },
        questionCategory: { bsonType: "string" },
        userAnswer: { bsonType: "string" },
        answerQuality: { bsonType: "string", enum: ["Poor", "Fair", "Good", "Excellent", "Not Attempted"] },
        interviewerFeedback: { bsonType: "string" },
        difficulty: { bsonType: "string", enum: ["Easy", "Medium", "Hard"] }
      }
    }
  }
})

db.interview_question_history.createIndex({ interviewExperienceId: 1 })

// 15. Interview Tips Shared
db.createCollection("interview_tips_shared", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "companyId", "tipTitle", "tipContent"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        companyId: { bsonType: "objectId" },
        companyRoleId: { bsonType: "objectId" },
        interviewType: { bsonType: "string" },
        tipTitle: { bsonType: "string" },
        tipContent: { bsonType: "string" },
        tipCategory: { bsonType: "string" },
        confidenceLevel: { bsonType: "string", enum: ["Low", "Medium", "High"] },
        helpfulCount: { bsonType: "int" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.interview_tips_shared.createIndex({ userId: 1 })
db.interview_tips_shared.createIndex({ companyId: 1 })
db.interview_tips_shared.createIndex({ helpfulCount: -1 })

// 16. Interview Preparation Plans
db.createCollection("interview_preparation_plans", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "companyId", "startDate"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        companyId: { bsonType: "objectId" },
        companyRoleId: { bsonType: "objectId" },
        planName: { bsonType: "string" },
        startDate: { bsonType: "date" },
        targetInterviewDate: { bsonType: "date" },
        status: { bsonType: "string", enum: ["Planned", "Active", "Completed", "Cancelled"] },
        completionPercentage: { bsonType: "double" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.interview_preparation_plans.createIndex({ userId: 1 })
db.interview_preparation_plans.createIndex({ userId: 1, companyId: 1 })

// 17. Interview Daily Tasks
db.createCollection("interview_daily_tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["prepPlanId", "taskDayNumber", "taskTitle"],
      properties: {
        _id: { bsonType: "objectId" },
        prepPlanId: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        taskDayNumber: { bsonType: "int" },
        taskTitle: { bsonType: "string" },
        taskDescription: { bsonType: "string" },
        taskType: { bsonType: "string" },
        difficultyLevel: { bsonType: "string" },
        estimatedDurationMinutes: { bsonType: "int" },
        isCompleted: { bsonType: "bool" },
        completionDate: { bsonType: "date" },
        performanceScore: { bsonType: "double" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.interview_daily_tasks.createIndex({ prepPlanId: 1 })
db.interview_daily_tasks.createIndex({ userId: 1 })

// 18. Mock Interview Sessions
db.createCollection("mock_interview_sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "companyId", "sessionStartTime"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        prepPlanId: { bsonType: "objectId" },
        companyId: { bsonType: "objectId" },
        companyRoleId: { bsonType: "objectId" },
        sessionTitle: { bsonType: "string" },
        sessionStartTime: { bsonType: "date" },
        sessionEndTime: { bsonType: "date" },
        durationSeconds: { bsonType: "int" },
        interviewType: { bsonType: "string" },
        difficultyLevel: { bsonType: "string" },
        questionsCount: { bsonType: "int" },
        questionsCorrect: { bsonType: "int" },
        accuracyPercentage: { bsonType: "double" },
        feedbackGiven: { bsonType: "string" },
        sessionStatus: { bsonType: "string" },
        ratingByUser: { bsonType: "double" }
      }
    }
  }
})

db.mock_interview_sessions.createIndex({ userId: 1, sessionStartTime: -1 })
db.mock_interview_sessions.createIndex({ companyId: 1 })

// 19. Interview Feedback
db.createCollection("interview_feedback", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["feedbackText"],
      properties: {
        _id: { bsonType: "objectId" },
        interviewExperienceId: { bsonType: "objectId" },
        mockInterviewSessionId: { bsonType: "objectId" },
        feedbackFromUserId: { bsonType: "string" },
        feedbackText: { bsonType: "string" },
        feedbackCategory: { bsonType: "string" },
        rating: { bsonType: "double" },
        helpfulCount: { bsonType: "int" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.interview_feedback.createIndex({ interviewExperienceId: 1 })
db.interview_feedback.createIndex({ mockInterviewSessionId: 1 })

// 20. Interview Outcomes
db.createCollection("interview_outcomes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "companyId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        companyId: { bsonType: "objectId" },
        companyRoleId: { bsonType: "objectId" },
        interviewCount: { bsonType: "int" },
        finalOutcome: { bsonType: "string" },
        salaryOffered: { bsonType: "double" },
        salaryCurrency: { bsonType: "string" },
        stockOptions: { bsonType: "double" },
        bonus: { bsonType: "double" },
        offerAcceptanceDate: { bsonType: "date" },
        joiningDate: { bsonType: "date" },
        ratingOverall: { bsonType: "double" },
        wouldRecommend: { bsonType: "bool" },
        createdAt: { bsonType: "date" }
      }
    }
  }
})

db.interview_outcomes.createIndex({ userId: 1, companyId: 1 }, { unique: true })

console.log("✅ All MongoDB collections and indexes created successfully!")
