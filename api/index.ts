import express from "express";
import {
  SUPPORTED_LANGUAGES,
} from "../src/config/languages.ts";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    app: "CodeForge",
    version: "1.0.0",
    runtime: "Vercel",
    sandbox: "Vercel Sandbox",
    dockerAvailable: false,
    timestamp: new Date().toISOString(),
  });
});

// Languages
app.get("/api/languages", (_req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
  });
});

// Temporary run endpoint
app.post("/api/run", (_req, res) => {
  res.status(501).json({
    status: "system_error",
    output: "",
    error: "Vercel Sandbox execution is being configured.",
    executionTime: 0,
    memoryUsageMB: 0,
    sandbox: "vercel",
  });
});

export default app;