import React from 'react';
import { X, Settings, Sliders, Type, Columns, WrapText } from 'lucide-react';
import { EditorSettings } from '../../types/index.ts';

interface EditorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onChangeSettings: (newSettings: EditorSettings) => void;
  theme: 'dark' | 'light';
}

export const EditorSettingsModal: React.FC<EditorSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="editor-settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="editor-settings-modal-content"
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden p-6 transition-all ${
          theme === 'dark'
            ? 'bg-[#0f172a] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold text-base ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Editor Preferences</h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Customize Monaco IDE typography & behaviors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Font Size */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                <Type className="w-3.5 h-3.5 text-blue-400" />
                Font Size:
              </span>
              <span className="font-mono text-blue-400">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              step={1}
              value={settings.fontSize}
              onChange={(e) =>
                onChangeSettings({ ...settings, fontSize: parseInt(e.target.value, 10) })
              }
              className={`w-full h-1.5 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded-lg appearance-none cursor-pointer accent-blue-500`}
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>12px</span>
              <span>14px (Default)</span>
              <span>24px</span>
            </div>
          </div>

          {/* Tab Spacing */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                <Columns className="w-3.5 h-3.5 text-blue-400" />
                Tab Size:
              </span>
              <span className="font-mono text-blue-400">{settings.tabSize} spaces</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChangeSettings({ ...settings, tabSize: size })}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    settings.tabSize === size
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                      : theme === 'dark'
                      ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {size} Spaces
                </button>
              ))}
            </div>
          </div>

          {/* Minimap Toggle */}
          <div className={`flex items-center justify-between py-2 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
              <div className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Show Minimap</div>
              <div className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Right-side code outline overview</div>
            </div>
            <button
              type="button"
              onClick={() => onChangeSettings({ ...settings, minimap: !settings.minimap })}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.minimap ? 'bg-blue-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.minimap ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Word Wrap Toggle */}
          <div className={`flex items-center justify-between py-2 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
              <div className={`text-xs font-semibold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                <WrapText className="w-3.5 h-3.5 text-blue-400" />
                Word Wrap
              </div>
              <div className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Wrap long code lines inside viewport</div>
            </div>
            <button
              type="button"
              onClick={() =>
                onChangeSettings({
                  ...settings,
                  wordWrap: settings.wordWrap === 'on' ? 'off' : 'on',
                })
              }
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.wordWrap === 'on' ? 'bg-blue-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.wordWrap === 'on' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} flex justify-end`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
