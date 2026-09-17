import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  Play
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  theme,
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'compiler', label: 'Compiler', icon: Terminal },
    { id: 'languages', label: 'Languages', icon: Layers },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        theme === 'dark'
          ? 'bg-[#0f172a]/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-800'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <div
          id="logo-button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Code2 className="w-4 h-4 text-white stroke-[2.2]" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Online Coder
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                    : theme === 'dark'
                    ? 'text-slate-200 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Start Coding CTA */}
          <button
            id="header-start-coding-btn"
            onClick={() => handleNavClick('compiler')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Coding
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900/80 text-amber-300 hover:bg-slate-800'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg border ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900 text-slate-300'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className={`md:hidden border-b px-4 pt-2 pb-4 space-y-1 ${
            theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-blue-600/20 text-blue-400 font-semibold'
                      : 'bg-blue-50 text-blue-600 font-semibold'
                    : theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('compiler')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-md"
            >
              <Play className="w-4 h-4 fill-current" />
              Open Online IDE
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
