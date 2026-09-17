import { spawn, exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { SupportedLanguageId } from '../../src/types/index.ts';
import { checkHostBinary } from './compilerInstaller.ts';
import { executeInCloudSandbox } from './cloudCompiler.ts';
import { isDockerAvailable } from './dockerEngine.ts';
import { NODE_CLI_POLYFILL_CODE } from './promptPolyfill.ts';

export interface InteractiveSessionEvent {
  type: 'stdout' | 'stderr' | 'exit' | 'error';
  data?: string;
  code?: number;
  executionTime?: number;
}

interface ActiveSession {
  id: string;
  child: any;
  tempDir: string;
  buffer: InteractiveSessionEvent[];
  listeners: ((event: InteractiveSessionEvent) => void)[];
  isExited: boolean;
  exitCode: number | null;
  overallTimer: NodeJS.Timeout;
  inactivityTimer: NodeJS.Timeout;
  startTime: bigint;
  mode: 'interactive' | 'batch';
  isCloud?: boolean;
  accumulatedStdin?: string;
}

const sessions = new Map<string, ActiveSession>();

// Configurable timeouts (in milliseconds)
// 1. Overall execution timeout (default: 2m 30s / 150s = 150000ms) - prevents runaway infinite loops
const OVERALL_TIMEOUT_MS = parseInt(process.env.EXECUTION_TIMEOUT_MS || '150000', 10);
// 2. Interactive input inactivity timeout (default: 2m 30s / 150s = 150000ms) - refreshed on every user input
const INACTIVITY_TIMEOUT_MS = parseInt(process.env.INACTIVITY_TIMEOUT_MS || '150000', 10);

function formatTimeoutDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes > 0 && seconds > 0) {
    return `${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${totalSec}s`;
}

function cleanKotlinStderr(raw: string): string {
  if (!raw) return '';
  return raw
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('OpenJDK 64-Bit Server VM warning:')) return false;
      if (trimmed.includes('Options -Xverify:none and -noverify were deprecated')) return false;
      return true;
    })
    .join('\n')
    .trim();
}

async function runCommandSync(
  cmd: string,
  args: string[],
  cwd: string,
  extraEnv?: NodeJS.ProcessEnv
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const localBin = path.join(process.cwd(), 'node_modules', '.bin');
    const systemPath = process.env.PATH || '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
    const child = spawn(cmd, args, {
      cwd,
      env: {
        ...process.env,
        PATH: `${localBin}:${systemPath}`,
        GOCACHE: '/tmp/gocache',
        GOPATH: '/tmp/gopath',
        HOME: '/tmp',
        ...extraEnv,
      },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      resolve({ code: code ?? 0, stdout, stderr });
    });
    child.on('error', (err) => {
      resolve({ code: 1, stdout, stderr: err.message });
    });
  });
}

async function spawnCloudSession(
  sessionId: string,
  language: SupportedLanguageId,
  code: string,
  tempDir: string,
  input: string = ''
): Promise<{ sessionId: string }> {
  const startTime = process.hrtime.bigint();

  const session: ActiveSession = {
    id: sessionId,
    child: null,
    tempDir,
    buffer: [],
    listeners: [],
    isExited: false,
    exitCode: null,
    overallTimer: setTimeout(() => {
      killSession(sessionId, 124);
    }, OVERALL_TIMEOUT_MS),
    inactivityTimer: setTimeout(() => {
      killSession(sessionId, 124);
    }, INACTIVITY_TIMEOUT_MS),
    startTime,
    mode: 'batch',
    isCloud: true,
    accumulatedStdin: input || '',
  };

  sessions.set(sessionId, session);

  (async () => {
    try {
      const res = await executeInCloudSandbox(language, code, session.accumulatedStdin || '');

      if (res.stdout) {
        const outEvent: InteractiveSessionEvent = { type: 'stdout', data: res.stdout };
        session.buffer.push(outEvent);
        session.listeners.forEach((fn) => fn(outEvent));
      }

      if (res.stderr) {
        const errEvent: InteractiveSessionEvent = { type: 'stderr', data: res.stderr };
        session.buffer.push(errEvent);
        session.listeners.forEach((fn) => fn(errEvent));
      }

      if (res.compileOutput && !res.stderr?.includes(res.compileOutput)) {
        const compEvent: InteractiveSessionEvent = { type: 'stderr', data: res.compileOutput };
        session.buffer.push(compEvent);
        session.listeners.forEach((fn) => fn(compEvent));
      }

      const banner =
        res.exitCode === 0
          ? '\n=== Code Execution Successful ===\n'
          : `\n=== Code Execution Failed (exit code: ${res.exitCode}) ===\n`;

      const bannerEvent: InteractiveSessionEvent = {
        type: res.exitCode === 0 ? 'stdout' : 'stderr',
        data: banner,
      };
      session.buffer.push(bannerEvent);
      session.listeners.forEach((fn) => fn(bannerEvent));

      const exitEvent: InteractiveSessionEvent = {
        type: 'exit',
        code: res.exitCode,
        executionTime: Math.round(res.executionTime * 100) / 100,
      };
      session.isExited = true;
      session.exitCode = res.exitCode;
      session.buffer.push(exitEvent);
      session.listeners.forEach((fn) => fn(exitEvent));
      clearTimeout(session.overallTimer);
      clearTimeout(session.inactivityTimer);

      setTimeout(() => {
        fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        sessions.delete(sessionId);
      }, 5000);
    } catch (err: any) {
      const errEvent: InteractiveSessionEvent = {
        type: 'stderr',
        data: `Execution error: ${err.message || 'Unknown error'}\n`,
      };
      session.buffer.push(errEvent);
      session.listeners.forEach((fn) => fn(errEvent));
      const exitEvent: InteractiveSessionEvent = {
        type: 'exit',
        code: 1,
        executionTime: 0,
      };
      session.isExited = true;
      session.exitCode = 1;
      session.buffer.push(exitEvent);
      session.listeners.forEach((fn) => fn(exitEvent));
      clearTimeout(session.overallTimer);
      clearTimeout(session.inactivityTimer);
    }
  })();

  return { sessionId };
}

