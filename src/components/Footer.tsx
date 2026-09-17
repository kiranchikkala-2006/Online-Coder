import React from 'react';
import { Code2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/languages.ts';

interface FooterProps {
  theme: 'dark' | 'light';
  onSelectLanguage?: (langId: string) => void;
  onOpenFeatures?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  theme,
  onSelectLanguage,
  onOpenFeatures
}) => {
  return (
    <footer
      id="main-footer"
      className={`border-t transition-colors ${
        theme === 'dark'
          ? 'bg-[#0b0f19] border-slate-800 text-slate-200'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Code2 className="w-4 h-4 text-white stroke-[2.2]" />
              </div>
              <span className={`font-bold text-lg ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Online Coder
              </span>
            </div>
            <p className={`text-sm leading-relaxed max-w-md ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              A free, self-contained full-stack online code editor engineered for developers, educators, and learners. Zero databases, zero third-party APIs, and zero tracking.
            </p>
          </div>

          {/* Supported Languages quick pills */}
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
            }`}>
              Languages
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  id={`footer-lang-${lang.id}`}
                  onClick={() => onSelectLanguage && onSelectLanguage(lang.id)}
                  className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Architecture Spec */}
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
            }`}>
              Sandbox Blueprint
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>Memory Ceiling:</span>
                <span className={`font-mono font-semibold ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}>128 MB</span>
              </li>
              <li className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>CPU Timeout:</span>
                <span className={`font-mono font-semibold ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}>5.0 seconds</span>
              </li>
              <li className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>Network:</span>
                <span className={`font-mono font-semibold ${
                  theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'
                }`}>Airgapped (none)</span>
              </li>
              <li className="flex items-center justify-between">
                <span className={theme === 'dark' ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>Privileges:</span>
                <span className={`font-mono font-semibold ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>Non-root (1000)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200'
        }`}>
          <p className={theme === 'dark' ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>
            © {new Date().getFullYear()} Online Coder. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Built for precision & privacy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
