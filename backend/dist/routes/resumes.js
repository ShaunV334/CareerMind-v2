import { Hono } from "hono";
import { getDb, connect } from "../db.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import PDFDocument from "pdfkit";
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
const resumes = new Hono();
resumes.use(async (c, next) => {
    await connect();
    await next();
});
// GET /api/resumes - Get all resumes for user
resumes.get("/", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const db = getDb();
        const resumesCollection = db.collection("resumes");
        const userResumes = await resumesCollection
            .find({ userId: auth.user.userId })
            .sort({ createdAt: -1 })
            .toArray();
        // Convert ObjectId to string for frontend
        const formattedResumes = userResumes.map((resume) => ({
            ...resume,
            id: resume._id.toString(),
        }));
        return c.json({ resumes: formattedResumes });
    }
    catch (error) {
        console.error("GET /resumes error:", error);
        return c.json({ error: "Failed to fetch resumes" }, 500);
    }
});
// POST /api/resumes - Create new resume
resumes.post("/", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const body = await c.req.json();
        const { name, data } = body;
        if (!name) {
            return c.json({ error: "Resume name is required" }, 400);
        }
        const db = getDb();
        const resumesCollection = db.collection("resumes");
        const newResume = {
            userId: auth.user.userId,
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
        };
        const result = await resumesCollection.insertOne(newResume);
        return c.json({
            id: result.insertedId.toString(),
            _id: result.insertedId,
            userId: auth.user.userId,
            name,
            data: newResume.data,
            createdAt: newResume.createdAt,
            updatedAt: newResume.updatedAt,
        });
    }
    catch (error) {
        console.error("POST /resumes error:", error);
        return c.json({ error: "Failed to create resume" }, 500);
    }
});
// PUT /api/resumes/:id - Update resume data
resumes.put("/:id", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const resumeId = c.req.param("id");
        const body = await c.req.json();
        const { name, data } = body;
        const db = getDb();
        const resumesCollection = db.collection("resumes");
        // Verify ownership
        const resume = await resumesCollection.findOne({
            _id: new ObjectId(resumeId),
            userId: auth.user.userId,
        });
        if (!resume) {
            return c.json({ error: "Resume not found" }, 404);
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (name)
            updateData.name = name;
        if (data)
            updateData.data = data;
        const result = await resumesCollection.findOneAndUpdate({ _id: new ObjectId(resumeId) }, { $set: updateData }, { returnDocument: "after" });
        if (!result.value) {
            return c.json({ error: "Resume not found" }, 404);
        }
        return c.json({
            ...result.value,
            id: result.value._id.toString(),
        });
    }
    catch (error) {
        console.error("PUT /resumes/:id error:", error);
        return c.json({ error: "Failed to update resume" }, 500);
    }
});
// DELETE /api/resumes/:id - Delete resume
resumes.delete("/:id", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const resumeId = c.req.param("id");
        const db = getDb();
        const resumesCollection = db.collection("resumes");
        // Verify ownership before deleting
        const resume = await resumesCollection.findOne({
            _id: new ObjectId(resumeId),
            userId: auth.user.userId,
        });
        if (!resume) {
            return c.json({ error: "Resume not found" }, 404);
        }
        const result = await resumesCollection.deleteOne({
            _id: new ObjectId(resumeId),
        });
        return c.json({ ok: result.deletedCount === 1 });
    }
    catch (error) {
        console.error("DELETE /resumes/:id error:", error);
        return c.json({ error: "Failed to delete resume" }, 500);
    }
});
// GET /api/resumes/:id/pdf - Generate PDF
resumes.get("/:id/pdf", async (c) => {
    try {
        const auth = await verifyAuth(c);
        if (auth.error)
            return c.json({ error: auth.error }, 401);
        const resumeId = c.req.param("id");
        const db = getDb();
        const resumesCollection = db.collection("resumes");
        const resume = await resumesCollection.findOne({
            _id: new ObjectId(resumeId),
            userId: auth.user.userId,
        });
        if (!resume) {
            return c.json({ error: "Resume not found" }, 404);
        }
        // Generate PDF using pdfkit
        const doc = new PDFDocument();
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        const data = resume.data || {};
        const contact = data.contactInfo || {};
        // Title
        doc.fontSize(24).font("Helvetica-Bold");
        doc.text(`${contact.firstName} ${contact.lastName}`, { align: "center" });
        // Contact info
        doc.fontSize(10).font("Helvetica");
        const contactLines = [
            contact.email,
            contact.phone,
            contact.city && contact.state ? `${contact.city}, ${contact.state}` : "",
        ]
            .filter(Boolean)
            .join(" | ");
        if (contactLines) {
            doc.text(contactLines, { align: "center" });
        }
        doc.moveDown();
        // Professional Summary
        if (data.professionalSummary) {
            doc.fontSize(12).font("Helvetica-Bold").text("PROFESSIONAL SUMMARY");
            doc.fontSize(10).font("Helvetica");
            doc.text(data.professionalSummary, { width: 500 });
            doc.moveDown();
        }
        // Work Experience
        if (data.workExperience && data.workExperience.length > 0) {
            doc.fontSize(12).font("Helvetica-Bold").text("WORK EXPERIENCE");
            doc.fontSize(10).font("Helvetica");
            for (const job of data.workExperience) {
                doc.font("Helvetica-Bold").text(job.jobTitle || "");
                doc.font("Helvetica").text(job.company || "");
                const dateRange = job.current
                    ? `${job.startDate} - Present`
                    : `${job.startDate} - ${job.endDate}`;
                doc.fontSize(9).text(dateRange);
                doc.fontSize(10);
                if (job.description) {
                    doc.text(job.description, { width: 500 });
                }
                doc.moveDown(0.5);
            }
            doc.moveDown();
        }
        // Education
        if (data.education && data.education.length > 0) {
            doc.fontSize(12).font("Helvetica-Bold").text("EDUCATION");
            doc.fontSize(10).font("Helvetica");
            for (const edu of data.education) {
                doc.font("Helvetica-Bold").text(edu.school || "");
                doc.font("Helvetica").text(`${edu.degree} in ${edu.field || ""}`);
                if (edu.graduationDate) {
                    doc.fontSize(9).text(`Graduated: ${edu.graduationDate}`);
                }
                doc.fontSize(10);
                doc.moveDown(0.5);
            }
            doc.moveDown();
        }
        // Skills
        if (data.skills && data.skills.length > 0) {
            doc.fontSize(12).font("Helvetica-Bold").text("SKILLS");
            doc.fontSize(10).font("Helvetica");
            const skills = data.skills
                .map((s) => `${s.name} (${s.level})`)
                .join(" • ");
            doc.text(skills, { width: 500 });
            doc.moveDown();
        }
        // Projects
        if (data.projects && data.projects.length > 0) {
            doc.fontSize(12).font("Helvetica-Bold").text("PROJECTS");
            doc.fontSize(10).font("Helvetica");
            for (const project of data.projects) {
                doc.font("Helvetica-Bold").text(project.title || "");
                if (project.url) {
                    doc.fontSize(9).text(project.url);
                }
                if (project.technologies) {
                    doc.fontSize(9).text(`Technologies: ${project.technologies}`);
                }
                doc.fontSize(10);
                if (project.description) {
                    doc.text(project.description, { width: 500 });
                }
                doc.moveDown(0.5);
            }
        }
        // End document
        doc.end();
        // Wait for document to finish
        await new Promise((resolve) => {
            doc.on("end", resolve);
        });
        const pdfBuffer = Buffer.concat(chunks);
        // Set response headers for PDF download
        c.header("Content-Type", "application/pdf");
        c.header("Content-Disposition", `attachment; filename="${resume.name}.pdf"`);
        return c.body(pdfBuffer);
    }
    catch (error) {
        console.error("GET /resumes/:id/pdf error:", error);
        return c.json({ error: "Failed to generate PDF" }, 500);
    }
});
export default resumes;
