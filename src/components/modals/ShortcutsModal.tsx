import React from 'react';
import { X, Keyboard, Command, Sparkles } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter / ⌘ + Enter', action: 'Execute & compile active code in sandbox' },
    { key: 'Ctrl + / / ⌘ + /', action: 'Toggle single-line comment' },
    { key: 'Ctrl + F / ⌘ + F', action: 'Find & search in code' },
    { key: 'Ctrl + H / ⌘ + H', action: 'Search and replace' },
    { key: 'Alt + Up / Down', action: 'Move line up or down' },
    { key: 'Shift + Alt + F', action: 'Format code indentation' },
    { key: 'F11', action: 'Toggle Fullscreen IDE mode' },
  ];

  return (
    <div
      id="shortcuts-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="shortcuts-modal-content"
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden p-6 transition-all ${
          theme === 'dark'
            ? 'bg-[#0f172a] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold text-base ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Editor Shortcuts</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Boost your workflow with Monaco hotkeys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2.5">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/40' : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-800 font-medium'}>{sc.action}</span>
              <kbd className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold ${
                theme === 'dark' ? 'bg-slate-900 border border-slate-700 text-blue-400 shadow-inner' : 'bg-white border border-slate-300 text-blue-700 shadow-sm'
              }`}>
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} flex justify-end`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
