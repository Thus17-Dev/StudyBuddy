import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authRoutes } from "./routes/authRoutes.js";
import { subjectRoutes } from "./routes/subjectRoutes.js";
import { topicRoutes } from "./routes/topicRoutes.js";
import { taskRoutes } from "./routes/taskRoutes.js";
import { aiRoutes } from "./routes/aiRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "StudyBuddy.AI API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

if (process.env.NODE_ENV === "production") {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? "Something went wrong." : error.message
  });
});

app.listen(port, () => {
  console.log(`StudyBuddy.AI API running on http://localhost:${port}`);
});
