import { SupportedLanguageId } from '../../src/types/index.ts';

// Judge0 Language IDs
const JUDGE0_LANGUAGE_IDS: Record<SupportedLanguageId, number> = {
  python: 92, // Python 3.11.2
  java: 91, // Java JDK 17.0.6
  cpp: 105, // C++ GCC 14.1.0
  c: 103, // C GCC 14.1.0
  javascript: 102, // Node.js 22.08.0
  typescript: 101, // TypeScript 5.6.2
  go: 107, // Go 1.23.5
  rust: 108, // Rust 1.85.0
  kotlin: 111, // Kotlin 2.1.10
  php: 98, // PHP 8.3.11
};

export interface CloudExecutionResult {
  success: boolean;
  status: 'success' | 'runtime_error' | 'compilation_error' | 'time_limit_exceeded' | 'system_error';
  stdout: string;
  stderr: string;
  compileOutput?: string;
  executionTime: number;
  memoryUsageMB: number;
  exitCode: number;
}

export async function executeInCloudSandbox(
  language: SupportedLanguageId,
  code: string,
  stdin = ''
): Promise<CloudExecutionResult> {
  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) {
    return {
      success: false,
      status: 'system_error',
      stdout: '',
      stderr: `Language "${language}" is not mapped for cloud execution.`,
      executionTime: 0,
      memoryUsageMB: 0,
      exitCode: 1,
    };
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://ce.judge0.com/submissions?wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: stdin || '',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        status: 'system_error',
        stdout: '',
        stderr: `Cloud sandbox returned HTTP ${response.status}: ${errorText}`,
        executionTime: (Date.now() - startTime) / 1000,
        memoryUsageMB: 0,
        exitCode: 1,
      };
    }

    const data = (await response.json()) as {
      stdout: string | null;
      stderr: string | null;
      compile_output: string | null;
      message: string | null;
      time: string | null;
      memory: number | null;
      status?: { id: number; description: string };
    };

    const stdout = data.stdout || '';
    const stderr = data.stderr || '';
    const compileOutput = data.compile_output || '';
    const executionTime = data.time ? parseFloat(data.time) : (Date.now() - startTime) / 1000;
    const memoryUsageMB = data.memory ? Math.round((data.memory / 1024) * 10) / 10 : 0;

    const statusId = data.status?.id ?? 0;
    // Judge0 Status IDs:
    // 3: Accepted
    // 4: Wrong Answer
    // 5: Time Limit Exceeded
    // 6: Compilation Error
    // 7-12: Runtime Error
    // 13: Internal Error
    // 14: Exec Format Error

    if (statusId === 3) {
      return {
        success: true,
        status: 'success',
        stdout,
        stderr: '',
        executionTime,
        memoryUsageMB,
        exitCode: 0,
      };
    } else if (statusId === 6) {
      return {
        success: false,
        status: 'compilation_error',
        stdout: '',
        stderr: compileOutput || stderr || 'Compilation error occurred.',
        compileOutput,
        executionTime,
        memoryUsageMB,
        exitCode: 1,
      };
    } else if (statusId === 5) {
      return {
        success: false,
        status: 'time_limit_exceeded',
        stdout,
        stderr: stderr || 'Time Limit Exceeded: Execution took longer than allowed timeout.',
        executionTime,
        memoryUsageMB,
        exitCode: 124,
      };
    } else {
      // Runtime error or other failure
      return {
        success: false,
        status: 'runtime_error',
        stdout,
        stderr: stderr || compileOutput || data.message || 'Execution failed with runtime error.',
        executionTime,
        memoryUsageMB,
        exitCode: 1,
      };
    }
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return {
      success: false,
      status: isTimeout ? 'time_limit_exceeded' : 'system_error',
      stdout: '',
      stderr: isTimeout
        ? 'Execution timed out after 15 seconds.'
        : `Execution engine connection error: ${err.message || 'Unknown network error'}`,
      executionTime: (Date.now() - startTime) / 1000,
      memoryUsageMB: 0,
      exitCode: isTimeout ? 124 : 1,
    };
  }
}