export async function spawnInteractiveSession(
  language: SupportedLanguageId,
  code: string,
  input: string = '',
  mode: 'interactive' | 'batch' = 'interactive',
  files?: Array<{ name: string; content: string }>
): Promise<{ sessionId: string; error?: string }> {
  const sessionId = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), 'codeforge_interactive', sessionId);
  await fs.mkdir(tempDir, { recursive: true });

  if (files && Array.isArray(files)) {
    for (const f of files) {
      if (f.name && typeof f.content === 'string') {
        const safeName = path.basename(f.name);
        if (safeName) {
          await fs.writeFile(path.join(tempDir, safeName), f.content, 'utf-8');
        }
      }
    }
  }

  let spawnCmd = '';
  let spawnArgs: string[] = [];

  try {
    if (language === 'python') {
      const hasPy = (await checkHostBinary('python3')) || (await checkHostBinary('python'));
      if (!hasPy) {
        return spawnCloudSession(sessionId, language, code, tempDir, input);
      }
      const filePath = path.join(tempDir, 'main.py');
      await fs.writeFile(filePath, code, 'utf-8');
      spawnCmd = 'python3';
      spawnArgs = ['-u', 'main.py'];
    } else if (language === 'javascript') {
      const polyfillFile = path.join(tempDir, 'prompt_polyfill.cjs');
      await fs.writeFile(polyfillFile, NODE_CLI_POLYFILL_CODE, 'utf-8');
      const filePath = path.join(tempDir, 'main.js');
      await fs.writeFile(filePath, code, 'utf-8');
      spawnCmd = 'node';
      spawnArgs = ['-r', './prompt_polyfill.cjs', 'main.js'];
    } else if (language === 'typescript') {
      const polyfillFile = path.join(tempDir, 'prompt_polyfill.cjs');
      await fs.writeFile(polyfillFile, NODE_CLI_POLYFILL_CODE, 'utf-8');
      const filePath = path.join(tempDir, 'main.ts');
      await fs.writeFile(filePath, code, 'utf-8');
      const localTsx = path.join(process.cwd(), 'node_modules', '.bin', 'tsx');
      const hasLocalTsx = await fs.stat(localTsx).then(() => true).catch(() => false);
      const hasTsx = hasLocalTsx || (await checkHostBinary('tsx'));
      if (hasLocalTsx) {
        spawnCmd = localTsx;
        spawnArgs = ['-r', './prompt_polyfill.cjs', 'main.ts'];
      } else if (hasTsx) {
        spawnCmd = 'tsx';
        spawnArgs = ['-r', './prompt_polyfill.cjs', 'main.ts'];
      } else {
        spawnCmd = 'npx';
        spawnArgs = ['tsx', '-r', './prompt_polyfill.cjs', 'main.ts'];
      }
    } else if (language === 'c' || language === 'cpp') {
      const isCpp = language === 'cpp';
      const compiler = isCpp ? 'g++' : 'gcc';
      const hasComp = await checkHostBinary(compiler);
      if (!hasComp) {
        return spawnCloudSession(sessionId, language, code, tempDir, input);
      }
      const filename = isCpp ? 'main.cpp' : 'main.c';
      const filePath = path.join(tempDir, filename);
      await fs.writeFile(filePath, code, 'utf-8');

      const compArgs = isCpp
        ? ['-O2', '-std=c++17', 'main.cpp', '-o', 'program']
        : ['-O2', 'main.c', '-o', 'program'];

      const compResult = await runCommandSync(compiler, compArgs, tempDir);
      if (compResult.code !== 0) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        return { sessionId, error: compResult.stderr || 'Compilation failed' };
      }

      const hasStdbuf = await checkHostBinary('stdbuf');
      spawnCmd = hasStdbuf ? 'stdbuf' : './program';
      spawnArgs = hasStdbuf ? ['-o0', '-e0', './program'] : [];
    } else if (language === 'java') {
      const hasJavac = await checkHostBinary('javac');
      const hasJava = await checkHostBinary('java');
      if (!hasJavac || !hasJava) {
        return spawnCloudSession(sessionId, language, code, tempDir, input);
      }

      // Find public class or default class name
      const publicClassMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const anyClassMatch = code.match(/class\s+([A-Za-z0-9_]+)/);
      const className = publicClassMatch ? publicClassMatch[1] : (anyClassMatch ? anyClassMatch[1] : 'Main');

      const filename = `${className}.java`;
      const filePath = path.join(tempDir, filename);
      await fs.writeFile(filePath, code, 'utf-8');

      const compResult = await runCommandSync('javac', [filename], tempDir);
      if (compResult.code !== 0) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        return { sessionId, error: cleanKotlinStderr(compResult.stderr) || 'Java compilation failed' };
      }

      spawnCmd = 'java';
      spawnArgs = ['-Dfile.encoding=UTF-8', className];
    } else if (language === 'go') {
      const hasGo = await checkHostBinary('go');
      if (!hasGo) {
        return spawnCloudSession(sessionId, language, code, tempDir, input);
      }
      let goCode = code;
      if (!/package\s+[a-zA-Z0-9_]+/.test(goCode)) {
        goCode = `package main\n\n${goCode}`;
      }
      const filePath = path.join(tempDir, 'main.go');
      await fs.writeFile(filePath, goCode, 'utf-8');

      // Compile binary first for instant startup & direct stdin piping
      const compResult = await runCommandSync('go', ['build', '-o', 'program', 'main.go'], tempDir);
      if (compResult.code !== 0) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        return { sessionId, error: compResult.stderr || compResult.stdout || 'Go compilation failed' };
      }
      spawnCmd = './program';
      spawnArgs = [];
    } else if (language === 'rust') {
      const hasRustc = await checkHostBinary('rustc');
      if (!hasRustc) {
        return spawnCloudSession(sessionId, language, code, tempDir, input);
      }
      const filePath = path.join(tempDir, 'main.rs');
      await fs.writeFile(filePath, code, 'utf-8');
      const compResult = await runCommandSync('rustc', ['--color=never', 'main.rs', '-o', 'program'], tempDir);
      if (compResult.code !== 0) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        return { sessionId, error: compResult.stderr || 'Rust compilation failed' };
      }
      const hasStdbuf = await checkHostBinary('stdbuf');
      spawnCmd = hasStdbuf ? 'stdbuf' : './program';
      spawnArgs = hasStdbuf ? ['-o0', '-e0', './program'] : [];
    } else if (language === 'php') {
      const hasPhp = await checkHostBinary('php');
      if (!hasPhp) {
        return spawnCloudSession(sessionId, language, code, tempDir, input);
      }
      let phpCode = code.trim();
      if (!phpCode.startsWith('<?')) {
        phpCode = `<?php\n${code}`;
      }
      const filePath = path.join(tempDir, 'index.php');
      await fs.writeFile(filePath, phpCode, 'utf-8');

      // Lint syntax check first
      const lintResult = await runCommandSync('php', ['-l', 'index.php'], tempDir);
      if (lintResult.code !== 0) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        return { sessionId, error: lintResult.stderr || lintResult.stdout || 'PHP syntax error' };
      }

      spawnCmd = 'php';
      spawnArgs = ['-d', 'output_buffering=0', '-d', 'implicit_flush=1', 'index.php'];
    } else if (language === 'kotlin') {
      const hasKotlinc = await checkHostBinary('kotlinc');
      if (!hasKotlinc) {
        return spawnCloudSession(sessionId, language, code, tempDir, input);
      }
      const filePath = path.join(tempDir, 'Main.kt');
      await fs.writeFile(filePath, code, 'utf-8');
      const compResult = await runCommandSync('kotlinc', ['Main.kt', '-include-runtime', '-d', 'Main.jar'], tempDir);
      const cleanedErr = cleanKotlinStderr(compResult.stderr);
      if (compResult.code !== 0) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        return { sessionId, error: cleanedErr || 'Kotlin compilation failed' };
      }
      spawnCmd = 'java';
      spawnArgs = ['-jar', 'Main.jar'];
    } else {
      const filePath = path.join(tempDir, 'main.js');
      await fs.writeFile(filePath, code, 'utf-8');
      spawnCmd = 'node';
      spawnArgs = ['main.js'];
    }

    const localBin = path.join(process.cwd(), 'node_modules', '.bin');
    const child = spawn(spawnCmd, spawnArgs, {
      cwd: tempDir,
      env: {
        ...process.env,
        PATH: `${localBin}:${process.env.PATH || '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'}`,
        PYTHONUNBUFFERED: '1',
        NODE_ENV: 'production',
        GOCACHE: '/tmp/gocache',
        GOPATH: '/tmp/gopath',
      },
    });

    // Guard stdin/stdout/stderr error events
    child.stdin.on('error', (err: any) => {
      // EPIPE is expected if the child process exited without consuming all stdin
      if (err.code !== 'EPIPE') {
        console.warn('Child stdin error:', err.message);
      }
    });
    child.stdout.on('error', () => {});
    child.stderr.on('error', () => {});

    // Handle initial input based on execution mode
    if (mode === 'batch') {
      // Batch mode: write all input upfront, then close stdin so EOF loops (while sc.hasNext(), cin >> x) terminate cleanly
      if (input && child.stdin && !child.stdin.destroyed) {
        child.stdin.write(input);
      }
      try {
        if (child.stdin && !child.stdin.destroyed) {
          child.stdin.end();
        }
      } catch (e) {}
    } else {
      // Interactive mode: DO NOT close stdin!
      // If user provided initial input, write it into stdin while keeping stdin open!
      if (input && child.stdin && !child.stdin.destroyed) {
        child.stdin.write(input.endsWith('\n') ? input : input + '\n');
      }
    }

    const startTime = process.hrtime.bigint();

    // 1. Overall execution timeout (safeguards against runaway infinite loops)
    const overallTimer = setTimeout(() => {
      const formattedLimit = formatTimeoutDuration(OVERALL_TIMEOUT_MS);
      const msg = `\n⚠️ Time Limit Exceeded: Process exceeded maximum execution limit (${formattedLimit}).\n`;
      const event: InteractiveSessionEvent = { type: 'stderr', data: msg };
      session.buffer.push(event);
      session.listeners.forEach((fn) => fn(event));
      killSession(sessionId, 124);
    }, OVERALL_TIMEOUT_MS);

    // 2. Interactive input inactivity timeout (safeguards against abandoned interactive sessions)
    const inactivityTimer = setTimeout(() => {
      const formattedInactivity = formatTimeoutDuration(INACTIVITY_TIMEOUT_MS);
      const msg = `\n⏱️ Input Inactivity Timeout: No input received for ${formattedInactivity}. Session stopped.\n`;
      const event: InteractiveSessionEvent = { type: 'stderr', data: msg };
      session.buffer.push(event);
      session.listeners.forEach((fn) => fn(event));
      killSession(sessionId, 124);
    }, INACTIVITY_TIMEOUT_MS);

    const session: ActiveSession = {
      id: sessionId,
      child,
      tempDir,
      buffer: [],
      listeners: [],
      isExited: false,
      exitCode: null,
      overallTimer,
      inactivityTimer,
      startTime,
      mode,
    };

    sessions.set(sessionId, session);

    child.stdout.on('data', (d: Buffer) => {
      const text = d.toString('utf-8');
      const event: InteractiveSessionEvent = { type: 'stdout', data: text };
      session.buffer.push(event);
      session.listeners.forEach((fn) => fn(event));
    });

    child.stderr.on('data', (d: Buffer) => {
      let text = d.toString('utf-8');
      if (language === 'kotlin' || language === 'java') {
        text = cleanKotlinStderr(text);
        if (!text) return;
      }
      const event: InteractiveSessionEvent = { type: 'stderr', data: text };
      session.buffer.push(event);
      session.listeners.forEach((fn) => fn(event));
    });

    child.on('close', (code: number | null) => {
      session.isExited = true;
      session.exitCode = code ?? 0;
      clearTimeout(session.overallTimer);
      clearTimeout(session.inactivityTimer);

      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - session.startTime) / 1e9;

      const alreadyHasBanner = session.buffer.some(
        (b) => b.data && b.data.includes('=== Code Execution')
      );
      if (!alreadyHasBanner) {
        if (code === 0) {
          const banner = '\n=== Code Execution Successful ===\n';
          const bannerEvent: InteractiveSessionEvent = { type: 'stdout', data: banner };
          session.buffer.push(bannerEvent);
          session.listeners.forEach((fn) => fn(bannerEvent));
        } else {
          const banner = `\n=== Code Execution Failed (exit code: ${code ?? 1}) ===\n`;
          const bannerEvent: InteractiveSessionEvent = { type: 'stderr', data: banner };
          session.buffer.push(bannerEvent);
          session.listeners.forEach((fn) => fn(bannerEvent));
        }
      }

      const event: InteractiveSessionEvent = {
        type: 'exit',
        code: code ?? 0,
        executionTime: Math.round(executionTime * 100) / 100,
      };
      session.buffer.push(event);
      session.listeners.forEach((fn) => fn(event));

      // Clean up temp directory
      setTimeout(() => {
        fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        sessions.delete(sessionId);
      }, 5000);
    });

    child.on('error', (err: any) => {
      const event: InteractiveSessionEvent = { type: 'error', data: err.message };
      session.buffer.push(event);
      session.listeners.forEach((fn) => fn(event));
    });

    return { sessionId };
  } catch (err: any) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    return { sessionId, error: err.message };
  }
}

