import { Sandbox } from "@vercel/sandbox";

type Language =
  | "python"
  | "cpp"
  | "c"
  | "java"
  | "javascript"
  | "typescript"
  | "go"
  | "rust"
  | "kotlin"
  | "php";

const MAX_OUTPUT = 20000;

function limitOutput(value: string): string {
  if (!value) return "";

  if (value.length <= MAX_OUTPUT) {
    return value;
  }

  return (
    value.slice(0, MAX_OUTPUT) +
    "\n\n[Output truncated: maximum output limit reached]"
  );
}

function packageForLanguage(language: Language): string | null {
  switch (language) {
    case "java":
      return "openjdk-17-jdk-headless";

    case "c":
      return "gcc";

    case "cpp":
      return "g++";

    case "go":
      return "golang-go";

    case "rust":
      return "rustc";

    case "kotlin":
      return "kotlin";

    case "php":
      return "php-cli";

    default:
      return null;
  }
}

function executableForLanguage(language: Language): string | null {
  switch (language) {
    case "java":
      return "javac";

    case "c":
      return "gcc";

    case "cpp":
      return "g++";

    case "go":
      return "go";

    case "rust":
      return "rustc";

    case "kotlin":
      return "kotlinc";

    case "php":
      return "php";

    default:
      return null;
  }
}

