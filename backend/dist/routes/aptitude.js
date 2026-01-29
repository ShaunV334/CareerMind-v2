// backend/src/routes/aptitude.ts - MongoDB Implementation
import { Hono } from 'hono';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';
const aptitude = new Hono();
/**
 * GET /aptitude/categories
 * Get all active aptitude categories
 */
aptitude.get('/categories', async (c) => {
    try {
        const db = getDb();
        const categories = await db.collection('aptitude_categories').find({}).toArray();
        return c.json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return c.json({ error: 'Failed to fetch categories' }, 500);
    }
});
/**
 * GET /aptitude/categories/:categoryId
 * Get specific category details
 */
aptitude.get('/categories/:categoryId', async (c) => {
    try {
        const db = getDb();
        const { categoryId } = c.req.param();
        const category = await db.collection('aptitude_categories').findOne({
            _id: new ObjectId(categoryId)
        });
        if (!category) {
            return c.json({ error: 'Category not found' }, 404);
        }
        const subcategories = await db.collection('aptitude_subcategories')
            .find({ categoryId: new ObjectId(categoryId) })
            .toArray();
        return c.json({ ...category, subcategories });
    }
    catch (error) {
        console.error('Error fetching category:', error);
        return c.json({ error: 'Failed to fetch category' }, 500);
    }
});
/**
 * GET /aptitude/questions
 * Get questions with filters
 */
aptitude.get('/questions', async (c) => {
    try {
        const db = getDb();
        const { subcategoryId, difficulty, limit = '20', skip = '0' } = c.req.query();
        const filter = {};
        if (subcategoryId)
            filter.subcategoryId = new ObjectId(subcategoryId);
        if (difficulty)
            filter.difficulty = difficulty;
        const questions = await db.collection('aptitude_questions')
            .find(filter)
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .toArray();
        const total = await db.collection('aptitude_questions').countDocuments(filter);
        return c.json({ questions, total });
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        return c.json({ error: 'Failed to fetch questions' }, 500);
    }
});
/**
 * GET /aptitude/questions/:questionId
 * Get specific question
 */
aptitude.get('/questions/:questionId', async (c) => {
    try {
        const db = getDb();
        const { questionId } = c.req.param();
        const question = await db.collection('aptitude_questions').findOne({
            _id: new ObjectId(questionId)
        });
        if (!question) {
            return c.json({ error: 'Question not found' }, 404);
        }
        return c.json(question);
    }
    catch (error) {
        console.error('Error fetching question:', error);
        return c.json({ error: 'Failed to fetch question' }, 500);
    }
});
/**
 * POST /aptitude/practice/start
 * Start a practice session
 */
aptitude.post('/practice/start', async (c) => {
    try {
        const db = getDb();
        const userId = c.req.header('x-user-id');
        if (!userId) {
            return c.json({ error: 'User ID required' }, 401);
        }
        const { categoryId, subcategoryId, questionCount = 10, difficultyFilter = 'All' } = await c.req.json();
        // Create session
        const session = {
            userId,
            categoryId: new ObjectId(categoryId),
            subcategoryId: subcategoryId ? new ObjectId(subcategoryId) : null,
            sessionStartTime: new Date(),
            totalQuestions: questionCount,
            questionsCorrect: 0,
            sessionStatus: 'In Progress',
            difficultyFilter
        };
        const result = await db.collection('aptitude_practice_sessions').insertOne(session);
        return c.json({ sessionId: result.insertedId, ...session });
    }
    catch (error) {
        console.error('Error starting session:', error);
        return c.json({ error: 'Failed to start practice session' }, 500);
    }
});
/**
 * POST /aptitude/practice/:sessionId/submit-answer
 * Submit an answer in a practice session
 */