export function writeSessionInput(sessionId: string, input: string): boolean {
  const session = sessions.get(sessionId);
  if (!session || session.isExited) {
    return false;
  }

  // Refresh interactivity timer on every user input
  clearTimeout(session.inactivityTimer);
  session.inactivityTimer = setTimeout(() => {
    const formattedInactivity = formatTimeoutDuration(INACTIVITY_TIMEOUT_MS);
    const msg = `\n⏱️ Input Inactivity Timeout: No input received for ${formattedInactivity}. Session stopped.\n`;
    const event: InteractiveSessionEvent = { type: 'stderr', data: msg };
    session.buffer.push(event);
    session.listeners.forEach((fn) => fn(event));
    killSession(sessionId, 124);
  }, INACTIVITY_TIMEOUT_MS);

  // Line-oriented readers (Java Scanner, C++ cin, Python input, C fgets) require newline to unblock.
  // If user sends empty string (pressing enter on empty prompt), we send '\n'.
  const dataToWrite = input === '' ? '\n' : (input.endsWith('\n') ? input : input + '\n');

  if (session.isCloud) {
    session.accumulatedStdin = (session.accumulatedStdin || '') + dataToWrite;
    return true;
  }

  if (!session.child || session.child.killed) {
    return false;
  }

  try {
    if (session.child.stdin && !session.child.stdin.destroyed) {
      session.child.stdin.write(dataToWrite);
      return true;
    }
  } catch (err) {
    console.warn('Error writing to child stdin:', err);
  }
  return false;
}

