import React, { useState } from 'react';
import {
  Layers,
  Play,
  Copy,
  Check,
  Code2,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/languages.ts';
import { SupportedLanguageId, LanguageConfig } from '../types/index.ts';
import { LanguageIcon } from '../components/common/LanguageIcon.tsx';
import { TestAdBanner } from '../components/common/TestAdBanner.tsx';

interface LanguagesPageProps {
  onSelectLanguage: (langId: SupportedLanguageId) => void;
  theme: 'dark' | 'light';
}

export const LanguagesPage: React.FC<LanguagesPageProps> = ({
  onSelectLanguage,
  theme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Compiled', 'Interpreted', 'Systems', 'Web & Scripting', 'Enterprise'];

  const filtered = selectedCategory === 'All'
    ? SUPPORTED_LANGUAGES
    : SUPPORTED_LANGUAGES.filter((l) => l.category === selectedCategory);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="languages-page-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 sm:space-y-5">
      {/* Compact, Well-Proportioned Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          theme === 'dark'
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          <Layers className="w-3.5 h-3.5" />
          <span>10 Runtimes Available</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          Supported Programming Languages
        </h1>
        <p className={`text-xs sm:text-sm leading-normal max-w-xl mx-auto ${
          theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Each environment runs in an isolated, resource-capped container sandbox. Click &quot;Start Coding&quot; to immediately launch the IDE.
        </p>
      </div>

      {/* Category Filter Pills - Compact & Centered */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                : theme === 'dark'
                ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Language Cards Grid - Tightly fitted and clean */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
        {filtered.map((lang: LanguageConfig, index: number) => (
          <React.Fragment key={lang.id}>
            <div
              id={`lang-card-${lang.id}`}
              className={`flex flex-col rounded-xl border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
                theme === 'dark'
                  ? 'bg-[#0f172a] border-slate-800 text-slate-100 hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Top Card Info */}
              <div className={`p-4 pb-3 border-b ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'} flex-1`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <LanguageIcon language={lang.id} size={28} />
                    <div>
                      <h3 className="font-bold text-base leading-tight flex items-center gap-1.5">
                        {lang.name}
                        {lang.popular && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono">
                            POPULAR
                          </span>
                        )}
                      </h3>
                      <span className={`text-[11px] font-medium ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {lang.version}
                      </span>
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                    theme === 'dark'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {lang.extension}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed line-clamp-2 mb-2.5 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {lang.description}
                </p>

                {/* Specs Chips */}
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  <span className={`px-2 py-0.5 rounded border font-medium ${
                    theme === 'dark' ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {lang.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded border font-medium truncate max-w-[170px] ${
                    theme === 'dark' ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`} title={lang.runCmd}>
                    ▶ {lang.runCmd}
                  </span>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="relative bg-[#090d16] p-3 text-xs font-mono text-slate-200 border-t border-b border-slate-800/60 h-24 flex items-start overflow-hidden">
                <div className="absolute right-2 top-2 z-10">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(lang.id, lang.defaultCode)}
                    title="Copy snippet"
                    className="p-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                  >
                    {copiedId === lang.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <pre className="text-[11px] leading-relaxed select-none opacity-90 text-slate-300 pr-7 overflow-hidden w-full">
                  {lang.defaultCode}
                </pre>
              </div>

              {/* Action Bar */}
              <div className={`px-3.5 py-2.5 flex items-center justify-between gap-2 border-t ${
                theme === 'dark' ? 'bg-slate-900/50 border-slate-800/60' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className={`text-[11px] font-mono font-medium ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Default: {lang.filename}
                </div>
                <button
                  id={`start-coding-${lang.id}`}
                  onClick={() => onSelectLanguage(lang.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Coding</span>
                </button>
              </div>
            </div>

            {/* In-feed Test Ad Card after the 3rd item */}
            {index === 2 && (
              <TestAdBanner
                format="card"
                slotId="languages-infeed-card"
                theme={theme}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Leaderboard Test Ad */}
      <div className="pt-4">
        <TestAdBanner
          format="leaderboard"
          slotId="languages-bottom-leaderboard"
          theme={theme}
        />
      </div>
    </div>
  );
};
