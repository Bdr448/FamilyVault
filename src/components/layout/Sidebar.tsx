import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderLock,
  Receipt,
  Users,
  AlertTriangle,
  Trash2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
    { id: 'vault', label: t('common.vault'), icon: FolderLock },
    { id: 'expenses', label: t('common.expenses'), icon: Receipt },
    { id: 'family', label: t('common.family'), icon: Users },
    { id: 'emergency', label: t('common.emergency'), icon: AlertTriangle },
    { id: 'recycle-bin', label: t('common.recycleBin'), icon: Trash2 },
    { id: 'settings', label: t('common.settings'), icon: Settings }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 border-r border-border/80 bg-card/60 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
              <FolderLock className="h-4.5 w-4.5" />
            </div>
            <span className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80">
              {t('common.appTitle')}
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <FolderLock className="h-4.5 w-4.5" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background hover:bg-muted text-muted-foreground transition-colors absolute -right-3 top-5"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User profile card */}
      <div className="p-4 border-t border-border/50">
        <div
          className={`flex items-center gap-3 rounded-2xl p-2 bg-muted/40 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                {user?.role === 'admin' ? t('common.admin') : t('common.familyRole')}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title={t('common.logout')}
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            onClick={logout}
            className="flex mx-auto mt-3 p-2 rounded-full border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title={t('common.logout')}
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
