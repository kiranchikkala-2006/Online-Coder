import React from 'react';
import { ExternalLink, Sparkles, Shield, Cpu, Zap, Megaphone, CheckCircle2 } from 'lucide-react';
import { EditorTab } from '../../types/index.ts';

interface AdTabContentProps {
  tab: EditorTab;
  theme: 'dark' | 'light';
  onClose: () => void;
}

export const AdTabContent: React.FC<AdTabContentProps> = ({
  tab,
  theme,
  onClose,
}) => {
  const ad = tab.adData || {
    sponsor: 'HyperCloud Compute',
    title: 'High-Performance Developer VPS & Sandboxes',
    tagline: 'Instant container spinup with AMD EPYC processors, dedicated NVMe SSDs, and 10Gbps unmetered bandwidth.',
    ctaText: 'Claim $100 Free Credit',
    badge: 'Verified Sponsor',
  };

  return (
    <div
      id={`ad-tab-content-${tab.id}`}
      className={`w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-y-auto ${
        theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className={`max-w-md w-full rounded-2xl p-6 border shadow-lg ${
        theme === 'dark'
          ? 'bg-[#131b2e] border-slate-800 shadow-slate-950/50'
          : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        {/* Top Badge */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Featured Developer Sponsor</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/10 text-slate-400">
            Ad Tab #{tab.id.slice(0, 6)}
          </span>
        </div>

        {/* Sponsor Icon & Brand */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            {ad.sponsor}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{ad.badge}</p>
        </div>

        {/* Headline */}
        <h2 className="text-lg font-extrabold tracking-tight mb-2">
          {ad.title}
        </h2>
        <p className={`text-xs leading-relaxed mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          {ad.tagline}
        </p>

        {/* Perks Grid */}
        <div className="grid grid-cols-2 gap-2 text-left mb-6 text-xs font-medium">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AMD EPYC 9004</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Gen4 NVMe SSDs</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>DDoS Protection</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant Docker API</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              window.open('https://example.com/developer-cloud-partner', '_blank', 'noopener,noreferrer');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className={`w-full py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
              theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Close this Ad Tab
          </button>
        </div>
      </div>
    </div>
  );
};
