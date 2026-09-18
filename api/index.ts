import express from "express";
import { executeCode } from "../server/execution/sandboxRunner.ts";
import { isDockerAvailable } from "../server/execution/dockerEngine.ts";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_MAP,
} from "../src/config/languages.ts";
import { SupportedLanguageId } from "../src/types/index.ts";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", async (_req, res) => {
  let dockerAvailable = false;

  try {
    dockerAvailable = await isDockerAvailable();
  } catch {
    dockerAvailable = false;
  }

  res.json({
    status: "healthy",
    app: "CodeForge",
    version: "1.0.0",
    database: "none",
    dockerAvailable,
    timestamp: new Date().toISOString(),
  });
});

// Supported languages
app.get("/api/languages", (_req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
  });
});

// Run code
app.post("/api/run", async (req, res) => {
  try {
    const { language, code, input, files } = req.body;

    if (!language || typeof language !== "string") {
      return res.status(400).json({
        status: "system_error",
        output: "",
        error: 'Missing or invalid "language" parameter.',
        executionTime: 0,
        memoryUsageMB: 0,
        sandbox: "vercel",
      });
    }

    if (typeof code !== "string") {
      return res.status(400).json({
        status: "system_error",
        output: "",
        error: 'Missing or invalid "code" parameter.',
        executionTime: 0,
        memoryUsageMB: 0,
        sandbox: "vercel",
      });
    }

    if (!LANGUAGE_MAP.has(language as SupportedLanguageId)) {
      return res.status(400).json({
        status: "system_error",
        output: "",
        error: `Unsupported language: "${language}".`,
        executionTime: 0,
        memoryUsageMB: 0,
        sandbox: "vercel",
      });
    }

    const result = await executeCode(
      language as SupportedLanguageId,
      code,
      typeof input === "string" ? input : "",
      Array.isArray(files) ? files : undefined
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Execution error:", error);

    return res.status(500).json({
      status: "system_error",
      output: "",
      error: error?.message || "Unknown server error",
      executionTime: 0,
      memoryUsageMB: 0,
      sandbox: "vercel",
    });
  }
});

export default app;