import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CompilerPage } from './pages/CompilerPage.tsx';
import { LanguagesPage } from './pages/LanguagesPage.tsx';
import { FeaturesPage } from './pages/FeaturesPage.tsx';
import { SupportedLanguageId } from './types/index.ts';
import { getStoredTheme, setStoredTheme, loadLastSession } from './services/storage.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageId>(() => {
    const last = loadLastSession();
    return last?.language || 'python';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStoredTheme());

  // Sync html tag class for dark mode styling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNavigate = (tab: string, langId?: SupportedLanguageId) => {
    if (langId) {
      setSelectedLanguage(langId);
    }
    setCurrentTab(tab === 'programs' ? 'compiler' : tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'home' && (
          <HomePage onNavigate={handleNavigate} theme={theme} />
        )}

        {currentTab === 'compiler' && (
          <CompilerPage
            initialLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            theme={theme}
          />
        )}

        {currentTab === 'languages' && (
          <LanguagesPage
            onSelectLanguage={(langId) => handleNavigate('compiler', langId)}
            theme={theme}
          />
        )}

        {currentTab === 'features' && (
          <FeaturesPage
            onStartCoding={() => handleNavigate('compiler')}
            theme={theme}
          />
        )}
      </main>

      {/* Footer (Rendered on non-compiler pages to maximize IDE height) */}
      {currentTab !== 'compiler' && (
        <Footer
          theme={theme}
          onSelectLanguage={(langId) => handleNavigate('compiler', langId as SupportedLanguageId)}
          onOpenFeatures={() => handleNavigate('features')}
        />
      )}
    </div>
  );
}
