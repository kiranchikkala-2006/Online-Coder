export default function handler(req: any, res: any) {
  const url = req.url || "/";

  // Health check
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

  // Supported languages
  if (url.startsWith("/api/languages")) {
    return res.status(200).json({
      languages: [
        "javascript",
        "typescript",
        "python",
        "c",
        "cpp",
        "java",
        "go",
        "rust",
        "php",
        "kotlin"
      ]
    });
  }

  // Temporary run endpoint
  if (url.startsWith("/api/run")) {
    return res.status(501).json({
      status: "system_error",
      output: "",
      error: "Vercel Sandbox execution is not connected yet.",
      executionTime: 0,
      memoryUsageMB: 0,
      sandbox: "vercel"
    });
  }

  return res.status(404).json({
    error: "Not found"
  });
}