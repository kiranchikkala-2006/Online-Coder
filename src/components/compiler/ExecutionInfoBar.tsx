import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ExecutionStatus } from '../../types/index.ts';

interface ExecutionInfoBarProps {
  status: ExecutionStatus;
  executionTime: number;
  memoryUsageMB: number;
  sandbox: string;
  theme: 'dark' | 'light';
  exitCode?: number;
}

export const ExecutionInfoBar: React.FC<ExecutionInfoBarProps> = ({
  status,
  executionTime,
  memoryUsageMB,
  sandbox,
  theme,
  exitCode,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold animate-pulse border ${
            theme === 'dark'
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Running code...</span>
          </div>
        );
      case 'success':
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            theme === 'dark'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </div>
        );
      case 'compilation_error':
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            theme === 'dark'
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <XCircle className="w-3.5 h-3.5" />
            <span>Compilation Error</span>
          </div>
        );
      case 'runtime_error':
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            theme === 'dark'
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Runtime Error (Exit: {exitCode})</span>
          </div>
        );
      case 'time_limit_exceeded':
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            theme === 'dark'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>Time Limit Exceeded (&gt;2m 30s)</span>
          </div>
        );
      case 'memory_limit_exceeded':
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            theme === 'dark'
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            <HardDrive className="w-3.5 h-3.5" />
            <span>Memory Limit Exceeded (&gt;128MB)</span>
          </div>
        );
      case 'system_error':
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            theme === 'dark'
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <XCircle className="w-3.5 h-3.5" />
            <span>System Error</span>
          </div>
        );
      default:
        return (
          <div className={`text-xs ${theme === 'dark' ? 'text-slate-200 font-medium' : 'text-slate-700 font-medium'} flex items-center gap-1.5`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Ready for execution</span>
          </div>
        );
    }
  };

  return (
    <div
      id="execution-info-bar"
      className={`px-4 py-2 border-t flex flex-wrap items-center justify-between gap-3 text-xs select-none transition-colors ${
        theme === 'dark'
          ? 'bg-[#0b0f19] border-slate-800 text-slate-200'
          : 'bg-slate-100 border-slate-200 text-slate-800'
      }`}
    >
      {/* Left: Status Indicator */}
      <div className="flex items-center gap-3">
        <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} uppercase tracking-wider text-[10px]`}>
          Status:
        </span>
        {getStatusBadge()}
      </div>

      {/* Right: Metrics (Time, Memory, Sandbox) */}
      <div className="flex items-center gap-4 flex-wrap">
        {status !== 'idle' && (
          <>
            {/* Execution Time */}
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Time:</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                {executionTime > 0 ? `${executionTime.toFixed(3)}s` : '0.000s'}
              </span>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center gap-1.5 font-mono">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Memory:</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                {memoryUsageMB > 0 ? `${memoryUsageMB.toFixed(1)} MB` : '12.0 MB'}
              </span>
            </div>
          </>
        )}

        {/* Sandbox Architecture badge */}
        <div
          title={
            sandbox === 'docker'
              ? 'Docker container sandbox active with non-root user, 128MB RAM ceiling, and network disabled'
              : 'Isolated child process sandbox running with memory limit and timeout controls'
          }
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono border ${
            sandbox === 'docker'
              ? theme === 'dark'
                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-semibold'
                : 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
              : theme === 'dark'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{sandbox === 'docker' ? 'Docker Sandbox' : 'Isolated Runner'}</span>
        </div>
      </div>
    </div>
  );
};
