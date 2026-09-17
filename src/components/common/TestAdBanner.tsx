import React, { useState } from 'react';
import { ExternalLink, Info, X, Cloud, Server, Cpu, Sparkles, Database, Shield } from 'lucide-react';

export type AdFormat = 'leaderboard' | 'slim' | 'card' | 'billboard' | 'skyscraper';

interface TestAdBannerProps {
  format?: AdFormat;
  slotId?: string;
  theme: 'dark' | 'light';
  className?: string;
}

interface TestAdData {
  id: string;
  badge: string;
  sponsor: string;
  title: string;
  tagline: string;
  ctaText: string;
  ctaUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const TEST_ADS: TestAdData[] = [
  {
    id: 'cloud-compute',
    badge: 'Test Ad',
    sponsor: 'HyperCloud Compute',
    title: 'Deploy Sandboxed Containers in Seconds',
    tagline: 'Get $200 in free cloud infrastructure credits. High-speed NVMe & isolated CPU runtimes.',
    ctaText: 'Claim $200 Credit',
    ctaUrl: '#',
    icon: Cloud,
    accentColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'dev-database',
    badge: 'Test Ad',
    sponsor: 'VectorScale DB',
    title: 'Serverless Real-Time Database for Devs',
    tagline: 'Zero config, sub-millisecond queries, and automatic scaling for modern web apps.',
    ctaText: 'Try Free Tier',
    ctaUrl: '#',
    icon: Database,
    accentColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'runtime-security',
    badge: 'Test Ad',
    sponsor: 'Aegis Sentinel',
    title: 'Automated Container & Code Sandbox Security',
    tagline: 'Air-gapped execution monitoring, memory leak detection, and zero-day threat defense.',
    ctaText: 'Learn More',
    ctaUrl: '#',
    icon: Shield,
    accentColor: 'from-purple-500 to-violet-600',
  },
  {
    id: 'fast-vps',
    badge: 'Test Ad',
    sponsor: 'Nexus Bare-Metal',
    title: 'Dedicated Developer VPS from $4/mo',
    tagline: 'Instant root access, 10Gbps unmetered uplink, and 1-click Docker orchestration.',
    ctaText: 'Deploy Now',
    ctaUrl: '#',
    icon: Server,
    accentColor: 'from-amber-500 to-orange-600',
  },
];

export const TestAdBanner: React.FC<TestAdBannerProps> = ({
  format = 'leaderboard',
  slotId = 'home-mid',
  theme,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Pick ad deterministically based on slotId
  const adIndex = Math.abs(slotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % TEST_ADS.length;
  const ad = TEST_ADS[adIndex];
  const AdIcon = ad.icon;

  if (dismissed) {
    return (
      <div className={`text-center py-2 text-[11px] font-mono transition-opacity ${
        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
      }`}>
        <span>[Test Ad Closed • {slotId}]</span>
        <button
          onClick={() => setDismissed(false)}
          className="ml-2 underline hover:text-blue-400"
        >
          Restore
        </button>
      </div>
    );
  }

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowInfo(true);
  };

  // 1. SLIM / COMPILER FORMAT (e.g. for Online IDE top or bottom banner)
  if (format === 'slim') {
    return (
      <div
        id={`test-ad-slot-${slotId}`}
        className={`relative z-10 w-full px-3 py-1.5 flex items-center justify-between border-b transition-colors select-none ${
          theme === 'dark'
            ? 'bg-[#090d16] border-slate-800 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        } ${className}`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
          {/* Ad badge */}
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 shrink-0">
            Ad
          </span>

          <div className={`p-1 rounded bg-gradient-to-br ${ad.accentColor} text-white shrink-0 hidden xs:flex`}>
            <AdIcon className="w-3 h-3" />
          </div>

          <div className="flex items-center gap-2 truncate text-xs">
            <span className={`font-semibold shrink-0 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
              {ad.sponsor}:
            </span>
            <span className={`truncate text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              {ad.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            onClick={handleAdClick}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            title="Ad choices & test ad notice"
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Info className="w-3 h-3" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            title="Dismiss ad"
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Info popup */}
        {showInfo && (
          <div className={`absolute top-full right-4 mt-1 w-72 p-3 rounded-lg border shadow-xl z-50 text-xs space-y-1.5 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span>Test Ad Simulator</span>
              <button onClick={() => setShowInfo(false)}><X className="w-3.5 h-3.5" /></button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This is a demonstration test ad slot for Online Coder. In production, this spot serves Google AdSense or Developer Ad networks.
            </p>
          </div>
        )}
      </div>
    );
  }

  // 2. IN-FEED CARD FORMAT (e.g. inside language list or grid)
  if (format === 'card') {
    return (
      <div
        id={`test-ad-slot-${slotId}`}
        className={`relative flex flex-col rounded-2xl border p-5 transition-all overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#0e1628] to-[#0a0f1d] border-blue-500/30 text-slate-100 shadow-md'
            : 'bg-gradient-to-b from-blue-50/50 to-white border-blue-200 text-slate-800 shadow-sm'
        } ${className}`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${ad.accentColor} text-white flex items-center justify-center shadow`}>
              <AdIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
                Sponsored • Test Ad
              </span>
              <div className={`text-xs font-semibold mt-0.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                {ad.sponsor}
              </div>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            title="Close test ad"
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <h4 className={`text-sm sm:text-base font-bold mb-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {ad.title}
        </h4>
        <p className={`text-xs leading-relaxed mb-4 flex-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          {ad.tagline}
        </p>

        {/* Action button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
          <span className="text-[10px] text-slate-400">Ad slot: {slotId}</span>
          <button
            onClick={handleAdClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition-all"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {showInfo && (
          <div className={`absolute inset-0 p-4 rounded-2xl flex flex-col justify-center items-center text-center z-20 ${
            theme === 'dark' ? 'bg-slate-900/95 text-slate-200' : 'bg-white/95 text-slate-800'
          }`}>
            <Sparkles className="w-6 h-6 text-amber-400 mb-2" />
            <h5 className="font-bold text-sm">Test Ad Unit</h5>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Placeholder ad placement designed for Google AdSense / EthicalAds integration.
            </p>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-3 px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. SKYSCRAPER FORMAT (Standard 160x600 vertical side gutter banner)
  if (format === 'skyscraper') {
    return (
      <div
        id={`test-ad-slot-${slotId}`}
        className={`relative w-full max-w-[180px] rounded-2xl border p-3 flex flex-col justify-between transition-all shadow-sm select-none ${
          theme === 'dark'
            ? 'bg-[#0a0f1d] border-slate-800 text-slate-100 hover:border-slate-700'
            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
        } ${className}`}
        style={{ minHeight: '480px' }}
      >
        {/* Top Header Badge & Close */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/20 text-[10px]">
          <span className="uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 font-mono">
            Test Ad
          </span>
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-0.5 hover:text-slate-200 cursor-pointer"
              title="AdChoices"
            >
              <Info className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-0.5 hover:text-slate-200 cursor-pointer"
              title="Dismiss ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ad Body */}
        <div className="flex-1 flex flex-col items-center text-center py-3 space-y-2.5">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${ad.accentColor} text-white flex items-center justify-center shadow-md shrink-0`}>
            <AdIcon className="w-5 h-5" />
          </div>

          <div>
            <div className={`text-xs font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {ad.sponsor}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Verified Partner</div>
          </div>

          <h4 className={`text-xs font-bold leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {ad.title}
          </h4>

          <p className={`text-[11px] leading-relaxed line-clamp-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            {ad.tagline}
          </p>

          <div className="w-full pt-1 space-y-1.5 text-[10px] font-mono text-left px-1">
            <div className="flex items-center gap-1 text-emerald-500">
              <span>✔</span> <span>Fast NVMe SSD</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <span>✔</span> <span>Zero Setup Time</span>
            </div>
            <div className="flex items-center gap-1 text-purple-500">
              <span>✔</span> <span>24/7 Monitoring</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-2 border-t border-slate-700/20 space-y-1.5">
          <button
            onClick={handleAdClick}
            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow transition-all active:scale-95 cursor-pointer"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <div className="text-[9px] text-center text-slate-400 font-mono">
            160x600 Skyscraper
          </div>
        </div>

        {showInfo && (
          <div className={`absolute inset-0 p-3 rounded-2xl flex flex-col justify-center items-center text-center z-20 ${
            theme === 'dark' ? 'bg-slate-900/95 text-slate-200' : 'bg-white/95 text-slate-800'
          }`}>
            <Sparkles className="w-5 h-5 text-amber-400 mb-1.5" />
            <h5 className="font-bold text-xs">Skyscraper Test Ad</h5>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Standard 160x600 skyscraper side rail format for developer sponsors and AdSense.
            </p>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-2.5 px-3 py-1 rounded bg-blue-600 text-white text-[11px] font-semibold cursor-pointer"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. LEADERBOARD / BILLBOARD FORMAT (Standard horizontal banner, responsive up to 970px)
  return (
    <div
      id={`test-ad-slot-${slotId}`}
      className={`relative mx-auto w-full max-w-5xl rounded-xl border p-3 sm:p-4 transition-all shadow-sm ${
        theme === 'dark'
          ? 'bg-[#0a0f1d] border-slate-800 text-slate-100 hover:border-slate-700'
          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
      } ${className}`}
    >
      {/* Micro Top Bar with Label & AdChoices */}
      <div className="flex items-center justify-between mb-2 text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
            Test Ad
          </span>
          <span className="hidden sm:inline font-mono">Slot: {slotId} • 728x90 Responsive</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <Info className="w-3 h-3" />
            <span className="hidden xs:inline">AdChoices</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="hover:text-slate-200 transition-colors"
            title="Dismiss test ad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Banner Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${ad.accentColor} text-white flex items-center justify-center shrink-0 shadow`}>
            <AdIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {ad.sponsor}
              </span>
              <span className="text-[10px] text-slate-400 hidden md:inline">• Verified Partner</span>
            </div>
            <h4 className={`text-sm sm:text-base font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {ad.title}
            </h4>
            <p className={`text-xs line-clamp-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              {ad.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center sm:shrink-0 justify-end">
          <button
            onClick={handleAdClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg transition-all"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showInfo && (
        <div className={`absolute top-10 right-4 p-3 rounded-lg border shadow-xl z-50 text-xs space-y-1 max-w-xs ${
          theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="font-bold flex items-center justify-between">
            <span>Test Advertisement Slot</span>
            <button onClick={() => setShowInfo(false)}><X className="w-3.5 h-3.5" /></button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This test ad spot is ready for your monetization provider (Google AdSense, Carbon Ads, or direct developer sponsors).
          </p>
        </div>
      )}
    </div>
  );
};
