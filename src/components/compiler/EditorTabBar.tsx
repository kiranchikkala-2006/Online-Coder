import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Sparkles, Megaphone, FileCode, Check, ExternalLink } from 'lucide-react';
import { EditorTab, SupportedLanguageId } from '../../types/index.ts';
import { getLanguageConfig, detectLanguageFromFilename } from '../../config/languages.ts';

interface EditorTabBarProps {
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onAddTab: (customName?: string) => void;
  onAddAdTab?: () => void;
  onCloseTab: (tabId: string) => void;
  onRenameTab: (tabId: string, newName: string) => void;
  theme: 'dark' | 'light';
  currentLanguage: SupportedLanguageId;
}

export const EditorTabBar: React.FC<EditorTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onAddAdTab,
  onCloseTab,
  onRenameTab,
  theme,
  currentLanguage,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleStartRename = (tab: EditorTab, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tab.isAd) return;
    setEditingTabId(tab.id);
    setEditingName(tab.name);
  };

  const handleSaveRename = (tabId: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      onRenameTab(tabId, trimmed);
    }
    setEditingTabId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(tabId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  const getTabIcon = (tab: EditorTab) => {
    if (tab.isAd) {
      return <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    const detectedLang = detectLanguageFromFilename(tab.name) || tab.language;
    const config = getLanguageConfig(detectedLang);
    return (
      <span className="text-sm leading-none shrink-0" role="img" aria-label={config.name}>
        {config.icon || '📄'}
      </span>
    );
  };

  return (
    <div
      id="editor-tab-bar"
      className={`w-full h-9 flex items-center justify-between border-b px-1 select-none overflow-x-auto no-scrollbar shrink-0 transition-colors ${
        theme === 'dark'
          ? 'bg-[#0b0f19] border-slate-800/80 text-slate-300'
          : 'bg-[#f1f5f9] border-slate-200 text-slate-700'
      }`}
    >
      {/* Left side: Tabs list + '+' button (matching screenshot) */}
      <div className="flex items-center h-full min-w-0 flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isEditing = editingTabId === tab.id;

          return (
            <div
              key={tab.id}
              id={`editor-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              onDoubleClick={(e) => handleStartRename(tab, e)}
              title={tab.isAd ? 'Sponsored Ad Tab' : `Double click to rename ${tab.name}`}
              className={`group relative h-full flex items-center gap-2 px-3 text-xs font-mono border-r transition-all cursor-pointer shrink-0 ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-[#0f172a] text-slate-100 border-r-slate-800 border-t-2 border-t-blue-500 font-semibold shadow-xs'
                    : 'bg-white text-slate-900 border-r-slate-200 border-t-2 border-t-blue-600 font-semibold shadow-xs'
                  : theme === 'dark'
                    ? 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-r-slate-800/60'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border-r-slate-200'
              } ${tab.isAd ? (theme === 'dark' ? 'border-t-amber-500/80' : 'border-t-amber-600') : ''}`}
            >
              {/* Tab Icon */}
              {getTabIcon(tab)}

              {/* Tab Name or Inline Rename Field */}
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSaveRename(tab.id)}
                    onKeyDown={(e) => handleKeyDown(e, tab.id)}
                    className={`px-1 py-0.5 rounded text-xs outline-hidden font-mono w-24 ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-white border border-blue-500'
                        : 'bg-white text-slate-900 border border-blue-500'
                    }`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveRename(tab.id);
                    }}
                    className="p-0.5 rounded hover:bg-blue-600 text-white cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="truncate max-w-[130px]">
                  {tab.name}
                </span>
              )}

              {/* Ad badge if sponsored tab */}
              {tab.isAd && (
                <span className="text-[9px] font-sans px-1 py-0.2 rounded font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                  Ad
                </span>
              )}

              {/* Close Button '✕' */}
              <button
                id={`close-tab-${tab.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className={`p-0.5 ml-0.5 rounded transition-all cursor-pointer ${
                  isActive
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    : 'text-slate-500 group-hover:text-slate-300 hover:bg-slate-700/40'
                }`}
                title="Close tab"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* The '+' button right beside tabs (matches screenshot) */}
        <button
          id="editor-add-tab-btn"
          onClick={() => onAddTab()}
          title="Add new file tab (+)"
          className={`flex items-center justify-center w-7 h-7 my-auto ml-1 rounded-md transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/80'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right side: Quick New File Tab */}
      <div className="flex items-center gap-1.5 px-2 shrink-0">
        <button
          id="editor-quick-new-tab-btn"
          onClick={() => onAddTab()}
          title="Create another code tab"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
          }`}
        >
          <FileCode className="w-3 h-3 text-blue-400" />
          <span className="hidden md:inline font-mono">+ File</span>
        </button>
      </div>
    </div>
  );
};
