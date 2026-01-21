import { Hono } from "hono"
import { connect, getDb } from "../db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

function getTokenFromRequest(c: any) {
  const authHeader = c.req.headers.get("authorization") || ""
  let token = authHeader.replace(/^Bearer\s+/i, "")
  if (token) return token
  const cookie = c.req.headers.get("cookie") || ""
  const m = cookie.match(/(?:^|; )token=([^;]+)/)
  return m ? m[1] : undefined
}

function makeCookie(token: string) {
  const isProd = process.env.NODE_ENV === "production"
  return `token=${token}; HttpOnly; Path=/; Max-Age=${TOKEN_MAX_AGE}; SameSite=Strict${isProd ? "; Secure" : ""}`
}

const auth = new Hono()

auth.use(async (c, next) => {
  // ensure DB connected
  await connect()
  await next()
})

auth.post("/signup", async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, password } = body as { name?: string; email?: string; password?: string }
    if (!email || !password) return c.json({ error: "Missing email or password" }, 400)

    const db = getDb()
    const users = db.collection("users")
    const existing = await users.findOne({ email: email.toLowerCase() })
    if (existing) return c.json({ error: "User already exists" }, 400)

    const hashed = await bcrypt.hash(password, 10)
    const now = new Date()
    const res = await users.insertOne({ name: name || "", email: email.toLowerCase(), passwordHash: hashed, createdAt: now })
    const userId = res.insertedId.toString()
    const token = jwt.sign({ userId, email: email.toLowerCase() }, JWT_SECRET, { expiresIn: "7d" })
    // set httpOnly cookie
    c.header("Set-Cookie", makeCookie(token))

    return c.json({ token, user: { id: userId, email, name } })
  } catch (err: any) {
    console.error(err)
    return c.json({ error: "Internal server error" }, 500)
  }
})

auth.post("/login", async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = body as { email?: string; password?: string }
    if (!email || !password) return c.json({ error: "Missing email or password" }, 400)

    const db = getDb()
    const users = db.collection("users")
    const user = await users.findOne({ email: email.toLowerCase() }) as any
    if (!user) return c.json({ error: "Invalid credentials" }, 401)

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return c.json({ error: "Invalid credentials" }, 401)

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" })
    // set httpOnly cookie
    c.header("Set-Cookie", makeCookie(token))
    return c.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } })
  } catch (err: any) {
    console.error(err)
    return c.json({ error: "Internal server error" }, 500)
  }
})

auth.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "")
    if (!token) return c.json({ error: "Missing token" }, 401)
    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return c.json({ error: "Invalid token" }, 401)
    }
    const db = getDb()
    const users = db.collection("users")
    const user = await users.findOne({ _id: new ObjectId((payload as any).userId) }) as any
    if (!user) return c.json({ error: "User not found" }, 404)
    return c.json({ user: { id: user._id.toString(), email: user.email, name: user.name } })
  } catch (err: any) {
    console.error(err)
    return c.json({ error: "Internal server error" }, 500)
  }
})

auth.post('/logout', (c) => {
  const isProd = process.env.NODE_ENV === 'production'
  const cookie = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${isProd ? '; Secure' : ''}`
  c.header('Set-Cookie', cookie)
  return c.json({ ok: true })
})

export default auth
