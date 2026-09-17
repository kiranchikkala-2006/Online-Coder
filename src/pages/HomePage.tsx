import React from 'react';
import {
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  DatabaseZap,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/languages.ts';
import { SupportedLanguageId } from '../types/index.ts';
import { LanguageIcon } from '../components/common/LanguageIcon.tsx';
import { TestAdBanner } from '../components/common/TestAdBanner.tsx';

interface HomePageProps {
  onNavigate: (tab: string, langId?: SupportedLanguageId) => void;
  theme: 'dark' | 'light';
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, theme }) => {
  return (
    <div id="home-page-view" className="w-full px-2 sm:px-4 lg:px-6 py-3 pb-12 flex justify-center items-start gap-4 xl:gap-6">
      {/* LEFT TEST AD (Where marked on screenshot) */}
      <aside aria-label="Advertisement Left" className="hidden lg:block shrink-0 w-[160px] sticky top-20">
        <TestAdBanner
          format="skyscraper"
          slotId="home-left-skyscraper"
          theme={theme}
        />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl min-w-0 space-y-10 sm:space-y-12">
        {/* 1. HERO SECTION */}
        <section className="pt-2 sm:pt-4 pb-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Write. <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Compile.</span> Run.
              </h1>

              <p className={`text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                A fast, secure and free online coder for multiple programming languages. Powered by isolated Docker sandboxes and Monaco Editor with zero accounts and zero third-party API dependencies.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <button
                  id="hero-start-coding-btn"
                  onClick={() => onNavigate('compiler')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Coding</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="hero-explore-languages-btn"
                  onClick={() => onNavigate('languages')}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>All Languages</span>
                </button>
              </div>

              {/* Micro specs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 10 Languages
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 128MB RAM Limit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Client Privacy
                </span>
              </div>
            </div>

            {/* Right Hero: Supported Languages Grid (10 Cards) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <div
                    key={lang.id}
                    id={`hero-lang-${lang.id}`}
                    onClick={() => onNavigate('compiler', lang.id)}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${
                      theme === 'dark'
                        ? 'bg-[#0c1322] border-slate-800 hover:border-blue-500/50 hover:bg-[#0f172a]'
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <LanguageIcon language={lang.id} size={24} />
                      <span className={`text-[11px] font-mono font-medium px-2 py-0.2 rounded-md border ${
                        theme === 'dark'
                          ? 'bg-[#132347] text-blue-400 border-blue-500/30'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {lang.extension}
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm transition-colors ${
                      theme === 'dark' ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                    }`}>
                      {lang.name}
                    </h3>
                    <p className={`text-[11px] mt-0.5 line-clamp-1 font-medium ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {lang.version}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TEST AD: MID-PAGE LEADERBOARD */}
        <section>
          <TestAdBanner
            format="leaderboard"
            slotId="home-mid-leaderboard"
            theme={theme}
          />
        </section>

        {/* 2. CORE ARCHITECTURAL PILLARS */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Why Developers Choose Online Coder
            </h2>
            <p className={`text-xs sm:text-sm mt-1.5 font-normal ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Built from first principles for security, speed, and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className={`p-5 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className={`text-sm sm:text-base font-semibold mb-1.5 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Docker Isolated Sandbox
              </h3>
              <p className={`text-xs leading-relaxed ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Every execution runs in a hardened container with disabled network access (<code className="text-blue-400 font-semibold">--network none</code>), 128MB RAM caps, and non-root execution.
              </p>
            </div>

            {/* Card 2 */}
            <div className={`p-5 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <DatabaseZap className="w-4.5 h-4.5" />
              </div>
              <h3 className={`text-sm sm:text-base font-semibold mb-1.5 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Zero Database • 100% Private
              </h3>
              <p className={`text-xs leading-relaxed ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                No MongoDB, PostgreSQL, or Firebase accounts required. Zero cloud database tracking and 100% private in-browser execution.
              </p>
            </div>

            {/* Card 3 */}
            <div className={`p-5 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <h3 className={`text-sm sm:text-base font-semibold mb-1.5 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Monaco IDE Experience
              </h3>
              <p className={`text-xs leading-relaxed ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Full VS Code editor capabilities: syntax highlighting, auto-completion, bracket matching, search & replace, and customizable themes.
              </p>
            </div>
          </div>
        </section>

        {/* TEST AD: BOTTOM LEADERBOARD */}
        <section>
          <TestAdBanner
            format="leaderboard"
            slotId="home-footer-leaderboard"
            theme={theme}
          />
        </section>

        {/* 3. CALL TO ACTION BANNER */}
        <section>
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-6 sm:p-8 text-center text-white shadow-lg">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ready to test your code?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-md mx-auto mt-1.5 mb-5">
              Jump into our distraction-free online IDE. Pick any language and run programs in seconds.
            </p>
            <button
              onClick={() => onNavigate('compiler')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white text-blue-600 hover:bg-blue-50 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Launch Compiler IDE
            </button>
          </div>
        </section>
      </main>

      {/* RIGHT TEST AD (Where marked on screenshot) */}
      <aside aria-label="Advertisement Right" className="hidden lg:block shrink-0 w-[160px] sticky top-20">
        <TestAdBanner
          format="skyscraper"
          slotId="home-right-skyscraper"
          theme={theme}
        />
      </aside>
    </div>
  );
};
