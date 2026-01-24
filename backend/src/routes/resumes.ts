import { Hono } from "hono"
import { getDb, connect } from "../db.js"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import puppeteer from "puppeteer"

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"

// Middleware to verify JWT and extract userId
async function verifyAuth(c: any) {
  const authHeader = c.req.header("authorization") || ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  
  if (!token) {
    return { error: "Missing token", user: null }
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    return { error: null, user: { userId: payload.userId, email: payload.email } }
  } catch (e) {
    return { error: "Invalid token", user: null }
  }
}

const resumes = new Hono()

resumes.use(async (c, next) => {
  await connect()
  await next()
})

// GET /api/resumes - Get all resumes for user
resumes.get("/", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) return c.json({ error: auth.error }, 401)

    const db = getDb()
    const resumesCollection = db.collection("resumes")

    const userResumes = await resumesCollection
      .find({ userId: auth.user!.userId })
      .sort({ createdAt: -1 })
      .toArray()

    // Convert ObjectId to string for frontend
    const formattedResumes = userResumes.map((resume: any) => ({
      ...resume,
      id: resume._id.toString(),
    }))

    return c.json({ resumes: formattedResumes })
  } catch (error) {
    console.error("GET /resumes error:", error)
    return c.json({ error: "Failed to fetch resumes" }, 500)
  }
})

// POST /api/resumes - Create new resume
resumes.post("/", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) return c.json({ error: auth.error }, 401)

    const body = await c.req.json()
    const { name, data } = body

    if (!name) {
      return c.json({ error: "Resume name is required" }, 400)
    }

    const db = getDb()
    const resumesCollection = db.collection("resumes")

    const newResume = {
      userId: auth.user!.userId,
      name,
      data: data || {
        contactInfo: {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
        },
        professionalSummary: "",
        workExperience: [],
        education: [],
        skills: [],
        projects: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await resumesCollection.insertOne(newResume)

    return c.json({
      id: result.insertedId.toString(),
      _id: result.insertedId,
      userId: auth.user!.userId,
      name,
      data: newResume.data,
      createdAt: newResume.createdAt,
      updatedAt: newResume.updatedAt,
    })
  } catch (error) {
    console.error("POST /resumes error:", error)
    return c.json({ error: "Failed to create resume" }, 500)
  }
})

// PUT /api/resumes/:id - Update resume data
resumes.put("/:id", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) return c.json({ error: auth.error }, 401)

    const resumeId = c.req.param("id")
    const body = await c.req.json()
    const { name, data } = body

    const db = getDb()
    const resumesCollection = db.collection("resumes")

    // Verify ownership
    const resume = await resumesCollection.findOne({
      _id: new ObjectId(resumeId),
      userId: auth.user!.userId,
    })

    if (!resume) {
      return c.json({ error: "Resume not found" }, 404)
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name) updateData.name = name
    if (data) updateData.data = data

    const result = await resumesCollection.findOneAndUpdate(
      { _id: new ObjectId(resumeId) },
      { $set: updateData },
      { returnDocument: "after" }
    )

    if (!result.value) {
      return c.json({ error: "Resume not found" }, 404)
    }

    return c.json({
      ...result.value,
      id: result.value._id.toString(),
    })
  } catch (error) {
    console.error("PUT /resumes/:id error:", error)
    return c.json({ error: "Failed to update resume" }, 500)
  }
})

// DELETE /api/resumes/:id - Delete resume
resumes.delete("/:id", async (c) => {
  try {
    const auth = await verifyAuth(c)
    if (auth.error) return c.json({ error: auth.error }, 401)

    const resumeId = c.req.param("id")

    const db = getDb()
    const resumesCollection = db.collection("resumes")

    // Verify ownership before deleting
    const resume = await resumesCollection.findOne({
      _id: new ObjectId(resumeId),
      userId: auth.user!.userId,
    })

    if (!resume) {
      return c.json({ error: "Resume not found" }, 404)
    }

    const result = await resumesCollection.deleteOne({
      _id: new ObjectId(resumeId),
    })

    return c.json({ ok: result.deletedCount === 1 })
  } catch (error) {
    console.error("DELETE /resumes/:id error:", error)
    return c.json({ error: "Failed to delete resume" }, 500)
  }
})

