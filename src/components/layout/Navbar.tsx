import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Search, Plus, Globe } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenUpload: () => void;
  onOpenExpense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  onOpenExpense
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (activeTab !== 'vault' && activeTab !== 'dashboard') {
      setActiveTab('vault');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return t('common.dashboard');
      case 'vault': return t('common.vault');
      case 'expenses': return t('common.expenses');
      case 'family': return t('common.family');
      case 'emergency': return t('common.emergency');
      case 'recycle-bin': return t('recycleBin.title');
      case 'settings': return t('common.settings');
      default: return t('common.appTitle');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/60 backdrop-blur-xl px-4 md:px-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground tracking-tight md:text-2xl">
          {getPageTitle()}
        </h1>
      </div>

      {/* Global Search Bar - Redefining vault filters */}
      <div className="hidden sm:flex relative max-w-md w-72 md:w-96 mx-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('vault.searchPlaceholder')}
          className="w-full h-10 rounded-2xl border border-input bg-muted/40 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background/80 transition-all placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-2">
        {/* Quick action: Add Expense / Upload (Hidden on settings/emergency except main layout) */}
        {activeTab !== 'settings' && activeTab !== 'recycle-bin' && (
          <div className="flex items-center gap-1.5 mr-1">
            <button
              onClick={onOpenUpload}
              className="flex items-center justify-center p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all text-xs font-semibold gap-1 shadow-md shadow-primary/15 md:px-3 md:py-2"
              title={t('dashboard.uploadDoc')}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">{t('dashboard.uploadDoc')}</span>
            </button>
            
            <button
              onClick={onOpenExpense}
              className="flex items-center justify-center p-2 rounded-xl border border-input bg-card text-foreground hover:bg-muted transition-all text-xs font-semibold gap-1 md:px-3 md:py-2"
              title={t('dashboard.logExpense')}
            >
              <Plus className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">{t('dashboard.logExpense')}</span>
            </button>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Language select */}
        <div className="relative group">
          <button
            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={t('settings.language')}
          >
            <Globe className="h-5 w-5" />
          </button>
          
          <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-card border border-border shadow-xl rounded-2xl p-1.5 w-32 z-50">
            <button
              onClick={() => setLanguage('en')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium ${
                language === 'en' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
              }`}
            >
              <span>English</span>
              {language === 'en' && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
            <button
              onClick={() => setLanguage('gu')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium ${
                language === 'gu' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
              }`}
            >
              <span>ગુજરાતી</span>
              {language === 'gu' && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium ${
                language === 'hi' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
              }`}
            >
              <span>हिन्दी</span>
              {language === 'hi' && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