aptitude.post('/practice/:sessionId/submit-answer', async (c) => {
    try {
        const db = getDb();
        const userId = c.req.header('x-user-id');
        const { sessionId } = c.req.param();
        if (!userId) {
            return c.json({ error: 'User ID required' }, 401);
        }
        const { questionId, selectedAnswer, timeTaken } = await c.req.json();
        // Get question to check answer
        const question = await db.collection('aptitude_questions').findOne({
            _id: new ObjectId(questionId)
        });
        if (!question) {
            return c.json({ error: 'Question not found' }, 404);
        }
        const isCorrect = selectedAnswer === question.correctAnswer;
        // Save response
        await db.collection('user_aptitude_responses').insertOne({
            userId,
            sessionId: new ObjectId(sessionId),
            questionId: new ObjectId(questionId),
            selectedAnswer,
            isCorrect,
            timeTaken,
            createdAt: new Date()
        });
        // Update session if correct
        if (isCorrect) {
            await db.collection('aptitude_practice_sessions').updateOne({ _id: new ObjectId(sessionId) }, { $inc: { questionsCorrect: 1 } });
        }
        return c.json({
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });
    }
    catch (error) {
        console.error('Error submitting answer:', error);
        return c.json({ error: 'Failed to submit answer' }, 500);
    }
});
/**
 * POST /aptitude/practice/:sessionId/complete
 * Complete a practice session
 */
aptitude.post('/practice/:sessionId/complete', async (c) => {
    try {
        const db = getDb();
        const userId = c.req.header('x-user-id');
        const { sessionId } = c.req.param();
        if (!userId) {
            return c.json({ error: 'User ID required' }, 401);
        }
        const session = await db.collection('aptitude_practice_sessions').findOne({
            _id: new ObjectId(sessionId),
            userId
        });
        if (!session) {
            return c.json({ error: 'Session not found' }, 404);
        }
        const accuracyPercentage = (session.questionsCorrect / session.totalQuestions) * 100;
        const result = await db.collection('aptitude_practice_sessions').updateOne({ _id: new ObjectId(sessionId) }, {
            $set: {
                sessionEndTime: new Date(),
                sessionStatus: 'Completed',
                accuracyPercentage,
                durationSeconds: Math.floor((new Date().getTime() - session.sessionStartTime.getTime()) / 1000)
            }
        });
        return c.json({
            totalQuestions: session.totalQuestions,
            correctAnswers: session.questionsCorrect,
            accuracyPercentage
        });
    }
    catch (error) {
        console.error('Error completing session:', error);
        return c.json({ error: 'Failed to complete session' }, 500);
    }
});
/**
 * GET /aptitude/user/progress
 * Get user's aptitude progress
 */
aptitude.get('/user/progress', async (c) => {
    try {
        const db = getDb();
        const userId = c.req.header('x-user-id');
        if (!userId) {
            return c.json({ error: 'User ID required' }, 401);
        }
        const progress = await db.collection('user_aptitude_progress')
            .find({ userId })
            .toArray();
        return c.json(progress);
    }
    catch (error) {
        console.error('Error fetching progress:', error);
        return c.json({ error: 'Failed to fetch progress' }, 500);
    }
});
/**
 * POST /aptitude/bookmarks/:questionId
 * Bookmark a question
 */
aptitude.post('/bookmarks/:questionId', async (c) => {
    try {
        const db = getDb();
        const userId = c.req.header('x-user-id');
        const { questionId } = c.req.param();
        if (!userId) {
            return c.json({ error: 'User ID required' }, 401);
        }
        await db.collection('user_bookmarked_aptitude_questions').updateOne({ userId, questionId: new ObjectId(questionId) }, {
            $set: {
                userId,
                questionId: new ObjectId(questionId),
                bookmarkedAt: new Date()
            }
        }, { upsert: true });
        return c.json({ message: 'Question bookmarked' });
    }
    catch (error) {
        console.error('Error bookmarking question:', error);
        return c.json({ error: 'Failed to bookmark question' }, 500);
    }
});
/**
 * GET /aptitude/bookmarks
 * Get user's bookmarked questions
 */
aptitude.get('/bookmarks', async (c) => {
    try {
        const db = getDb();
        const userId = c.req.header('x-user-id');
        if (!userId) {
            return c.json({ error: 'User ID required' }, 401);
        }
        const bookmarks = await db.collection('user_bookmarked_aptitude_questions')
            .find({ userId })
            .toArray();
        return c.json(bookmarks);
    }
    catch (error) {
        console.error('Error fetching bookmarks:', error);
        return c.json({ error: 'Failed to fetch bookmarks' }, 500);
    }
});
export default aptitude;
