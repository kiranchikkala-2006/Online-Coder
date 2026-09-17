import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TopToolbar } from '../components/compiler/TopToolbar.tsx';
import { CodeEditor } from '../components/compiler/CodeEditor.tsx';
import { TerminalPanel } from '../components/compiler/TerminalPanel.tsx';
import { EditorSettingsModal } from '../components/compiler/EditorSettingsModal.tsx';
import { ShortcutsModal } from '../components/modals/ShortcutsModal.tsx';
import { TestAdBanner } from '../components/common/TestAdBanner.tsx';
import { SupportedLanguageId, ExecutionStatus, EditorSettings, EditorTab } from '../types/index.ts';
import { GripVertical } from 'lucide-react';
import { getLanguageConfig, detectLanguageFromFilename } from '../config/languages.ts';
import {
  runCodeApi,
  spawnTerminalSessionApi,
  sendTerminalInputApi,
  sendTerminalEofApi,
  killTerminalSessionApi,
} from '../services/api.ts';
import { saveLastSession, loadLastSession } from '../services/storage.ts';

interface CompilerPageProps {
  initialLanguage?: SupportedLanguageId;
  onLanguageChange?: (lang: SupportedLanguageId) => void;
  theme: 'dark' | 'light';
}

export const CompilerPage: React.FC<CompilerPageProps> = ({
  initialLanguage = 'python' as SupportedLanguageId,
  onLanguageChange,
  theme,
}) => {
  const [language, setLanguage] = useState<SupportedLanguageId>(() => {
    const saved = loadLastSession();
    return saved?.language || initialLanguage;
  });
  const prevInitialLangRef = useRef<SupportedLanguageId>(language);
  const [code, setCode] = useState<string>(() => {
    const saved = loadLastSession();
    const activeLang = saved?.language || initialLanguage;
    const defaultStarter = getLanguageConfig(activeLang as SupportedLanguageId).defaultCode;
    if (saved && saved.code) {
      const isLegacyTemplate =
        saved.code.includes('def greet(name: str)') ||
        saved.code.includes('vector<int> numbers') ||
        saved.code.includes('int a = 15;') ||
        saved.code.includes('List<String> items') ||
        saved.code.includes('function greet(user = "Developer")') ||
        saved.code.includes('interface CompilerSpec') ||
        saved.code.includes('Current Execution Timestamp') ||
        saved.code.includes('Online Coder Rust Runner') ||
        saved.code.includes('val languages = listOf("Kotlin"') ||
        saved.code.includes('"platform" => "Online Coder"') ||
        (!saved.code.includes('Starter Program') && saved.code.includes('Hello, World'));
      if (!isLegacyTemplate) {
        return saved.code;
      }
    }
    return defaultStarter;
  });
  const [stdin, setStdin] = useState<string>('');
  const [inputMode, setInputMode] = useState<'interactive' | 'batch'>('interactive');
  const [activeProgramTitle, setActiveProgramTitle] = useState<string | null>(null);

  // Tabs Management (matching screenshot: 🐍 main.py ✕  +)
  const [tabs, setTabs] = useState<EditorTab[]>(() => {
    const config = getLanguageConfig(language);
    return [
      {
        id: 'tab-main',
        name: config.filename,
        code: code,
        language: language,
        isAd: false,
      },
    ];
  });
  const [activeTabId, setActiveTabId] = useState<string>('tab-main');

  const AD_PRESETS = [
    {
      sponsor: 'HyperCloud Compute',
      title: 'High-Performance Developer VPS & Sandboxes',
      tagline: 'Instant container spinup with AMD EPYC processors, dedicated NVMe SSDs, and 10Gbps unmetered bandwidth.',
      ctaText: 'Claim $100 Free Credit',
      badge: 'Verified Sponsor',
    },
    {
      sponsor: 'DevOps Stack Cloud',
      title: 'Automated CI/CD & Docker Build Pipelines',
      tagline: 'Run 10x faster test suites and deploy microservices with zero configuration container orchestration.',
      ctaText: 'Start Free 30-Day Trial',
      badge: 'Gold Partner',
    },
    {
      sponsor: 'CodeArmor Security',
      title: 'Static Analysis & Dependency Vulnerability Scanner',
      tagline: 'Scan your code in real-time, catch CVEs before deployment, and enforce compliance automatically.',
      ctaText: 'Scan Repository Now',
      badge: 'Official Sponsor',
    },
  ];

  const handleSelectTab = (tabId: string) => {
    const target = tabs.find((t) => t.id === tabId);
    if (!target) return;
    setActiveTabId(tabId);
    if (!target.isAd) {
      setCode(target.code);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setTabs((prev) =>
      prev.map((tab) => (tab.id === activeTabId ? { ...tab, code: newCode } : tab))
    );
  };

  const handleAddTab = (customName?: string) => {
    const activeConfig = getLanguageConfig(language);
    const existingCodeTabs = tabs.filter((t) => !t.isAd);
    const ext = activeConfig.extension;
    const baseName = activeConfig.filename.replace(/\.[^/.]+$/, '');
    const defaultName = customName || `${baseName}_${existingCodeTabs.length + 1}${ext}`;
    const newTabId = `tab-${Date.now()}`;
    const newTab: EditorTab = {
      id: newTabId,
      name: defaultName,
      code: `// ${defaultName}\n\n`,
      language: language,
      isAd: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
    setCode(newTab.code);
  };

  const handleAddAdTab = () => {
    const adCount = tabs.filter((t) => t.isAd).length;
    const preset = AD_PRESETS[adCount % AD_PRESETS.length];
    const newTabId = `tab-ad-${Date.now()}`;
    const newTab: EditorTab = {
      id: newTabId,
      name: `Ad: ${preset.sponsor.split(' ')[0]}`,
      code: '',
      language: language,
      isAd: true,
      adData: preset,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length <= 1) {
      const config = getLanguageConfig(language);
      setTabs([
        {
          id: 'tab-main',
          name: config.filename,
          code: config.defaultCode,
          language: language,
          isAd: false,
        },
      ]);
      setActiveTabId('tab-main');
      setCode(config.defaultCode);
      return;
    }

    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const fallbackTab = newTabs[newTabs.length - 1];
      setActiveTabId(fallbackTab.id);
      if (!fallbackTab.isAd) {
        setCode(fallbackTab.code);
      }
    }
  };

  const handleRenameTab = (tabId: string, newName: string) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === tabId) {
          const detected = detectLanguageFromFilename(newName);
          return {
            ...t,
            name: newName,
            language: detected || t.language,
          };
        }
        return t;
      })
    );
  };

  // Execution state
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [memoryUsageMB, setMemoryUsageMB] = useState<number>(12);
  const [sandboxType, setSandboxType] = useState<string>('docker');
  const [exitCode, setExitCode] = useState<number | undefined>(undefined);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Abort controller and Terminal Session refs for interactive streaming
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Split Layout State: Defaulting to Side-by-Side as in the screenshot
  const [layoutMode, setLayoutMode] = useState<'side-by-side' | 'bottom'>('side-by-side');
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(55);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Handle Dragging Split Resizer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const container = document.getElementById('compiler-split-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (layoutMode === 'side-by-side') {
        const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
        if (newPercent >= 25 && newPercent <= 80) {
          setEditorWidthPercent(newPercent);
        }
      } else {
        const newPercent = ((e.clientY - rect.top) / rect.height) * 100;
        if (newPercent >= 20 && newPercent <= 80) {
          setEditorWidthPercent(newPercent);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, layoutMode]);

  // Editor Settings
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 14,
    tabSize: 4,
    minimap: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    autoClosingBrackets: 'always',
  });

  // If initialLanguage changes from outside navigation (e.g. from navbar or another tab)
  useEffect(() => {
    if (initialLanguage && initialLanguage !== prevInitialLangRef.current) {
      prevInitialLangRef.current = initialLanguage;
      setLanguage(initialLanguage);
      setCode(getLanguageConfig(initialLanguage).defaultCode);
      setActiveProgramTitle(null);
      setStdin('');
      setStdout('');
      setStderr('');
      setStatus('idle');
    }
  }, [initialLanguage]);

  // Auto-save session to localStorage/IndexedDB on state changes (never persist stale input)
  useEffect(() => {
    saveLastSession({
      language,
      code,
      input: '',
      activeProgramId: null,
      activeProgramTitle,
    });
  }, [language, code, activeProgramTitle]);

  // Handle language switch
  const handleSelectLanguage = (newLang: SupportedLanguageId) => {
    if (newLang === language) return;
    prevInitialLangRef.current = newLang;
    setLanguage(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
    const config = getLanguageConfig(newLang);
    setCode(config.defaultCode);
    setActiveProgramTitle(null);
    setStdin('');
    setStdout('');
    setStderr('');
    setStatus('idle');

    // Synchronize main file tab
    setTabs((prev) => {
      const hasMain = prev.some((t) => t.id === 'tab-main');
      if (hasMain) {
        return prev.map((t) =>
          t.id === 'tab-main'
            ? { ...t, name: config.filename, code: config.defaultCode, language: newLang }
            : t
        );
      }
      return [
        {
          id: 'tab-main',
          name: config.filename,
          code: config.defaultCode,
          language: newLang,
          isAd: false,
        },
        ...prev,
      ];
    });
    setActiveTabId('tab-main');
  };

  // Live Interactive Terminal Execution
  const handleRunCode = useCallback(async () => {
    if (status === 'running') return;

    const activeNonAdTab = tabs.find((t) => t.id === activeTabId && !t.isAd) || tabs.find((t) => !t.isAd);
    const codeToRun = activeNonAdTab ? (activeNonAdTab.id === activeTabId ? code : activeNonAdTab.code) : code;

    if (!codeToRun.trim()) {
      setStatus('system_error');
      setStderr('Error: Cannot execute empty source code. Please write some code first.');
      return;
    }

    // Reset output and mark as running
    setStatus('running');
    setStdout('');
    setStderr('');
    setExecutionTime(0);
    setExitCode(undefined);

    // Close any previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (activeSessionIdRef.current) {
      killTerminalSessionApi(activeSessionIdRef.current);
      activeSessionIdRef.current = null;
    }

    const codeFiles = tabs
      .filter((t) => !t.isAd && t.name)
      .map((t) => ({
        name: t.name,
        content: t.id === activeTabId ? code : t.code,
      }));

    try {
      const res = await spawnTerminalSessionApi(language, codeToRun, stdin, inputMode, codeFiles);
      if (res.error) {
        setStatus('compilation_error');
        setStderr(res.error);
        setStdout(res.error + '\n=== Code Execution Failed ===\n');
        return;
      }

      if (!res.sessionId) {
        throw new Error('No session ID returned from server');
      }

      const sessionId = res.sessionId;
      activeSessionIdRef.current = sessionId;

      const es = new EventSource(`/api/terminal/${sessionId}/stream`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'stdout') {
            setStdout((prev) => prev + payload.data);
          } else if (payload.type === 'stderr') {
            setStdout((prev) => prev + payload.data);
            setStderr((prev) => prev + payload.data);
          } else if (payload.type === 'exit') {
            setStatus(payload.code === 0 ? 'success' : 'runtime_error');
            setExecutionTime(payload.executionTime || 0);
            setExitCode(payload.code);
            es.close();
            eventSourceRef.current = null;
            activeSessionIdRef.current = null;
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      es.onerror = () => {
        // Only mark error if connection was definitively closed by browser
        if (es.readyState === EventSource.CLOSED) {
          es.close();
          eventSourceRef.current = null;
          activeSessionIdRef.current = null;
          setStatus((prev) => (prev === 'running' ? 'system_error' : prev));
        }
      };
    } catch (err: any) {
      setStatus('system_error');
      setStderr(err.message || 'Execution request failed.');
      setStdout((prev) => prev + (err.message || 'Execution request failed.') + '\n');
    }
  }, [code, language, status, stdin, inputMode]);

  // Send input directly to running terminal process
  const handleSendInput = useCallback((inputLine: string) => {
    // Echo the line in terminal display
    setStdout((prev) => prev + inputLine + '\n');
    const sessionId = activeSessionIdRef.current;
    if (sessionId) {
      sendTerminalInputApi(sessionId, inputLine + '\n');
    }
  }, []);

  // Send EOF (Ctrl+D) to close stdin of running program
  const handleSendEof = useCallback(async () => {
    const sessionId = activeSessionIdRef.current;
    if (sessionId) {
      setStdout((prev) => prev + '\n[EOF / Ctrl+D sent]\n');
      await sendTerminalEofApi(sessionId);
    }
  }, []);

  // Stop Execution
  const handleStopExecution = useCallback(() => {
    if (activeSessionIdRef.current) {
      killTerminalSessionApi(activeSessionIdRef.current);
      activeSessionIdRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus('system_error');
    setStderr('Execution stopped by user.');
    setStdout((prev) => prev + '\n=== Execution stopped by user ===\n');
  }, []);

  // Reset Starter Code
  const handleResetCode = () => {
    const config = getLanguageConfig(language);
    setCode(config.defaultCode);
    setActiveProgramTitle(null);
    setStdin('');
    setStdout('');
    setStderr('');
    setStatus('idle');
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Upload Code File
  const handleUploadCode = (uploadedContent: string, detectedLang?: SupportedLanguageId) => {
    setCode(uploadedContent);
    if (detectedLang) {
      prevInitialLangRef.current = detectedLang;
      setLanguage(detectedLang);
      if (onLanguageChange) {
        onLanguageChange(detectedLang);
      }
    }
    setActiveProgramTitle('Uploaded File');
    setStatus('idle');
    setStdout('');
    setStderr('');
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Clear Output
  const handleClearOutput = () => {
    setStdout('');
    setStderr('');
    setStatus('idle');
  };

  return (
    <div
      id="compiler-ide-container"
      className={`flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden transition-colors ${
        theme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'
      }`}
    >
      {/* 1. TOP TOOLBAR */}
      <TopToolbar
        language={language}
        onSelectLanguage={handleSelectLanguage}
        isRunning={status === 'running'}
        onRun={handleRunCode}
        onStop={handleStopExecution}
        onReset={handleResetCode}
        onCopy={handleCopyCode}
        isCopied={isCopied}
        onUploadCode={handleUploadCode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        layoutMode={layoutMode}
        onToggleLayout={() => setLayoutMode(layoutMode === 'side-by-side' ? 'bottom' : 'side-by-side')}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
        theme={theme}
        activeProgramTitle={activeProgramTitle}
      />

      {/* COMPILER WORKSPACE TEST AD 1 (Top Sub-toolbar Ad) */}
      <TestAdBanner
        format="slim"
        slotId="compiler-workspace-top"
        theme={theme}
      />

      {/* 2. EDITOR + OUTPUT SPLIT LAYOUT (Matching screenshot layout) */}
      <div
        id="compiler-split-container"
        className={`flex-1 flex min-h-0 overflow-hidden relative ${
          layoutMode === 'side-by-side' ? 'flex-col md:flex-row' : 'flex-col'
        }`}
      >
        {/* Editor Area */}
        <div
          className="min-h-0 relative flex flex-col overflow-hidden"
          style={
            layoutMode === 'side-by-side'
              ? { width: `${editorWidthPercent}%`, flexShrink: 0 }
              : { height: `${editorWidthPercent}%`, flexShrink: 0 }
          }
        >
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            language={language}
            theme={theme}
            settings={editorSettings}
            onRun={handleRunCode}
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onAddTab={handleAddTab}
            onAddAdTab={handleAddAdTab}
            onCloseTab={handleCloseTab}
            onRenameTab={handleRenameTab}
          />
        </div>

        {/* Resizer Handle: exactly matching user screenshot with 6-dot gripper and <-> icon */}
        <div
          id="split-resizer-handle"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          title={layoutMode === 'side-by-side' ? 'Drag to resize editor & output' : 'Drag to resize'}
          className={`select-none z-20 flex items-center justify-center transition-colors group ${
            layoutMode === 'side-by-side'
              ? `w-3 hover:w-3.5 cursor-col-resize border-x ${theme === 'dark' ? 'border-slate-800 bg-[#0f1422]' : 'border-slate-300 bg-slate-100'}`
              : `h-3 hover:h-3.5 cursor-row-resize border-y ${theme === 'dark' ? 'border-slate-800 bg-[#0f1422]' : 'border-slate-300 bg-slate-100'}`
          }`}
        >
          <div className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded shadow-sm transition-colors ${
            theme === 'dark'
              ? 'bg-[#1e2330] border border-slate-700/80 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500'
              : 'bg-white border border-slate-300 text-slate-600 group-hover:text-blue-600 group-hover:border-blue-400'
          }`}>
            <GripVertical className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono leading-none tracking-tighter select-none">&harr;</span>
          </div>
        </div>

        {/* Output Area */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <TerminalPanel
            output={stdout}
            error={stderr}
            status={status}
            theme={theme}
            stdin={stdin}
            onStdinChange={setStdin}
            onClearOutput={handleClearOutput}
            onRun={handleRunCode}
            onSendInput={handleSendInput}
            onSendEof={handleSendEof}
            inputMode={inputMode}
            onInputModeChange={setInputMode}
          />
        </div>
      </div>

      {/* COMPILER WORKSPACE TEST AD 2 (Bottom Ad taking the former status bar space) */}
      <TestAdBanner
        format="slim"
        slotId="compiler-workspace-bottom"
        theme={theme}
        className="border-t border-b-0 py-2 shadow-sm"
      />

      {/* MODALS */}
      <EditorSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={editorSettings}
        onChangeSettings={setEditorSettings}
        theme={theme}
      />

      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};