// GET /api/resumes/:id/pdf - Generate PDF
resumes.get("/:id/pdf", async (c) => {
  let browser = null
  try {
    const auth = await verifyAuth(c)
    if (auth.error) return c.json({ error: auth.error }, 401)

    const resumeId = c.req.param("id")

    const db = getDb()
    const resumesCollection = db.collection("resumes")

    const resume = await resumesCollection.findOne({
      _id: new ObjectId(resumeId),
      userId: auth.user!.userId,
    })

    if (!resume) {
      return c.json({ error: "Resume not found" }, 404)
    }

    const data = resume.data || {}
    const contact = data.contactInfo || {}

    // Generate HTML for the resume
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: white;
      color: #333;
      line-height: 1.4;
    }
    .container {
      max-width: 8.5in;
      height: 11in;
      margin: 0 auto;
      padding: 0.5in;
      background-color: white;
    }
    header {
      text-align: center;
      margin-bottom: 0.25in;
      border-bottom: 2px solid #333;
      padding-bottom: 0.2in;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 0.1in;
    }
    .contact-info {
      font-size: 10px;
      color: #555;
      margin-bottom: 0.05in;
    }
    section {
      margin-bottom: 0.2in;
    }
    h2 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 0.15in;
      margin-bottom: 0.1in;
      border-bottom: 1px solid #999;
      padding-bottom: 0.05in;
      letter-spacing: 0.5px;
    }
    .entry {
      margin-bottom: 0.15in;
      page-break-inside: avoid;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.02in;
    }
    .entry-title {
      font-weight: 600;
      font-size: 10px;
    }
    .entry-subtitle {
      font-size: 9.5px;
      color: #555;
    }
    .entry-date {
      font-size: 9px;
      color: #666;
      text-align: right;
    }
    .entry-description {
      font-size: 9.5px;
      margin-top: 0.03in;
      line-height: 1.3;
      color: #333;
    }
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.1in;
      font-size: 9.5px;
    }
    .skill-item {
      display: inline-block;
    }
    .url {
      color: #0563C1;
      text-decoration: none;
      word-break: break-all;
      font-size: 8.5px;
    }
    .tech-tags {
      font-size: 8.5px;
      color: #666;
      margin-top: 0.03in;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${contact.firstName || ""} ${contact.lastName || ""}</h1>
      <div class="contact-info">
        ${contact.city && contact.state ? `${contact.city}, ${contact.state} • ` : ""}
        ${contact.phone ? `${contact.phone} • ` : ""}
        ${contact.email || ""}
      </div>
    </header>

    ${
      data.professionalSummary && data.professionalSummary.trim()
        ? `
    <section>
      <h2>Professional Summary</h2>
      <p style="font-size: 9.5px; line-height: 1.3;">${data.professionalSummary}</p>
    </section>
    `
        : ""
    }

    ${
      data.workExperience && data.workExperience.length > 0 && data.workExperience.some((j: any) => j.jobTitle || j.company)
        ? `
    <section>
      <h2>Work Experience</h2>
      ${data.workExperience
        .filter((job: any) => job.jobTitle || job.company)
        .map(
          (job: any) => `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${job.jobTitle || ""}</div>
              <div class="entry-subtitle">${job.company || ""}</div>
            </div>
            <div class="entry-date">${job.current ? `${job.startDate} - Present` : `${job.startDate} - ${job.endDate}`}</div>
          </div>
          ${job.description ? `<div class="entry-description">${job.description}</div>` : ""}
        </div>
      `
        )
        .join("")}
    </section>
    `
        : ""
    }

    ${
      data.education && data.education.length > 0 && data.education.some((e: any) => e.school)
        ? `
    <section>
      <h2>Education</h2>
      ${data.education
        .filter((edu: any) => edu.school)
        .map(
          (edu: any) => `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${edu.school}</div>
              <div class="entry-subtitle">${[edu.degree, edu.field].filter(Boolean).join(" in ")}</div>
            </div>
            ${edu.graduationDate ? `<div class="entry-date">${edu.graduationDate}</div>` : ""}
          </div>
        </div>
      `
        )
        .join("")}
    </section>
    `
        : ""
    }

    ${
      data.skills && data.skills.length > 0
        ? `
    <section>
      <h2>Skills</h2>
      <div class="skills-container">
        ${data.skills
          .map((skill: any) => `<div class="skill-item">${skill.name} <span style="color: #999;">• ${skill.level}</span></div>`)
          .join("")}
      </div>
    </section>
    `
        : ""
    }

    ${
      data.projects && data.projects.length > 0 && data.projects.some((p: any) => p.title)
        ? `
    <section>
      <h2>Projects</h2>
      ${data.projects
        .filter((project: any) => project.title)
        .map(
          (project: any) => `
        <div class="entry">
          <div class="entry-header">
            <div class="entry-title">${project.title}</div>
            ${project.startDate && project.endDate ? `<div class="entry-date">${project.startDate} - ${project.endDate}</div>` : ""}
          </div>
          ${project.url ? `<div><a href="${project.url}" class="url">${project.url}</a></div>` : ""}
          ${project.technologies ? `<div class="tech-tags">Technologies: ${project.technologies}</div>` : ""}
          ${project.description ? `<div class="entry-description">${project.description}</div>` : ""}
        </div>
      `
        )
        .join("")}
    </section>
    `
        : ""
    }
  </div>
</body>
</html>
    `

    // Generate PDF using Puppeteer
    browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      printBackground: true,
    })

    // Set response headers for PDF download
    c.header("Content-Type", "application/pdf")
    c.header("Content-Disposition", `attachment; filename="${resume.name}.pdf"`)

    return c.body(pdfBuffer)
  } catch (error) {
    console.error("GET /resumes/:id/pdf error:", error)
    return c.json({ error: "Failed to generate PDF" }, 500)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
})

export default resumes
