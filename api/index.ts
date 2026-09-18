import { Sandbox } from "@vercel/sandbox";

export default async function handler(req: any, res: any) {

  const url = req.url || "/";

  console.log("CodeForge API:", req.method, url);

  // =========================
  // HEALTH CHECK
  // =========================
  if (
    req.method === "GET" &&
    url.includes("/api/health")
  ) {
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

  // =========================
  // LANGUAGES
  // =========================
  if (
    req.method === "GET" &&
    url.includes("/api/languages")
  ) {
    return res.status(200).json({
      languages: [
        "python",
        "javascript"
      ]
    });
  }

  // =========================
  // CODE EXECUTION
  // =========================
  if (req.method === "POST") {

    try {

      let body = req.body;

      // Vercel may provide body as a string
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({
            status: "error",
            error: "Invalid JSON request"
          });
        }
      }

      body = body || {};

      const language = String(body.language || "").toLowerCase();
      const code = body.code;
      const input = body.input || "";

      console.log("Language:", language);
      console.log("Code length:", code?.length || 0);

      // =========================
      // VALIDATE CODE
      // =========================
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

      // =========================
      // PYTHON
      // =========================
      if (
        language === "python" ||
        language === "py"
      ) {

        command = "python";

        args = [
          "-c",
          code
        ];

      }

      // =========================
      // JAVASCRIPT
      // =========================
      else if (
        language === "javascript" ||
        language === "js"
      ) {

        command = "node";

        args = [
          "-e",
          code
        ];

      }

      // =========================
      // UNSUPPORTED LANGUAGE
      // =========================
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

      // =========================
      // CREATE SANDBOX
      // =========================
      const sandbox = await Sandbox.create({
        persistent: false,
        timeout: 60 * 1000
      });

      console.log("Sandbox created");

      // =========================
      // RUN CODE
      // =========================
      const result = await sandbox.runCommand({
        cmd: command,
        args
      });

      const output = await result.stdout();
      const error = await result.stderr();

      const executionTime = Date.now() - start;

      console.log(
        "Exit code:",
        result.exitCode
      );

      // =========================
      // STOP SANDBOX
      // =========================
      await sandbox.stop();

      return res.status(200).json({

        status:
          result.exitCode === 0
            ? "success"
            : "runtime_error",

        output,

        error,

        executionTime,

        memoryUsageMB: 0,

        sandbox: "vercel"

      });

    } catch (error: any) {

      console.error(
        "Sandbox execution error:",
        error
      );

      return res.status(500).json({

        status: "system_error",

        output: "",

        error:
          error?.message ||
          "Sandbox execution failed",

        executionTime: 0,

        memoryUsageMB: 0,

        sandbox: "vercel"

      });

    }
  }

  // =========================
  // NOT FOUND
  // =========================
  return res.status(404).json({
    error: "Not found",
    path: url,
    method: req.method
  });
}