function sourceFileForLanguage(language: Language): string {
  switch (language) {
    case "python":
      return "main.py";

    case "javascript":
      return "main.js";

    case "typescript":
      return "main.ts";

    case "cpp":
      return "main.cpp";

    case "c":
      return "main.c";

    case "java":
      return "Main.java";

    case "go":
      return "main.go";

    case "rust":
      return "main.rs";

    case "kotlin":
      return "Main.kt";

    case "php":
      return "index.php";

    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

function executionScript(language: Language): string {
  switch (language) {
    case "python":
      return `
python3 main.py < /tmp/codeforge-input.txt
`;

    case "javascript":
      return `
node main.js < /tmp/codeforge-input.txt
`;

    case "typescript":
      return `
node main.ts < /tmp/codeforge-input.txt
`;

    case "c":
      return `
gcc -O2 -std=c11 main.c -o program &&
./program < /tmp/codeforge-input.txt
`;

    case "cpp":
      return `
g++ -O2 -std=c++17 main.cpp -o program &&
./program < /tmp/codeforge-input.txt
`;

    case "java":
      return `
javac Main.java &&
java Main < /tmp/codeforge-input.txt
`;

    case "go":
      return `
go build -o program main.go &&
./program < /tmp/codeforge-input.txt
`;

    case "rust":
      return `
rustc -O main.rs -o program &&
./program < /tmp/codeforge-input.txt
`;

    case "kotlin":
      return `
kotlinc Main.kt -include-runtime -d Main.jar &&
java -jar Main.jar < /tmp/codeforge-input.txt
`;

    case "php":
      return `
php index.php < /tmp/codeforge-input.txt
`;

    default:
      throw new Error(`Language '${language}' is not supported`);
  }
}

export default async function handler(req: any, res: any) {
  const url = req.url || "/";

  console.log(
    "CodeForge API:",
    req.method,
    url
  );

  // =========================================================
  // HEALTH CHECK
  // =========================================================

  if (
    req.method === "GET" &&
    url.includes("/api/health")
  ) {
    return res.status(200).json({
      status: "healthy",
      app: "CodeForge",
      version: "2.0.0",
      runtime: "Vercel",
      sandbox: "Vercel Sandbox",
      supportedLanguages: [
        "python",
        "cpp",
        "c",
        "java",
        "javascript",
        "typescript",
        "go",
        "rust",
        "kotlin",
        "php",
      ],
      timestamp: new Date().toISOString(),
    });
  }

  // =========================================================
  // LANGUAGES
  // =========================================================

  if (
    req.method === "GET" &&
    url.includes("/api/languages")
  ) {
    return res.status(200).json({
      languages: [
        "python",
        "cpp",
        "c",
        "java",
        "javascript",
        "typescript",
        "go",
        "rust",
        "kotlin",
        "php",
      ],
    });
  }

  // =========================================================
  // ONLY POST FOR CODE EXECUTION
  // =========================================================

  if (req.method !== "POST") {
    return res.status(404).json({
      status: "error",
      error: "Not found",
      path: url,
      method: req.method,
    });
  }

  let sandbox: Sandbox | null = null;

  try {
    // =======================================================
    // REQUEST BODY
    // =======================================================

    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          status: "error",
          error: "Invalid JSON request",
        });
      }
    }

    body = body || {};

    // =======================================================
    // INPUT VALUES
    // =======================================================

    const language = String(
      body.language || ""
    )
      .toLowerCase()
      .trim() as Language;

    const code = body.code;

    const input =
      typeof body.input === "string"
        ? body.input
        : "";

    console.log(
      "Language:",
      language
    );

    console.log(
      "Code length:",
      typeof code === "string"
        ? code.length
        : 0
    );

    // =======================================================
    // SUPPORTED LANGUAGES
    // =======================================================

    const supportedLanguages: Language[] = [
      "python",
      "cpp",
      "c",
      "java",
      "javascript",
      "typescript",
      "go",
      "rust",
      "kotlin",
      "php",
    ];

    if (
      !supportedLanguages.includes(language)
    ) {
      return res.status(400).json({
        status: "error",
        output: "",
        error:
          `Language '${language}' is not supported.`,
        executionTime: 0,
        memoryUsageMB: 0,
      });
    }

    // =======================================================
    // CODE VALIDATION
    // =======================================================

    if (
      typeof code !== "string" ||
      !code.trim()
    ) {
      return res.status(400).json({
        status: "error",
        output: "",
        error: "Code is required.",
        executionTime: 0,
        memoryUsageMB: 0,
      });
    }

    // =======================================================
    // CREATE SANDBOX
    // =======================================================

    const start = Date.now();

    sandbox = await Sandbox.create({
      persistent: false,
      timeout: 180 * 1000,
    });

    console.log(
      "Sandbox created:",
      sandbox.name
    );

    // =======================================================
    // SOURCE FILE
    // =======================================================

    const sourceFile =
      sourceFileForLanguage(language);

    await sandbox.writeFiles([
      {
        path:
          `/vercel/sandbox/${sourceFile}`,
        content:
          Buffer.from(code),
      },
      {
        path:
          "/tmp/codeforge-input.txt",
        content:
          Buffer.from(input),
      },
    ]);

    console.log(
      "Source file written:",
      sourceFile
    );

    // =======================================================
    // INSTALL COMPILER IF NEEDED
    // =======================================================

    const packageName =
      packageForLanguage(language);

    const executable =
      executableForLanguage(language);

    if (
      packageName &&
      executable
    ) {
      console.log(
        `Checking compiler: ${executable}`
      );

      const check =
        await sandbox.runCommand({
          cmd: "bash",
          args: [
            "-lc",
            `command -v ${executable}`,
          ],
        });

      if (
        check.exitCode !== 0
      ) {
        console.log(
          `Installing ${packageName}...`
        );

        const update =
          await sandbox.runCommand({
            cmd: "apt-get",
            args: [
              "update",
              "-qq",
            ],
            sudo: true,
          });

        if (
          update.exitCode !== 0
        ) {
          const updateError =
            await update.stderr();

          throw new Error(
            `Package manager update failed: ${updateError}`
          );
        }

        const install =
          await sandbox.runCommand({
            cmd: "apt-get",
            args: [
              "install",
              "-y",
              "-qq",
              packageName,
            ],
            sudo: true,
          });

        if (
          install.exitCode !== 0
        ) {
          const installError =
            await install.stderr();

          throw new Error(
            `Failed to install ${packageName}: ${installError}`
          );
        }

        console.log(
          `Installed ${packageName}`
        );
      }
    }

    // =======================================================
    // EXECUTE PROGRAM
    // =======================================================

    const script =
      executionScript(language);

    console.log(
      "Execution script:",
      script
    );

    const result =
      await sandbox.runCommand({
        cmd: "bash",
        args: [
          "-lc",
          `cd /vercel/sandbox && ${script}`,
        ],
      });

    const output =
      await result.stdout();

    const error =
      await result.stderr();

    const executionTime =
      Date.now() - start;

    console.log(
      "Exit code:",
      result.exitCode
    );

    console.log(
      "Execution time:",
      executionTime,
      "ms"
    );

    // =======================================================
    // RESPONSE
    // =======================================================

    return res.status(200).json({
      status:
        result.exitCode === 0
          ? "success"
          : "runtime_error",

      output:
        limitOutput(output),

      error:
        limitOutput(error),

      executionTime,

      memoryUsageMB: 0,

      exitCode:
        result.exitCode,

      sandbox: "vercel",

      language,
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
        "Sandbox execution failed.",
      executionTime: 0,
      memoryUsageMB: 0,
      sandbox: "vercel",
    });

  } finally {
    // =======================================================
    // STOP SANDBOX
    // =======================================================

    if (sandbox) {
      try {
        await sandbox.stop();

        console.log(
          "Sandbox stopped."
        );

      } catch (stopError) {
        console.error(
          "Sandbox stop error:",
          stopError
        );
      }
    }
  }
}