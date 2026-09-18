import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import { TopToolbar } from '../components/compiler/TopToolbar.tsx';
import { CodeEditor } from '../components/compiler/CodeEditor.tsx';
import { TerminalPanel } from '../components/compiler/TerminalPanel.tsx';
import { EditorSettingsModal } from '../components/compiler/EditorSettingsModal.tsx';
import { ShortcutsModal } from '../components/modals/ShortcutsModal.tsx';
import { TestAdBanner } from '../components/common/TestAdBanner.tsx';

import {
  SupportedLanguageId,
  ExecutionStatus,
  EditorSettings,
  EditorTab,
} from '../types/index.ts';

import { GripVertical } from 'lucide-react';

import {
  getLanguageConfig,
  detectLanguageFromFilename,
} from '../config/languages.ts';

import {
  saveLastSession,
  loadLastSession,
} from '../services/storage.ts';


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

  // =========================================================
  // LANGUAGE
  // =========================================================

  const [language, setLanguage] = useState<SupportedLanguageId>(() => {
    const saved = loadLastSession();
    return saved?.language || initialLanguage;
  });

  const prevInitialLangRef = useRef<SupportedLanguageId>(language);


  // =========================================================
  // TABS & CODE STATE (Single Source of Truth)
  // =========================================================

  const [tabs, setTabs] = useState<EditorTab[]>(() => {
    const saved = loadLastSession();
    const activeLang = saved?.language || initialLanguage;
    const config = getLanguageConfig(activeLang as SupportedLanguageId);
    
    let initialCode = config.defaultCode;

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
        initialCode = saved.code;
      }
    }

    return [
      {
        id: 'tab-main',
        name: config.filename,
        code: initialCode,
        language: activeLang as SupportedLanguageId,
        isAd: false,
      },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>('tab-main');

  // Derive active code directly from the selected tab
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeCode = activeTab && !activeTab.isAd ? activeTab.code : '';


  // =========================================================
  // INPUT & METADATA
  // =========================================================

  const [stdin, setStdin] = useState<string>('');
  const [inputMode, setInputMode] = useState<'interactive' | 'batch'>('interactive');
  const [activeProgramTitle, setActiveProgramTitle] = useState<string | null>(null);


  // =========================================================
  // AD PRESETS
  // =========================================================

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


  // =========================================================
  // TAB OPERATIONS
  // =========================================================

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleCodeChange = (newCode: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, code: newCode }
          : tab
      )
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
      return;
    }

    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const fallbackTab = newTabs[newTabs.length - 1];
      setActiveTabId(fallbackTab.id);
    }
  };

  const handleRenameTab = (tabId: string, newName: string) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === tabId) {
          const detected = detectLanguageFromFilename(newName);
          return {
            ...tab,
            name: newName,
            language: detected || tab.language,
          };
        }
        return tab;
      })
    );
  };


  // =========================================================
  // EXECUTION STATE
  // =========================================================

  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Store the abort controller to cancel pending API requests
  const abortControllerRef = useRef<AbortController | null>(null);


  // =========================================================
  // MODALS
  // =========================================================

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);


  // =========================================================
  // SPLIT LAYOUT
  // =========================================================

  const [layoutMode, setLayoutMode] = useState<'side-by-side' | 'bottom'>('side-by-side');
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(55);
  const [isDragging, setIsDragging] = useState<boolean>(false);

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

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, layoutMode]);


  // =========================================================
  // EDITOR SETTINGS
  // =========================================================

  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 14,
    tabSize: 4,
    minimap: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    autoClosingBrackets: 'always',
  });


  // =========================================================
  // INITIAL LANGUAGE CHANGE & AUTO-SAVE
  // =========================================================

  useEffect(() => {
    if (initialLanguage && initialLanguage !== prevInitialLangRef.current) {
      prevInitialLangRef.current = initialLanguage;
      setLanguage(initialLanguage);

      // Overwrite the main tab with the new language config
      const config = getLanguageConfig(initialLanguage);
      setTabs((prev) => {
        const hasMain = prev.some((t) => t.id === 'tab-main');
        if (hasMain) {
          return prev.map((t) =>
            t.id === 'tab-main'
              ? { ...t, name: config.filename, code: config.defaultCode, language: initialLanguage }
              : t
          );
        }
        return [
          { id: 'tab-main', name: config.filename, code: config.defaultCode, language: initialLanguage, isAd: false },
          ...prev,
        ];
      });

      setActiveTabId('tab-main');
      setActiveProgramTitle(null);
      setStdin('');
      setStdout('');
      setStderr('');
      setStatus('idle');
    }
  }, [initialLanguage]);

  useEffect(() => {
    saveLastSession({
      language,
      code: activeCode,
      input: '',
      activeProgramId: null,
      activeProgramTitle,
    });
  }, [language, activeCode, activeProgramTitle]);


  // =========================================================
  // LANGUAGE SWITCH
  // =========================================================

  const handleSelectLanguage = (newLang: SupportedLanguageId) => {
    if (newLang === language) return;
    prevInitialLangRef.current = newLang;
    setLanguage(newLang);
    if (onLanguageChange) onLanguageChange(newLang);

    const config = getLanguageConfig(newLang);
    
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
        { id: 'tab-main', name: config.filename, code: config.defaultCode, language: newLang, isAd: false },
        ...prev,
      ];
    });

    setActiveTabId('tab-main');
    setActiveProgramTitle(null);
    setStdin('');
    setStdout('');
    setStderr('');
    setStatus('idle');
  };


  // =========================================================
  // RUN CODE
  // =========================================================

  const handleRunCode = useCallback(async () => {
    if (status === 'running') return;

    // Execute active tab if it's code, otherwise fallback to the first code tab available
    const activeNonAdTab = tabs.find((t) => t.id === activeTabId && !t.isAd) || tabs.find((t) => !t.isAd);
    const codeToRun = activeNonAdTab?.code || '';

    if (!codeToRun.trim()) {
      setStatus('system_error');
      setStderr('Error: Cannot execute empty source code. Please write some code first.');
      return;
    }

    setStatus('running');
    setStdout('');
    setStderr('');
    setExecutionTime(0);

    // Create a new AbortController for this run
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: String(language),
          code: codeToRun,
          input: stdin || '',
        }),
        signal: abortControllerRef.current.signal, // Attach the abort signal here
      });

      const responseText = await response.text();
      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Server returned an invalid response: ${responseText.slice(0, 300)}`);
      }

      if (!response.ok) {
        const errorMessage = data?.error || 'Code execution failed.';
        setStatus('system_error');
        setStderr(errorMessage);
        setStdout(`${errorMessage}\n=== Code Execution Failed ===\n`);
        return;
      }

      setStdout(data?.output || '');
      setStderr(data?.error || '');
      setExecutionTime(Number(data?.executionTime || 0));

      if (data?.status === 'success') {
        setStatus('success');
      } else if (data?.status === 'runtime_error') {
        setStatus('runtime_error');
      } else if (data?.status === 'compilation_error') {
        setStatus('compilation_error');
      } else {
        setStatus('system_error');
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Execution explicitly aborted by user.');
        return;
      }

      console.error('Code execution error:', error);
      const message = error?.message || 'Execution request failed.';
      setStatus('system_error');
      setStderr(message);
      setStdout(`${message}\n=== Code Execution Failed ===\n`);
    }
  }, [status, tabs, activeTabId, language, stdin]);


  // =========================================================
  // STOP EXECUTION
  // =========================================================

  const handleStopExecution = useCallback(() => {
    if (status !== 'running') return;

    // Trigger the abort controller to cancel the HTTP fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setStatus('system_error');
    setStderr('Execution stopped by user.');
    setStdout((prev) => prev + '\n=== Execution stopped by user ===\n');
  }, [status]);


  // =========================================================
  // INPUT & EOF
  // =========================================================

  const handleSendInput = useCallback((inputLine: string) => {
    setStdin((prev) => (prev ? `${prev}\n${inputLine}` : inputLine));
    setStdout((prev) => prev + inputLine + '\n');
  }, []);

  const handleSendEof = useCallback(async () => {
    setStdout((prev) => prev + '\n[EOF / Ctrl+D]\n');
  }, []);


  // =========================================================
  // RESET, COPY, UPLOAD, CLEAR
  // =========================================================

  const handleResetCode = () => {
    const config = getLanguageConfig(language);
    
    // Reset only the currently active tab
    setTabs((prev) => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, code: config.defaultCode } 
        : tab
    ));

    setActiveProgramTitle(null);
    setStdin('');
    setStdout('');
    setStderr('');
    setStatus('idle');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUploadCode = (uploadedContent: string, detectedLang?: SupportedLanguageId) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              code: uploadedContent,
              language: detectedLang || tab.language,
            }
          : tab
      )
    );

    if (detectedLang) {
      prevInitialLangRef.current = detectedLang;
      setLanguage(detectedLang);
      if (onLanguageChange) onLanguageChange(detectedLang);
    }

    setActiveProgramTitle('Uploaded File');
    setStatus('idle');
    setStdout('');
    setStderr('');
  };

  const handleClearOutput = () => {
    setStdout('');
    setStderr('');
    setStatus('idle');
  };

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


  // =========================================================
  // UI RENDER
  // =========================================================

  return (
    <div
      id="compiler-ide-container"
      className={`
        flex flex-col
        h-[calc(100vh-3.5rem)]
        overflow-hidden
        transition-colors
        ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}
      `}
    >
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
        onToggleLayout={() =>
          setLayoutMode(layoutMode === 'side-by-side' ? 'bottom' : 'side-by-side')
        }
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
        theme={theme}
        activeProgramTitle={activeProgramTitle}
      />

      <TestAdBanner format="slim" slotId="compiler-workspace-top" theme={theme} />

      <div
        id="compiler-split-container"
        className={`
          flex-1 flex min-h-0 overflow-hidden relative
          ${layoutMode === 'side-by-side' ? 'flex-col md:flex-row' : 'flex-col'}
        `}
      >
        <div
          className="min-h-0 relative flex flex-col overflow-hidden"
          style={
            layoutMode === 'side-by-side'
              ? { width: `${editorWidthPercent}%`, flexShrink: 0 }
              : { height: `${editorWidthPercent}%`, flexShrink: 0 }
          }
        >
          <CodeEditor
            code={activeCode}
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

        <div
          id="split-resizer-handle"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          title={layoutMode === 'side-by-side' ? 'Drag to resize editor & output' : 'Drag to resize'}
          className={`
            select-none z-20 flex items-center justify-center transition-colors group
            ${
              layoutMode === 'side-by-side'
                ? `w-3 hover:w-3.5 cursor-col-resize border-x ${
                    theme === 'dark' ? 'border-slate-800 bg-[#0f1422]' : 'border-slate-300 bg-slate-100'
                  }`
                : `h-3 hover:h-3.5 cursor-row-resize border-y ${
                    theme === 'dark' ? 'border-slate-800 bg-[#0f1422]' : 'border-slate-300 bg-slate-100'
                  }`
            }
          `}
        >
          <div
            className={`
              flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded shadow-sm transition-colors
              ${
                theme === 'dark'
                  ? 'bg-[#1e2330] border border-slate-700/80 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500'
                  : 'bg-white border border-slate-300 text-slate-600 group-hover:text-blue-600 group-hover:border-blue-400'
              }
            `}
          >
            <GripVertical className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono leading-none tracking-tighter select-none">&harr;</span>
          </div>
        </div>

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

      <TestAdBanner
        format="slim"
        slotId="compiler-workspace-bottom"
        theme={theme}
        className="border-t border-b-0 py-2 shadow-sm"
      />

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