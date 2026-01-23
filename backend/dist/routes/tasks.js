import { Hono } from "hono";
import { getDb, connect } from "../db.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
// Middleware to verify JWT and extract userId
async function verifyAuth(c) {
    const authHeader = c.req.header("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
        return { error: "Missing token", user: null };
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return { error: null, user: { userId: payload.userId, email: payload.email } };
    }
    catch (e) {
        return { error: "Invalid token", user: null };
    }
}
const tasks = new Hono();
tasks.use(async (c, next) => {
    await connect();
    await next();
});
// GET /api/tasks - Get tasks for user (optionally filtered by date range)
tasks.get("/", async (c) => {
    try {
        console.log("GET /api/tasks called");
        const auth = await verifyAuth(c);
        console.log("Auth result:", auth);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const db = getDb();
        console.log("Got database connection");
        const tasksCollection = db.collection("tasks");
        console.log("Got tasks collection");
        // Optional query params for date filtering
        const startDate = c.req.query("startDate"); // YYYY-MM-DD
        const endDate = c.req.query("endDate"); // YYYY-MM-DD
        const date = c.req.query("date"); // YYYY-MM-DD
        let filter = { userId: auth.user.userId };
        console.log("Initial filter:", filter);
        if (date) {
            filter.date = date;
        }
        else if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = startDate;
            if (endDate)
                filter.date.$lte = endDate;
        }
        console.log("Final filter:", filter);
        const allTasks = await tasksCollection
            .find(filter)
            .sort({ date: 1, createdAt: 1 })
            .toArray();
        console.log("Found tasks:", allTasks.length);
        // Group by date for frontend
        const groupedTasks = {};
        allTasks.forEach((task) => {
            if (!groupedTasks[task.date]) {
                groupedTasks[task.date] = [];
            }
            groupedTasks[task.date].push({
                id: task._id.toString(),
                text: task.text,
                completed: task.completed,
                priority: task.priority,
                category: task.category,
                createdAt: task.createdAt,
                recurring: task.recurring,
            });
        });
        return c.json({ tasks: groupedTasks });
    }
    catch (err) {
        console.error("ERROR in GET /api/tasks:", err);
        return c.json({ error: err.message || "Internal server error" }, 500);
    }
});
// POST /api/tasks - Create task
tasks.post("/", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const body = await c.req.json();
        const { date, text, completed = false, priority, category, recurring } = body;
        if (!date || !text) {
            return c.json({ error: "Missing required fields: date, text" }, 400);
        }
        const db = getDb();
        const tasksCollection = db.collection("tasks");
        const taskDoc = {
            userId: auth.user.userId,
            date,
            text,
            completed,
            priority: priority || null,
            category: category || null,
            recurring: recurring || null,
            createdAt: new Date().toISOString(),
        };
        const result = await tasksCollection.insertOne(taskDoc);
        return c.json({
            id: result.insertedId.toString(),
            ...taskDoc,
        });
    }
    catch (err) {
        console.error(err);
        return c.json({ error: "Internal server error" }, 500);
    }
});
// PUT /api/tasks/:id - Update task
tasks.put("/:id", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const taskId = c.req.param("id");
        if (!ObjectId.isValid(taskId)) {
            return c.json({ error: "Invalid task ID" }, 400);
        }
        const body = await c.req.json();
        const db = getDb();
        const tasksCollection = db.collection("tasks");
        // Verify ownership
        const task = await tasksCollection.findOne({
            _id: new ObjectId(taskId),
            userId: auth.user.userId,
        });
        if (!task) {
            return c.json({ error: "Task not found" }, 404);
        }
        // Only allow updates to these fields
        const allowedUpdates = ["text", "completed", "priority", "category", "recurring"];
        const updates = {};
        allowedUpdates.forEach((field) => {
            if (field in body) {
                updates[field] = body[field];
            }
        });
        const result = await tasksCollection.findOneAndUpdate({ _id: new ObjectId(taskId) }, { $set: updates }, { returnDocument: "after" });
        const updatedTask = result.value;
        return c.json({
            id: updatedTask._id.toString(),
            text: updatedTask.text,
            completed: updatedTask.completed,
            priority: updatedTask.priority,
            category: updatedTask.category,
            recurring: updatedTask.recurring,
            createdAt: updatedTask.createdAt,
        });
    }
    catch (err) {
        console.error(err);
        return c.json({ error: "Internal server error" }, 500);
    }
});
// DELETE /api/tasks/:id - Delete task
tasks.delete("/:id", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const taskId = c.req.param("id");
        if (!ObjectId.isValid(taskId)) {
            return c.json({ error: "Invalid task ID" }, 400);
        }
        const db = getDb();
        const tasksCollection = db.collection("tasks");
        // Verify ownership
        const task = await tasksCollection.findOne({
            _id: new ObjectId(taskId),
            userId: auth.user.userId,
        });
        if (!task) {
            return c.json({ error: "Task not found" }, 404);
        }
        await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });
        return c.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        return c.json({ error: "Internal server error" }, 500);
    }
});
export default tasks;
// NOTES ENDPOINTS
// GET /api/tasks/notes/get - Get user's notes
tasks.get("/notes/get", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const db = getDb();
        const notesCollection = db.collection("notes");
        const note = await notesCollection.findOne({ userId: auth.user.userId });
        return c.json({ notes: note?.content || "" });
    }
    catch (err) {
        console.error("ERROR in GET /api/tasks/notes/get:", err);
        return c.json({ error: err.message || "Internal server error" }, 500);
    }
});
// POST /api/tasks/notes/save - Save user's notes
tasks.post("/notes/save", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const body = await c.req.json();
        const { content } = body;
        const db = getDb();
        const notesCollection = db.collection("notes");
        const result = await notesCollection.updateOne({ userId: auth.user.userId }, {
            $set: {
                userId: auth.user.userId,
                content: content || "",
                updatedAt: new Date().toISOString(),
            },
        }, { upsert: true });
        return c.json({ ok: true });
    }
    catch (err) {
        console.error("ERROR in POST /api/tasks/notes/save:", err);
        return c.json({ error: err.message || "Internal server error" }, 500);
    }
});
