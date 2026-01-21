import { serve } from "@hono/node-server"
import { Hono } from "hono"
// simple manual CORS middleware (avoids external dependency)
import dotenv from "dotenv"
import auth from "./routes/auth.js"
import { connect } from "./db.js"

dotenv.config()

const app = new Hono()

app.use('*', async (c, next) => {
  const origin = c.req.header('origin') || '*'
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Access-Control-Allow-Credentials', 'true')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (c.req.method === 'OPTIONS') {
    return c.text('ok')
  }
  await next()
})

app.get("/", (c) => c.text("Hello Hono!"))

// mount auth routes under /api/auth
app.route("/api/auth", auth)

// connect to DB at startup
connect().catch((err: unknown) => console.error("DB connect error", err))

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT || 3000),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
