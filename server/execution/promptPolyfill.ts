// Synchronous polyfill for prompt, alert, and confirm in CLI / Node.js runtime.
// Automatically preloaded for JavaScript and TypeScript executions so that standard
// browser/beginner input statements (such as `prompt("Enter a number:")` and `alert(...)`)
// work out of the box in both interactive and batch execution modes.

export const NODE_CLI_POLYFILL_CODE = `
const fs = require('fs');

if (typeof globalThis.prompt === 'undefined') {
  globalThis.prompt = function(message) {
    if (message !== undefined && message !== null && message !== '') {
      process.stdout.write(String(message));
    }
    const buf = Buffer.alloc(1);
    let str = '';
    while (true) {
      let bytesRead = 0;
      try {
        bytesRead = fs.readSync(0, buf, 0, 1);
      } catch (e) {
        break;
      }
      if (bytesRead === 0) break;
      const char = buf.toString('utf-8');
      if (char === '\\n') break;
      if (char !== '\\r') str += char;
    }
    return str;
  };
}

if (typeof globalThis.alert === 'undefined') {
  globalThis.alert = function(message) {
    process.stdout.write((message !== undefined && message !== null ? String(message) : '') + '\\n');
  };
}

if (typeof globalThis.confirm === 'undefined') {
  globalThis.confirm = function(message) {
    const promptText = message !== undefined && message !== null && message !== '' 
      ? String(message) + ' (y/n): ' 
      : '(y/n): ';
    const res = globalThis.prompt(promptText);
    return /^(y|yes|true|1)$/i.test((res || '').trim());
  };
}
`;