export function closeSessionStdin(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session || session.isExited) {
    return false;
  }

  if (session.isCloud) {
    return true;
  }

  if (!session.child || session.child.killed) {
    return false;
  }

  try {
    if (session.child.stdin && !session.child.stdin.destroyed) {
      session.child.stdin.end();
      return true;
    }
  } catch (err) {
    console.warn('Error closing child stdin:', err);
  }
  return false;
}

export function subscribeToSession(
  sessionId: string,
  onEvent: (event: InteractiveSessionEvent) => void
): { unsubscribe: () => void; buffer: InteractiveSessionEvent[] } | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  session.listeners.push(onEvent);

  return {
    buffer: [...session.buffer],
    unsubscribe: () => {
      const idx = session.listeners.indexOf(onEvent);
      if (idx !== -1) {
        session.listeners.splice(idx, 1);
      }
    },
  };
}

export function killSession(sessionId: string, exitCode?: number): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  clearTimeout(session.overallTimer);
  clearTimeout(session.inactivityTimer);
  try {
    if (session.child && !session.child.killed) {
      session.child.kill('SIGKILL');
    }
  } catch (e) {}

  session.isExited = true;
  if (exitCode !== undefined) {
    session.exitCode = exitCode;
    const exitEvent: InteractiveSessionEvent = {
      type: 'exit',
      code: exitCode,
      executionTime: Number(process.hrtime.bigint() - session.startTime) / 1e9,
    };
    session.buffer.push(exitEvent);
    session.listeners.forEach((fn) => fn(exitEvent));
  }

  fs.rm(session.tempDir, { recursive: true, force: true }).catch(() => {});
  sessions.delete(sessionId);
}
