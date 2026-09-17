import React from 'react';
import {
  ShieldCheck,
  Zap,
  HardDrive,
  DatabaseZap,
  Globe2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Code2,
  FileDown
} from 'lucide-react';
import { TestAdBanner } from '../components/common/TestAdBanner.tsx';

interface FeaturesPageProps {
  onStartCoding: () => void;
  theme: 'dark' | 'light';
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({
  onStartCoding,
  theme,
}) => {
  const features = [
    {
      icon: Layers,
      title: 'Multi-Language Support',
      description: 'Compile and run 10 distinct languages including Python, C, C++, Java, JavaScript, TypeScript, Go, Rust, Kotlin, and PHP with unified stdin/stdout/stderr streaming.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: ShieldCheck,
      title: 'Hardened Docker Isolation',
      description: 'Zero host risk. Every run is wrapped in an ephemeral, unprivileged Linux container with network access blocked (--network none), 128MB RAM caps, and 5.0s timeouts.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: DatabaseZap,
      title: 'Zero Cloud Database Required',
      description: 'No MongoDB, MySQL, or Firebase accounts required. Your session remains strictly private on your device with zero cloud tracking.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: Zap,
      title: 'Ultra-Fast Sub-Second Response',
      description: 'Microsecond container spawn architecture and warm caching minimize execution latency for smooth competitive programming and quick algorithm tests.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Globe2,
      title: 'Zero Third-Party Compiler APIs',
      description: 'No Judge0, JDoodle, or Paiza rate-limits, watermarks, or paid API keys. Everything runs natively on our full-stack container backend.',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Terminal,
      title: 'Full Monaco IDE Engine',
      description: 'Enjoy the same engine powering VS Code: rich syntax highlighting, bracket matching, code folding, word wrap, minimap, and customizable font scaling.',
      color: 'from-indigo-500 to-violet-600',
    },
  ];

  return (
    <div id="features-page-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Engineered for Developers</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          Powerful Features. Zero Friction.
        </h1>
        <p className={`text-sm sm:text-base leading-relaxed ${
          theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Online Coder is built from the ground up to give developers a blazing fast sandbox without the hassle of accounts, payments, or third-party APIs.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
                theme === 'dark'
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {feat.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {feat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* TEST AD BANNER */}
      <TestAdBanner
        format="leaderboard"
        slotId="features-mid-leaderboard"
        theme={theme}
      />

      {/* Security Specs Blueprint Card */}
      <div className={`p-8 rounded-3xl border ${
        theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className={`text-xl sm:text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Container Isolation Matrix
            </h2>
            <p className={`text-xs sm:text-sm ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Technical parameters enforced on every code execution invocation:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600 font-medium'}>Memory Ceiling:</span>
              <span className="text-blue-500 dark:text-blue-400 font-semibold">128 MB (swap capped)</span>
            </div>
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600 font-medium'}>Execution Timeout:</span>
              <span className="text-amber-500 dark:text-amber-400 font-semibold">2m 30s (150s limit)</span>
            </div>
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600 font-medium'}>Network Access:</span>
              <span className="text-rose-500 dark:text-rose-400 font-semibold">--network none (Airgapped)</span>
            </div>
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600 font-medium'}>Process / PID Limit:</span>
              <span className="text-purple-500 dark:text-purple-400 font-semibold">64 PIDs max</span>
            </div>
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600 font-medium'}>Container User:</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-semibold">UID 1000 (Non-root)</span>
            </div>
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600 font-medium'}>Filesystem:</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-semibold">Read-only + 32MB tmpfs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features Test Ad */}
      <TestAdBanner
        format="leaderboard"
        slotId="features-bottom-leaderboard"
        theme={theme}
      />

      {/* CTA */}
      <div className="text-center pt-2">
        <button
          onClick={onStartCoding}
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          Try Online Coder Now
        </button>
      </div>
    </div>
  );
};
