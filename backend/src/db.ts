import { MongoClient, Db } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGO_DB || "careermind"

let client: MongoClient | null = null
let db: Db | null = null

export async function connect() {
  if (db) return db
  client = new MongoClient(MONGO_URI)
  await client.connect()
  db = client.db(DB_NAME)
  console.log(`Connected to MongoDB ${MONGO_URI} db=${DB_NAME}`)
  return db
}

export function getDb() {
  if (!db) throw new Error("Database not connected. Call connect() first.")
  return db
}

export async function close() {
  if (client) await client.close()
  client = null
  db = null
}
