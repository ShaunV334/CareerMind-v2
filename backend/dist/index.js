import { serve } from "@hono/node-server";
import { Hono } from "hono";
// simple manual CORS middleware (avoids external dependency)
import dotenv from "dotenv";
import auth from "./routes/auth.js";
import tasks from "./routes/tasks.js";
import resumes from "./routes/resumes.js";
import questions from "./routes/questions.js";
import interview from "./routes/interview.js";
import aptitude from "./routes/aptitude.js";
import companies from "./routes/companies.js";
import experiences from "./routes/experiences.js";
import { connect } from "./db.js";
dotenv.config();
const app = new Hono();
app.use('*', async (c, next) => {
    const origin = c.req.header('origin') || '*';
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (c.req.method === 'OPTIONS') {
        return c.text('ok');
    }
    await next();
});
app.get("/", (c) => c.text("Hello Hono!"));
// mount auth routes under /api/auth
app.route("/api/auth", auth);
// mount tasks routes under /api/tasks
app.route("/api/tasks", tasks);
// mount resumes routes under /api/resumes
app.route("/api/resumes", resumes);
// mount questions routes under /api/questions
app.route("/api/questions", questions);
// mount interview routes under /api/interview
app.route("/api/interview", interview);
// mount aptitude routes under /api/aptitude
app.route("/api/aptitude", aptitude);
// mount companies routes under /api/companies
app.route("/api/companies", companies);
// mount experiences routes under /api/experiences
app.route("/api/experiences", experiences);
connect().catch((err) => console.error("DB connect error", err));
serve({
    fetch: app.fetch,
    port: Number(process.env.PORT || 3000),
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
