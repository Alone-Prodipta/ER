import express from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { authSessions, diagrams, users } from "../db/schema.ts";
import { hashPassword, verifyPassword } from "./passwords.ts";
import { clearSessionCookie, hashSessionToken, readSessionToken, requireAuth, startSession } from "./auth.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Keep the response shape the frontend already expects (Mongo-style `_id`).
function serializeDiagram(diagram) {
  const { id, ownerId: _ownerId, ...rest } = diagram;
  return { _id: id, ...rest };
}

const publicUser = (user) => ({ id: user.id, email: user.email });
const readCredentials = (body) => ({
  email: typeof body?.email === "string" ? body.email.trim().toLowerCase() : "",
  password: typeof body?.password === "string" ? body.password : "",
});

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.get("/api/health", async (_req, res) => {
  try {
    await db.select({ id: users.id }).from(users).limit(1);
    res.json({ success: true, status: "connected" });
  } catch {
    res.status(503).json({ success: false, status: "disconnected" });
  }
});

// ---- Auth ----
const auth = express.Router();

auth.post("/register", async (req, res, next) => {
  try {
    const { email, password } = readCredentials(req.body);
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return res.status(400).json({ success: false, error: "Enter a valid email address." });
    }
    if (password.length !== 5) {
      return res.status(400).json({ success: false, error: "Password must be exactly 5 characters." });
    }
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash: await hashPassword(password) })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id, email: users.email });
    if (!user) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }
    await startSession(user.id, res);
    return res.status(201).json({ success: true, user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

auth.post("/login", async (req, res, next) => {
  try {
    const { email, password } = readCredentials(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: "Email or password is incorrect." });
    }
    await startSession(user.id, res);
    return res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

auth.post("/logout", async (req, res, next) => {
  try {
    const token = readSessionToken(req);
    if (token) await db.delete(authSessions).where(eq(authSessions.tokenHash, hashSessionToken(token)));
    clearSessionCookie(res);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

auth.get("/me", requireAuth, (req, res) => res.json({ success: true, user: publicUser(req.user) }));

// ---- Diagrams ----
const diagramRoutes = express.Router();
diagramRoutes.use(requireAuth);

diagramRoutes.post("/save", async (req, res, next) => {
  try {
    const { id, title, nodes, edges, viewport } = req.body ?? {};
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, error: "title must be a non-empty string." });
    }
    if (title.trim().length > 120) {
      return res.status(400).json({ success: false, error: "title must be 120 characters or fewer." });
    }
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ success: false, error: "nodes and edges must be arrays." });
    }
    if (viewport !== undefined && (
      !viewport || typeof viewport !== "object" ||
      !Number.isFinite(viewport.x) || !Number.isFinite(viewport.y) ||
      !Number.isFinite(viewport.zoom) || viewport.zoom <= 0
    )) {
      return res.status(400).json({ success: false, error: "viewport must contain finite x, y, and positive zoom values." });
    }
    if (id && (typeof id !== "string" || !UUID_PATTERN.test(id))) {
      return res.status(400).json({ success: false, error: "id must be a valid diagram ID." });
    }

    const values = { title: title.trim(), nodes, edges, ...(viewport ? { viewport } : {}) };
    const [diagram] = id
      ? await db
          .update(diagrams)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(diagrams.id, id), eq(diagrams.ownerId, req.user.id)))
          .returning()
      : await db.insert(diagrams).values({ ...values, ownerId: req.user.id }).returning();
    if (!diagram) return res.status(404).json({ success: false, error: "Diagram not found." });
    return res.json({ success: true, diagram: serializeDiagram(diagram) });
  } catch (error) {
    return next(error);
  }
});

diagramRoutes.get("/", async (req, res, next) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const rows = await db
      .select({
        id: diagrams.id,
        title: diagrams.title,
        viewport: diagrams.viewport,
        createdAt: diagrams.createdAt,
        updatedAt: diagrams.updatedAt,
      })
      .from(diagrams)
      .where(eq(diagrams.ownerId, req.user.id))
      .orderBy(desc(diagrams.updatedAt))
      .limit(limit);
    return res.json({ success: true, diagrams: rows.map(serializeDiagram) });
  } catch (error) {
    return next(error);
  }
});

diagramRoutes.get("/:id", async (req, res, next) => {
  try {
    if (!UUID_PATTERN.test(req.params.id)) {
      return res.status(400).json({ success: false, error: "id must be a valid diagram ID." });
    }
    const [diagram] = await db
      .select()
      .from(diagrams)
      .where(and(eq(diagrams.id, req.params.id), eq(diagrams.ownerId, req.user.id)))
      .limit(1);
    if (!diagram) return res.status(404).json({ success: false, error: "Diagram not found." });
    return res.json({ success: true, diagram: serializeDiagram(diagram) });
  } catch (error) {
    return next(error);
  }
});

diagramRoutes.delete("/:id", async (req, res, next) => {
  try {
    if (!UUID_PATTERN.test(req.params.id)) {
      return res.status(400).json({ success: false, error: "id must be a valid diagram ID." });
    }
    const deleted = await db
      .delete(diagrams)
      .where(and(eq(diagrams.id, req.params.id), eq(diagrams.ownerId, req.user.id)))
      .returning({ id: diagrams.id });
    if (!deleted.length) return res.status(404).json({ success: false, error: "Diagram not found." });
    return res.json({ success: true, message: "Diagram deleted." });
  } catch (error) {
    return next(error);
  }
});

app.use("/api/auth", auth);
app.use("/api/diagrams", diagramRoutes);
app.use((req, res) => res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` }));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ success: false, error: "Request body must contain valid JSON." });
  }
  return res.status(500).json({ success: false, error: "An unexpected server error occurred." });
});

export default app;
