import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Check,
  Terminal,
  Trash2,
  CornerDownLeft,
  Sparkles,
  FileText,
  Sliders,
  SendHorizontal,
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
  const [activeTab, setActiveTab] = useState<'terminal' | 'custom_input'>('terminal');
  const [currentInput, setCurrentInput] = useState('');
  const [copied, setCopied] = useState(false);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRunning = status === 'running';

  // Automatically switch to terminal view whenever execution starts
  useEffect(() => {
    if (isRunning) {
      setActiveTab('terminal');
    }
  }, [isRunning]);

  // Auto-scroll to bottom whenever output or currentInput changes
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [output, error, currentInput, status]);

  // Focus input automatically when program starts running
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isRunning]);

  // Focus input on clicking terminal container (unless user is selecting text)
  const handleContainerClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      inputRef.current?.focus();
    }
  };

  // Copy output
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const contentToCopy = output || error || '';
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(contentToCopy);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  const submitInputLine = (lineToSubmit: string) => {
    setCurrentInput('');
    if (isRunning && onSendInput) {
      onSendInput(lineToSubmit);
    } else if (onRun) {
      onRun();
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+D sends EOF
    if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (isRunning && onSendEof) {
        onSendEof();
      }
      return;
    }

    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      submitInputLine(currentInput);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInputLine(currentInput);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && isRunning && onSendInput && pasted.includes('\n')) {
      e.preventDefault();
      onSendInput(pasted);
      setCurrentInput('');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="terminal-output-panel"
      className={`flex flex-col h-full w-full overflow-hidden ${
        isDark ? 'bg-[#14171f] text-slate-100' : 'bg-slate-900 text-slate-100'
      } select-none`}
    >
      {/* 1. OUTPUT HEADER WITH TABS */}
      <div
        id="output-header-bar"
        className="flex items-center justify-between px-3 py-2 bg-[#1b1f2b] border-b border-[#2a3042] select-none text-xs"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tab buttons */}
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
            <span>Custom Input (Batch)</span>
            {stdin.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            )}
          </button>

          {/* Running indicator badge */}
          {isRunning ? (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30 animate-pulse ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Interactive Stdin Active</span>
            </span>
          ) : (
            status === 'idle' && (
              <span className="hidden sm:inline-block text-[11px] text-slate-300 font-medium ml-1">
                (Click Run to start)
              </span>
            )
          )}
        </div>

        <div className="relative flex items-center gap-1">
          {/* Mode Selector Pill */}
          {onInputModeChange && (
            <div className="hidden md:flex items-center gap-1.5 bg-[#12151e] border border-[#2a3042] rounded px-2 py-0.5 text-[11px]">
              <span className="text-slate-300 font-medium">Mode:</span>
              <button
                type="button"
                onClick={() => onInputModeChange('interactive')}
                title="Interactive mode: keeps process alive and pipes live terminal input"
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  inputMode === 'interactive'
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Interactive
              </button>
              <button
                type="button"
                onClick={() => onInputModeChange('batch')}
                title="Batch mode: sends all custom input and closes stdin (for EOF loops)"
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  inputMode === 'batch'
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Batch
              </button>
            </div>
          )}

          {onClearOutput && output && activeTab === 'terminal' && (
            <button
              id="clear-output-button"
              type="button"
              onClick={onClearOutput}
              title="Clear terminal output"
              className="p-1 rounded text-slate-400 hover:text-rose-300 hover:bg-slate-700/50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            id="share-output-button"
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard' : 'Copy Output'}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
          {copied && (
            <span className="absolute right-7 -top-1 bg-slate-800 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded text-[11px] shadow-lg whitespace-nowrap z-30">
              Copied!
            </span>
          )}
        </div>
      </div>

      {/* 2. BODY CONTENT: EITHER INTERACTIVE TERMINAL OR CUSTOM INPUT (BATCH) */}
      {activeTab === 'terminal' ? (
        <div
          ref={terminalContainerRef}
          onClick={handleContainerClick}
          className="flex-1 p-4 font-mono text-[13px] md:text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap relative outline-none select-text cursor-text"
        >
          {/* Render streamed output text */}
          {output && <span className="text-slate-100">{output}</span>}

          {/* Any compilation/runtime error not already in output */}
          {error && !output.includes(error) && (
            <span className="text-rose-400 font-medium">{error}</span>
          )}

          {/* Real-time typing echo in terminal */}
          {isRunning && currentInput && (
            <span className="text-emerald-300 font-semibold bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-500/30 ml-0.5">
              {currentInput}
              <span className="text-emerald-400 font-bold animate-pulse ml-[1px]">|</span>
            </span>
          )}

          {/* Blinking cursor when waiting for input and no text typed yet */}
          {isRunning && !currentInput && (
            <span className="text-sky-400 font-bold animate-pulse select-none ml-[2px]">|</span>
          )}

          {/* Idle prompt placeholder */}
          {!output && !error && status === 'idle' && (
            <div className="text-slate-300 flex flex-col gap-2 py-6 select-none font-sans">
              <div className="flex items-center gap-2 text-sky-400 font-semibold font-mono text-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Interactive Console Ready</span>
              </div>
              <p className="text-xs text-slate-200 max-w-lg leading-relaxed">
                Supports live interactive input for all languages (Java <code className="text-sky-300 font-mono font-semibold">Scanner</code>, C++ <code className="text-sky-300 font-mono font-semibold">cin</code>, Python <code className="text-sky-300 font-mono font-semibold">input()</code>, C <code className="text-sky-300 font-mono font-semibold">scanf</code>, Go, Rust, and more).
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-[11px] pt-1">
                <span>• Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-white font-medium">Enter</kbd> to submit input</span>
                <span>• Use <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-white font-medium">Ctrl+D</kbd> or EOF button to close stdin</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CUSTOM INPUT (BATCH MODE) TAB */
        <div className="flex-1 flex flex-col p-4 bg-[#101218] overflow-hidden text-xs">
          <div className="flex items-center justify-between pb-2 text-slate-200">
            <span className="font-semibold text-slate-100">
              Batch Stdin (Provide all test inputs at once):
            </span>
            {stdin && (
              <button
                type="button"
                onClick={() => onStdinChange?.('')}
                className="text-[11px] text-rose-300 hover:text-rose-200 font-medium"
              >
                Clear Input
              </button>
            )}
          </div>
          <textarea
            value={stdin}
            onChange={(e) => onStdinChange?.(e.target.value)}
            placeholder={`Enter input values separated by spaces or newlines.\nExample:\n5\n10 20 30 40 50`}
            className="flex-1 w-full bg-[#161a24] border border-slate-600 focus:border-sky-400 rounded p-3 text-white font-mono text-xs placeholder:text-slate-400 outline-none resize-none transition-colors"
            spellCheck={false}
          />
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-medium text-slate-200">
              {stdin.trim() ? `${stdin.split('\n').length} lines entered` : 'No input provided'}
            </span>
            <span className="text-slate-300">
              When using batch mode, this input will be supplied to the program on Run.
            </span>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE INPUT BAR (Active when program is running) */}
      {isRunning && (
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 px-3 py-2 bg-[#1b1f2b] border-t border-[#2a3042] text-xs shadow-inner"
        >
          <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold select-none text-sm pl-1">
            <span>&gt;</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type input and press Enter..."
            className="flex-1 bg-[#101218] border border-slate-600 focus:border-sky-400 rounded px-3 py-1.5 text-white font-mono text-[13px] placeholder:text-slate-400 outline-none transition-colors shadow-sm"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Interactive program input"
          />

          {/* Send Input Button */}
          <button
            type="submit"
            title="Submit input to running program (Enter)"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium transition-colors flex items-center gap-1 shadow-sm text-xs cursor-pointer select-none"
          >
            <span>Send</span>
            <CornerDownLeft className="w-3 h-3 text-sky-200" />
          </button>

          {/* Send EOF Button */}
          {onSendEof && (
            <button
              type="button"
              onClick={onSendEof}
              title="Close standard input (EOF / Ctrl+D) for programs using while(hasNext) or while(cin >> x)"
              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 hover:text-white rounded font-mono text-xs transition-colors flex items-center gap-1 shadow-sm cursor-pointer select-none border border-slate-600"
            >
              <span>EOF</span>
              <span className="text-[10px] text-slate-300">(^D)</span>
            </button>
          )}
        </form>
      )}
    </div>
  );
};
