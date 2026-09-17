import React, { useRef } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Upload,
  Maximize2,
  Minimize2,
  Settings2,
  Keyboard,
  Check,
  FileCode2,
  Sparkles,
  LogIn,
  Columns,
  Rows
} from 'lucide-react';
import { LanguageDropdown } from './LanguageDropdown.tsx';
import { SupportedLanguageId } from '../../types/index.ts';
import { getLanguageConfig, detectLanguageFromFilename } from '../../config/languages.ts';

interface TopToolbarProps {
  language: SupportedLanguageId;
  onSelectLanguage: (lang: SupportedLanguageId) => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onCopy: () => void;
  isCopied: boolean;
  onUploadCode: (code: string, detectedLang?: SupportedLanguageId) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  layoutMode?: 'side-by-side' | 'bottom';
  onToggleLayout?: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  theme: 'dark' | 'light';
  activeProgramTitle?: string | null;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  language,
  onSelectLanguage,
  isRunning,
  onRun,
  onStop,
  onReset,
  onCopy,
  isCopied,
  onUploadCode,
  isFullscreen,
  onToggleFullscreen,
  layoutMode = 'side-by-side',
  onToggleLayout,
  onOpenSettings,
  onOpenShortcuts,
  theme,
  activeProgramTitle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langConfig = getLanguageConfig(language);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const detected = detectLanguageFromFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onUploadCode(content, detected || undefined);
      }
    };
    reader.readAsText(file);
    // reset input so the same file can be uploaded again
    e.target.value = '';
  };

  return (
    <div
      id="compiler-top-toolbar"
      className={`px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 select-none transition-colors relative z-40 ${
        theme === 'dark'
          ? 'bg-[#0f172a] border-slate-800 text-slate-200'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}
    >
      {/* Left Section: Language Selector + Filename Tab */}
      <div className="flex items-center gap-2 flex-wrap">
        <LanguageDropdown
          selectedLanguage={language}
          onSelectLanguage={onSelectLanguage}
          theme={theme}
        />

        {/* Active Filename Pill */}
        <div
          id="active-filename-badge"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-700/80 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold">{langConfig.filename}</span>
          {activeProgramTitle && (
            <span className={`text-[10px] font-sans font-medium truncate max-w-[120px] ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              ({activeProgramTitle})
            </span>
          )}
        </div>
      </div>

      {/* Middle & Right Section: Action Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Hidden File Input for Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".py,.c,.cpp,.java,.js,.ts,.go,.rs,.kt,.php,.txt"
        />

        {/* Upload Button */}
        <button
          id="toolbar-upload-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload local code file"
          disabled={isRunning}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white'
              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Copy Button */}
        <button
          id="toolbar-copy-btn"
          type="button"
          onClick={onCopy}
          title="Copy code to clipboard"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            isCopied
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
              : theme === 'dark'
              ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white'
              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
          }`}
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
          <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Reset Starter Code */}
        <button
          id="toolbar-reset-btn"
          type="button"
          onClick={onReset}
          disabled={isRunning}
          title="Reset starter template"
          className={`p-1.5 rounded-lg border text-xs transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className={`h-4 w-[1px] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} mx-0.5 hidden sm:block`} />

        {/* Shortcuts Cheat Sheet */}
        <button
          id="toolbar-shortcuts-btn"
          type="button"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts"
          className={`p-1.5 rounded-lg border text-xs transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        {/* Settings Drawer Button */}
        <button
          id="toolbar-settings-btn"
          type="button"
          onClick={onOpenSettings}
          title="Editor Settings"
          className={`p-1.5 rounded-lg border text-xs transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          id="toolbar-fullscreen-btn"
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen IDE'}
          className={`p-1.5 rounded-lg border text-xs transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900'
          }`}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Split Layout Toggle: Side-by-Side vs Stacked */}
        {onToggleLayout && (
          <button
            id="toolbar-layout-btn"
            type="button"
            onClick={onToggleLayout}
            title={layoutMode === 'side-by-side' ? 'Switch to Bottom Output' : 'Switch to Side-by-Side'}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            {layoutMode === 'side-by-side' ? <Columns className="w-3.5 h-3.5" /> : <Rows className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Stop Button (Active during execution) */}
        {isRunning ? (
          <button
            id="toolbar-stop-btn"
            type="button"
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30 transition-all animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </button>
        ) : (
          /* Run Button */
          <button
            id="toolbar-run-btn"
            type="button"
            onClick={onRun}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
            <span className="hidden md:inline-block ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-black/20 rounded">
              Ctrl+↵
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
