import { RunCodeRequest, RunCodeResponse, SupportedLanguageId } from '../types/index.ts';

export async function runCodeApi(
  language: SupportedLanguageId,
  code: string,
  input: string = '',
  abortSignal?: AbortSignal,
  files?: Array<{ name: string; content: string }>
): Promise<RunCodeResponse> {
  const payload: RunCodeRequest = {
    language,
    code,
    input,
    files,
  };

  const response = await fetch('/api/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: abortSignal,
  });

  if (!response.ok) {
    let errorMsg = `Server error HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errorMsg = errJson.error;
      }
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return (await response.json()) as RunCodeResponse;
}

export async function checkServerHealth(): Promise<{
  status: string;
  dockerAvailable: boolean;
  executionLimits: any;
}> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (e) {
    return {
      status: 'offline',
      dockerAvailable: false,
      executionLimits: { timeoutSeconds: 5, memoryLimit: '128m' },
    };
  }
}

export async function spawnTerminalSessionApi(
  language: SupportedLanguageId,
  code: string,
  input: string = '',
  mode: 'interactive' | 'batch' = 'interactive',
  files?: Array<{ name: string; content: string }>
): Promise<{ sessionId?: string; status?: string; error?: string }> {
  const response = await fetch('/api/terminal/spawn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code, input, mode, files }),
  });
  return await response.json();
}

export async function sendTerminalInputApi(
  sessionId: string,
  input: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/terminal/${sessionId}/stdin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    return await response.json();
  } catch (e) {
    return { success: false };
  }
}

export async function sendTerminalEofApi(sessionId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/terminal/${sessionId}/eof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch (e) {
    return { success: false };
  }
}

export async function killTerminalSessionApi(sessionId: string): Promise<void> {
  try {
    await fetch(`/api/terminal/${sessionId}/kill`, {
      method: 'POST',
    });
  } catch (e) {}
}

