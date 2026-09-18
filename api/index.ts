import { Sandbox } from "@vercel/sandbox";

export default async function handler(req: any, res: any) {
  const url = req.url || "/";

  // -----------------------------
  // HEALTH
  // -----------------------------
  if (url.startsWith("/api/health")) {
    return res.status(200).json({
      status: "healthy",
      app: "CodeForge",
      version: "1.0.0",
      runtime: "Vercel",
      sandbox: "Vercel Sandbox",
      dockerAvailable: false,
      timestamp: new Date().toISOString()
    });
  }

  // -----------------------------
  // LANGUAGES
  // -----------------------------
  if (url.startsWith("/api/languages")) {
    return res.status(200).json({
      languages: [
        "python",
        "javascript"
      ]
    });
  }

  // -----------------------------
  // RUN CODE
  // -----------------------------
  if (url.startsWith("/api/run")) {
    if (req.method !== "POST") {
      return res.status(405).json({
        status: "error",
        error: "POST required"
      });
    }

    try {
      const {
        language,
        code,
        input = ""
      } = req.body || {};

      if (!code || typeof code !== "string") {
        return res.status(400).json({
          status: "error",
          output: "",
          error: "Code is required",
          executionTime: 0,
          memoryUsageMB: 0
        });
      }

      let command: string;
      let args: string[];

      // -----------------------------
      // PYTHON
      // -----------------------------
      if (language === "python" || language === "py") {
        command = "python";
        args = ["-c", code];
      }

      // -----------------------------
      // JAVASCRIPT
      // -----------------------------
      else if (
        language === "javascript" ||
        language === "js"
      ) {
        command = "node";
        args = ["-e", code];
      }

      else {
        return res.status(400).json({
          status: "error",
          output: "",
          error: `Language '${language}' is not supported yet`,
          executionTime: 0,
          memoryUsageMB: 0
        });
      }

      const start = Date.now();

      // Create isolated sandbox
      const sandbox = await Sandbox.create({
        persistent: false,
        timeout: 60 * 1000
      });

      // Execute code
      const result = await sandbox.runCommand({
        cmd: command,
        args
      });

      const output = await result.stdout();
      const error = await result.stderr();

      const executionTime = Date.now() - start;

      await sandbox.stop();

      return res.status(200).json({
        status: result.exitCode === 0 ? "success" : "runtime_error",
        output,
        error,
        executionTime,
        memoryUsageMB: 0,
        sandbox: "vercel"
      });

    } catch (error: any) {
      console.error("Sandbox execution error:", error);

      return res.status(500).json({
        status: "system_error",
        output: "",
        error: error?.message || "Sandbox execution failed",
        executionTime: 0,
        memoryUsageMB: 0,
        sandbox: "vercel"
      });
    }
  }

  return res.status(404).json({
    error: "Not found"
  });
}