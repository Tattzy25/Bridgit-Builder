import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  createSession,
  updateSession,
  getSession,
  getUserSessions,
  deleteSession,
} from "./routes/sessions";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Session tracking endpoints
  app.post("/api/sessions", createSession);
  app.patch("/api/sessions/:sessionId", updateSession);
  app.get("/api/sessions/:sessionId", getSession);
  app.get("/api/users/:userId/sessions", getUserSessions);
  app.delete("/api/sessions/:sessionId", deleteSession);

  return app;
}
