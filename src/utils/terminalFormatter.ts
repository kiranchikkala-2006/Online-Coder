import { ExecutionStatus } from '../types/index.ts';

/**
 * Formats terminal console output to interleave user input with program prompts,
 * matching real interactive terminals and online compilers, concluding with
 * an execution status line (e.g. `=== Code Execution Successful ===`).
 */
export function formatTerminalOutput(
  stdout: string,
  stderr: string,
  stdin: string,
  status: ExecutionStatus
): { displayText: string; isSuccess: boolean; hasContent: boolean } {
  const cleanStdout = (stdout || '').replace(/\r\n/g, '\n').replace(/\r/g, '');
  const cleanStderr = (stderr || '').replace(/\r\n/g, '\n').replace(/\r/g, '');
  const cleanStdin = (stdin || '').trim();

  // If nothing ran yet
  if (status === 'idle' && !cleanStdout && !cleanStderr) {
    return { displayText: '', isSuccess: true, hasContent: false };
  }

  let formattedOutput = '';

  if (cleanStdout) {
    if (cleanStdin) {
      formattedOutput = interleavePromptsAndInput(cleanStdout, cleanStdin);
    } else {
      formattedOutput = cleanStdout;
    }
  }

  // If there is standard error
  if (cleanStderr) {
    if (formattedOutput && !formattedOutput.endsWith('\n')) {
      formattedOutput += '\n';
    }
    formattedOutput += cleanStderr;
  }

  // Ensure trailing newline before footer
  if (formattedOutput && !formattedOutput.endsWith('\n')) {
    formattedOutput += '\n';
  }

  // If execution failed due to NoSuchElementException or EOF, remind user to enter input in the prompt
  if (
    cleanStderr.includes('NoSuchElementException') ||
    cleanStderr.includes('EOFError') ||
    cleanStderr.includes('EOF when reading')
  ) {
    if (formattedOutput && !formattedOutput.endsWith('\n')) formattedOutput += '\n';
    formattedOutput += '\n[Tip: Your program requires user input. Type your input in the > prompt below and press Enter to run.]\n';
  }

  // Add the execution status footer matching standard online compilers
  const isFailed =
    status === 'compilation_error' ||
    status === 'runtime_error' ||
    status === 'time_limit_exceeded' ||
    status === 'system_error' ||
    Boolean(cleanStderr && status !== 'running');

  if (status === 'running') {
    // No footer yet while running
  } else if (isFailed) {
    formattedOutput += '\n=== Code Execution Failed ===';
  } else if (status === 'success' || formattedOutput.trim().length > 0) {
    formattedOutput += '\n=== Code Execution Successful ===';
  }

  return {
    displayText: formattedOutput.trimStart(),
    isSuccess: !isFailed,
    hasContent: Boolean(cleanStdout || cleanStderr || status !== 'idle'),
  };
}

/**
 * Interleaves prompts in stdout (e.g. "Enter n: ", "Enter elements:\n") with user inputs
 * so they appear in an authentic interactive terminal format.
 */
function interleavePromptsAndInput(rawStdout: string, stdin: string): string {
  const tokens = stdin.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return rawStdout;

  // Regex to detect common interactive prompts
  // Matches "Enter ...:", "Input ...:", "...: ", "Enter elements:\n", etc.
  const promptRegex = /(?:^|\n|\b)(Enter\s+[^:\n]+:\s*|Enter\s+[^:\n]+:?|Input\s+[^:\n]+:\s*|[A-Za-z0-9_]{1,15}\s*:\s+)/gi;

  let matches: Array<{
    text: string;
    start: number;
    end: number;
  }> = [];

  let m: RegExpExecArray | null;
  while ((m = promptRegex.exec(rawStdout)) !== null) {
    const fullMatch = m[0];
    const groupMatch = m[1];
    const startPos = m.index + (fullMatch.length - groupMatch.length);
    matches.push({
      text: groupMatch.trim(),
      start: startPos,
      end: startPos + groupMatch.length,
    });
  }

  if (matches.length === 0) {
    // No explicit prompts detected. If stdout ends with ":" without newline, append first token
    if (rawStdout.trimEnd().endsWith(':') || rawStdout.trimEnd().endsWith('?')) {
      return rawStdout + ' ' + tokens.join(' ') + '\n';
    }
    return rawStdout;
  }

  let result = '';
  let lastPos = 0;
  let tokenIdx = 0;
  let prevTokenVal: string | null = null;

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];

    // Add any preceding output text before this prompt
    if (cur.start > lastPos) {
      const between = rawStdout.substring(lastPos, cur.start);
      result += between;
    }

    const pText = cur.text;
    const isCollection = /elements|numbers|array|values|items/i.test(pText);

    if (isCollection) {
      // E.g. "Enter elements:"
      const count =
        prevTokenVal && !isNaN(parseInt(prevTokenVal, 10))
          ? parseInt(prevTokenVal, 10)
          : tokens.length - tokenIdx;

      if (result && !result.endsWith('\n')) result += '\n';
      result += pText + '\n';

      // Print each element on its own line
      for (let c = 0; c < count && tokenIdx < tokens.length; c++) {
        result += tokens[tokenIdx++] + '\n';
      }
    } else {
      // Single value prompt like "Enter n: " or "Enter k: "
      const val = tokenIdx < tokens.length ? tokens[tokenIdx++] : '';
      prevTokenVal = val;
      if (result && !result.endsWith('\n') && result.length > 0) result += '\n';
      result += pText + (pText.endsWith(' ') ? '' : ' ') + val + '\n';
    }

    lastPos = cur.end;
  }

  // Append any remaining stdout
  if (lastPos < rawStdout.length) {
    const remaining = rawStdout.substring(lastPos);
    result += remaining;
  }

  return result;
}
