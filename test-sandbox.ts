import { Sandbox } from "@vercel/sandbox";

async function main() {
  console.log("Creating Vercel Sandbox...");

  const sandbox = await Sandbox.create({
    persistent: false,
    timeout: 60 * 1000,
  });

  console.log("Sandbox created!");

  const result = await sandbox.runCommand({
    cmd: "node",
    args: ["-e", 'console.log("Hello from Vercel Sandbox!")'],
  });

  console.log("Exit code:", result.exitCode);
  console.log("Output:", await result.stdout());
  console.log("Error:", await result.stderr());

  await sandbox.stop();

  console.log("Sandbox stopped.");
}

main().catch((error) => {
  console.error("Sandbox error:", error);
});