import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Check,
  Terminal,
  Trash2,
  CornerDownLeft,
  Sparkles,
  FileText,
} from 'lucide-react';
import { ExecutionStatus } from '../../types/index.ts';

interface TerminalPanelProps {
  output: string;
  error: string;
  status: ExecutionStatus;
  theme: 'dark' | 'light';

  stdin?: string;
  onStdinChange?: (val: string) => void;

  onClearOutput?: () => void;
  onRun?: () => void;

  onSendInput?: (inputLine: string) => void;
  onSendEof?: () => void;

  inputMode?: 'interactive' | 'batch';
  onInputModeChange?: (mode: 'interactive' | 'batch') => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  output,
  error,
  status,
  theme,

  stdin = '',
  onStdinChange,

  onClearOutput,
  onRun,

  onSendInput,
  onSendEof,

  inputMode = 'interactive',
  onInputModeChange,
}) => {
  const [activeTab, setActiveTab] =
    useState<'terminal' | 'custom_input'>('terminal');

  const [currentInput, setCurrentInput] = useState('');
  const [copied, setCopied] = useState(false);

  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRunning = status === 'running';

  /*
   * Switch to terminal automatically when execution starts.
   */
  useEffect(() => {
    if (isRunning) {
      setActiveTab('terminal');

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isRunning]);

  /*
   * Scroll terminal to bottom whenever output changes.
   */
  useEffect(() => {
    const terminal = terminalContainerRef.current;

    if (terminal) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  }, [output, error, currentInput, status]);

  /*
   * Clear the temporary input after program stops.
   */
  useEffect(() => {
    if (!isRunning) {
      setCurrentInput('');
    }
  }, [isRunning]);

  /*
   * Focus terminal input when clicking terminal area.
   */
  const handleContainerClick = () => {
    const selection = window.getSelection();

    if (!selection || selection.toString().length === 0) {
      if (isRunning) {
        inputRef.current?.focus();
      }
    }
  };

  /*
   * Copy terminal output.
   */
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const content = [output, error]
      .filter(Boolean)
      .join('\n');

    if (!content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  /*
   * Update the interactive input field.
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentInput(e.target.value);
  };

  /*
   * Send one line of input.
   *
   * The important part is that we do NOT start the program again
   * when the program is already running.
   */
  const submitInputLine = () => {
    const line = currentInput;

    if (!isRunning) {
      return;
    }

    if (!onSendInput) {
      return;
    }

    setCurrentInput('');

    onSendInput(line);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 20);
  };

  /*
   * Keyboard handling for interactive input.
   */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    /*
     * Ctrl + D / Cmd + D
     * Send EOF.
     */
    if (
      e.key.toLowerCase() === 'd' &&
      (e.ctrlKey || e.metaKey)
    ) {
      e.preventDefault();

      if (isRunning && onSendEof) {
        onSendEof();
      }

      return;
    }

    /*
     * Enter = send input.
     */
    if (e.key === 'Enter') {
      e.preventDefault();
      submitInputLine();
    }
  };

  /*
   * Form submit = send input.
   */
  const handleFormSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    submitInputLine();
  };

  /*
   * Support multiline paste.
   *
   * Example:
   *
   * 5
   * 10
   * 20
   *
   * Each line is sent to the parent.
   */
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    if (!isRunning || !onSendInput) {
      return;
    }

    const pasted = e.clipboardData.getData('text');

    if (!pasted) {
      return;
    }

    if (pasted.includes('\n')) {
      e.preventDefault();

      const lines = pasted
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n');

      for (const line of lines) {
        onSendInput(line);
      }

      setCurrentInput('');
    }
  };

  /*
   * Batch input.
   */
  const handleBatchInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onStdinChange?.(e.target.value);
  };

  /*
   * Run with the current batch input.
   */
  const handleBatchRun = () => {
    if (onRun) {
      onRun();
    }
  };

  /*
   * Clear batch input.
   */
  const handleClearInput = () => {
    onStdinChange?.('');
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="terminal-output-panel"
      className={`flex flex-col h-full w-full overflow-hidden ${
        isDark
          ? 'bg-[#14171f] text-slate-100'
          : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* =========================================================
          HEADER
      ========================================================== */}
      <div
        id="output-header-bar"
        className="flex items-center justify-between px-3 py-2 bg-[#1b1f2b] border-b border-[#2a3042] text-xs"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Terminal tab */}
          <button
            type="button"
            id="tab-interactive-terminal"
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'terminal'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          {/* Batch input tab */}
          <button
            type="button"
            id="tab-custom-input"
            onClick={() => setActiveTab('custom_input')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'custom_input'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />

            <span>Custom Input</span>

            {stdin.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            )}
          </button>

          {/* Running indicator */}
          {isRunning ? (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30 animate-pulse ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Program Running</span>
            </span>
          ) : status === 'idle' ? (
            <span className="hidden sm:inline-block text-[11px] text-slate-300 font-medium ml-1">
              Click Run to start
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">

          {/* Mode selector */}
          {onInputModeChange && (
            <div className="hidden md:flex items-center gap-1.5 bg-[#12151e] border border-[#2a3042] rounded px-2 py-0.5 text-[11px]">
              <span className="text-slate-300 font-medium">
                Mode:
              </span>

              <button
                type="button"
                onClick={() =>
                  onInputModeChange('interactive')
                }
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  inputMode === 'interactive'
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Interactive
              </button>

              <button
                type="button"
                onClick={() =>
                  onInputModeChange('batch')
                }
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  inputMode === 'batch'
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Batch
              </button>
            </div>
          )}

          {/* Clear */}
          {onClearOutput && (output || error) && (
            <button
              id="clear-output-button"
              type="button"
              onClick={onClearOutput}
              title="Clear terminal"
              className="p-1 rounded text-slate-400 hover:text-rose-300 hover:bg-slate-700/50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy */}
          <button
            id="share-output-button"
            type="button"
            onClick={handleCopy}
            title={
              copied
                ? 'Copied'
                : 'Copy terminal output'
            }
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>

          {copied && (
            <span className="absolute right-7 top-7 bg-slate-800 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded text-[11px] shadow-lg whitespace-nowrap z-30">
              Copied!
            </span>
          )}
        </div>
      </div>

      {/* =========================================================
          TERMINAL / BATCH INPUT
      ========================================================== */}

      {activeTab === 'terminal' ? (
        <div
          ref={terminalContainerRef}
          onClick={handleContainerClick}
          className="flex-1 p-4 font-mono text-[13px] md:text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap relative outline-none select-text cursor-text"
        >
          {/* Output */}
          {output && (
            <span className="text-slate-100">
              {output}
            </span>
          )}

          {/* Error */}
          {error && (
            <span className="text-rose-400 font-medium">
              {error}
            </span>
          )}

          {/* Running prompt */}
          {isRunning && (
            <span className="text-sky-400 font-bold animate-pulse ml-1">
              |
            </span>
          )}

          {/* Empty terminal */}
          {!output &&
            !error &&
            status === 'idle' && (
              <div className="text-slate-300 flex flex-col gap-2 py-6 select-none font-sans">

                <div className="flex items-center gap-2 text-sky-400 font-semibold font-mono text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Console Ready
                  </span>
                </div>

                <p className="text-xs text-slate-200 max-w-lg leading-relaxed">
                  Run your program and provide input using
                  the input box below.
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-[11px] pt-1">
                  <span>
                    • Press{' '}
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-white">
                      Enter
                    </kbd>{' '}
                    to send input
                  </span>

                  <span>
                    • Use{' '}
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-white">
                      Ctrl+D
                    </kbd>{' '}
                    for EOF
                  </span>
                </div>
              </div>
            )}

          {/* Status */}
          {status === 'running' && (
            <div className="text-emerald-300 text-xs mt-2">
              Waiting for program input...
            </div>
          )}
        </div>
      ) : (
        /* =======================================================
           BATCH INPUT
        ======================================================== */
        <div className="flex-1 flex flex-col p-4 bg-[#101218] overflow-hidden text-xs">

          <div className="flex items-center justify-between pb-2 text-slate-200">
            <span className="font-semibold text-slate-100">
              Custom Input
            </span>

            {stdin && (
              <button
                type="button"
                onClick={handleClearInput}
                className="text-[11px] text-rose-300 hover:text-rose-200 font-medium"
              >
                Clear Input
              </button>
            )}
          </div>

          <textarea
            value={stdin}
            onChange={handleBatchInputChange}
            placeholder={
              'Enter program input here.\n\nExample:\n5'
            }
            className="flex-1 w-full bg-[#161a24] border border-slate-600 focus:border-sky-400 rounded p-3 text-white font-mono text-xs placeholder:text-slate-400 outline-none resize-none transition-colors"
            spellCheck={false}
          />

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-medium text-slate-200">
              {stdin.trim()
                ? `${stdin.split('\n').length} line(s) entered`
                : 'No input provided'}
            </span>

            <span className="text-slate-300">
              Click Run after entering the input.
            </span>
          </div>

          {/* Run button */}
          <button
            type="button"
            onClick={handleBatchRun}
            disabled={status === 'running'}
            className="mt-3 w-full px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded font-medium transition-colors"
          >
            {status === 'running'
              ? 'Running...'
              : 'Run with this Input'}
          </button>
        </div>
      )}

      {/* =========================================================
          INTERACTIVE INPUT BAR
      ========================================================== */}

      {isRunning && (
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 px-3 py-2 bg-[#1b1f2b] border-t border-[#2a3042] text-xs shadow-inner"
        >
          {/* Prompt */}
          <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold select-none text-sm pl-1">
            <span>&gt;</span>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Enter input and press Enter..."
            className="flex-1 bg-[#101218] border border-slate-600 focus:border-sky-400 rounded px-3 py-1.5 text-white font-mono text-[13px] placeholder:text-slate-400 outline-none transition-colors shadow-sm"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Program input"
          />

          {/* Send */}
          <button
            type="submit"
            disabled={!currentInput}
            title="Send input"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded font-medium transition-colors flex items-center gap-1 shadow-sm text-xs"
          >
            <span>Send</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>

          {/* EOF */}
          {onSendEof && (
            <button
              type="button"
              onClick={onSendEof}
              title="Send EOF"
              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded font-mono text-xs transition-colors flex items-center gap-1 shadow-sm border border-slate-600"
            >
              <span>EOF</span>
              <span className="text-[10px] text-slate-300">
                (^D)
              </span>
            </button>
          )}
        </form>
      )}
    </div>
  );
};