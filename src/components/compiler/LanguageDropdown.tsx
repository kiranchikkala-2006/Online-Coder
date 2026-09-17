import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../config/languages.ts';
import { SupportedLanguageId, LanguageConfig } from '../../types/index.ts';
import { LanguageIcon } from '../common/LanguageIcon.tsx';

interface LanguageDropdownProps {
  selectedLanguage: SupportedLanguageId;
  onSelectLanguage: (lang: SupportedLanguageId) => void;
  theme: 'dark' | 'light';
  disabled?: boolean;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  selectedLanguage,
  onSelectLanguage,
  theme,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(search.toLowerCase()) ||
    lang.id.toLowerCase().includes(search.toLowerCase()) ||
    lang.extension.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (langId: SupportedLanguageId) => {
    onSelectLanguage(langId);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        id="language-selector-btn"
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500/60'
        } ${
          theme === 'dark'
            ? 'bg-slate-900/95 hover:bg-slate-800/90 border-slate-700 text-slate-100 shadow-sm'
            : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
        }`}
      >
        <LanguageIcon language={currentLang.id} size={18} />
        <span className="font-medium tracking-tight">{currentLang.name}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium ${
          theme === 'dark' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-800 border border-slate-300'
        }`}>
          {currentLang.extension}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className={`absolute left-0 top-full mt-1.5 w-72 sm:w-80 rounded-xl border shadow-2xl z-[100] overflow-hidden select-text ${
            theme === 'dark'
              ? 'bg-[#111624] border-slate-700 text-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.6)]'
              : 'bg-white border-slate-200 text-slate-800 shadow-[0_12px_36px_rgba(0,0,0,0.15)]'
          }`}
        >
          {/* Search box */}
          <div className={`p-2 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${
              theme === 'dark'
                ? 'bg-slate-900/90 border-slate-700 text-slate-100'
                : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-300" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages (e.g. Java, Go, PHP)..."
                className={`w-full bg-transparent focus:outline-none text-xs ${
                  theme === 'dark' ? 'text-slate-100 placeholder:text-slate-400' : 'text-slate-900 placeholder:text-slate-500'
                }`}
              />
            </div>
          </div>

          {/* Languages list */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredLanguages.length === 0 ? (
              <div className={`py-6 text-center text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                No languages found matching "{search}"
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.id === selectedLanguage;
                return (
                  <button
                    key={lang.id}
                    id={`lang-option-${lang.id}`}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(lang.id);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(lang.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-blue-600/25 text-blue-300 font-semibold border border-blue-500/30'
                          : 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : theme === 'dark'
                        ? 'hover:bg-slate-800/90 text-slate-200'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LanguageIcon language={lang.id} size={20} />
                      <div className="text-left">
                        <div className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} flex items-center gap-1.5`}>
                          {lang.name}
                          {lang.popular && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono font-semibold">
                              HOT
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{lang.version}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[11px] font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{lang.extension}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
