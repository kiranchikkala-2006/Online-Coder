import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { EditorSettings, SupportedLanguageId, EditorTab } from '../../types/index.ts';
import { getLanguageConfig, detectLanguageFromFilename } from '../../config/languages.ts';
import { EditorTabBar } from './EditorTabBar.tsx';
import { AdTabContent } from './AdTabContent.tsx';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: SupportedLanguageId;
  theme: 'dark' | 'light';
  settings: EditorSettings;
  onRun?: () => void;
  tabs?: EditorTab[];
  activeTabId?: string;
  onSelectTab?: (tabId: string) => void;
  onAddTab?: (customName?: string) => void;
  onAddAdTab?: () => void;
  onCloseTab?: (tabId: string) => void;
  onRenameTab?: (tabId: string, newName: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  theme,
  settings,
  onRun,
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onAddAdTab,
  onCloseTab,
  onRenameTab,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Active tab resolution
  const activeTab = tabs && activeTabId ? tabs.find((t) => t.id === activeTabId) : null;
  const effectiveLanguage = activeTab && !activeTab.isAd
    ? (detectLanguageFromFilename(activeTab.name) || activeTab.language || language)
    : language;
  const langConfig = getLanguageConfig(effectiveLanguage);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add keyboard shortcuts inside Monaco Editor
    // 1. Ctrl+Enter / Cmd+Enter => Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) {
        onRun();
      }
    });

    // 2. Ctrl+S / Cmd+S => Prevent browser default page save dialog
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save programs option removed
    });

    // Define refined custom themes for polished contrast
    monaco.editor.defineTheme('compiler-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'string', foreground: '4ade80' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: 'c084fc' },
        { token: 'function', foreground: '60a5fa' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#f8fafc',
        'editorCursor.foreground': '#38bdf8',
        'editor.lineHighlightBackground': '#1e293b55',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#cbd5e1',
        'editor.selectionBackground': '#33415588',
        'editorIndentGuide.background': '#1e293b',
        'editorIndentGuide.activeBackground': '#334155',
      },
    });

    monaco.editor.defineTheme('compiler-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '475569', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'string', foreground: '16a34a' },
        { token: 'number', foreground: 'd97706' },
        { token: 'type', foreground: '9333ea' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editorCursor.foreground': '#0284c7',
        'editor.lineHighlightBackground': '#f1f5f988',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#0f172a',
        'editor.selectionBackground': '#e2e8f0',
      },
    });

    monaco.editor.setTheme(theme === 'dark' ? 'compiler-dark' : 'compiler-light');
  };

  // Update theme dynamically
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'compiler-dark' : 'compiler-light');
    }
  }, [theme]);

  // Update Monaco model language dynamically when language selection changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model && langConfig?.monacoLang) {
        monacoRef.current.editor.setModelLanguage(model, langConfig.monacoLang);
      }
    }
  }, [language, langConfig?.monacoLang]);

  // Synchronize editor value when code changes externally (e.g. language selection or load)
  useEffect(() => {
    if (editorRef.current) {
      const currentVal = editorRef.current.getValue();
      if (currentVal !== code) {
        editorRef.current.setValue(code);
      }
    }
  }, [code]);

  return (
    <div id="monaco-editor-container" className="w-full h-full relative flex flex-col overflow-hidden">
      {/* 1. Tab bar directly atop editor, matching screenshot */}
      {tabs && activeTabId && (
        <EditorTabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={onSelectTab!}
          onAddTab={onAddTab!}
          onAddAdTab={onAddAdTab!}
          onCloseTab={onCloseTab!}
          onRenameTab={onRenameTab!}
          theme={theme}
          currentLanguage={language}
        />
      )}

      {/* 2. Content area: Ad Tab or Monaco Code Editor */}
      <div className="flex-1 min-h-0 relative">
        {activeTab?.isAd ? (
          <AdTabContent
            tab={activeTab}
            theme={theme}
            onClose={() => onCloseTab && onCloseTab(activeTab.id)}
          />
        ) : (
          <Editor
            height="100%"
            width="100%"
            language={langConfig.monacoLang}
            value={code}
            onChange={(val) => onChange(val || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            onMount={handleEditorDidMount}
            loading={
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                <span className="animate-spin mr-2">⟳</span> Initializing Monaco Editor...
              </div>
            }
            options={{
              fontSize: settings.fontSize,
              tabSize: settings.tabSize,
              minimap: { enabled: settings.minimap },
              wordWrap: settings.wordWrap,
              lineNumbers: settings.lineNumbers,
              autoClosingBrackets: settings.autoClosingBrackets,
              bracketPairColorization: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace",
              fontLigatures: true,
              padding: { top: 12, bottom: 12 },
              folding: true,
              renderLineHighlight: 'all',
              contextmenu: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
            }}
          />
        )}
      </div>
    </div>
  );
};
