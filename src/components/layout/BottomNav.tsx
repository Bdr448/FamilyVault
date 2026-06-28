import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  FolderLock,
  Receipt,
  Users,
  AlertTriangle,
  Settings
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  const mobileItems = [
    { id: 'dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
    { id: 'vault', label: t('common.vault'), icon: FolderLock },
    { id: 'expenses', label: t('common.expenses'), icon: Receipt },
    { id: 'family', label: t('common.family'), icon: Users },
    { id: 'emergency', label: t('common.emergency'), icon: t('common.emergency').split(' ')[0] }, // Short label
    { id: 'settings', label: t('common.settings'), icon: Settings }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/75 backdrop-blur-xl border-t border-border/80 pb-safe-pb">
      <div className="flex h-16 items-center justify-around px-2">
        {mobileItems.map((item) => {
          const Icon = typeof item.icon === 'string' ? AlertTriangle : item.icon;
          const labelText = typeof item.icon === 'string' ? item.icon : item.label;
          const isActive = activeTab === item.id || (item.id === 'settings' && activeTab === 'recycle-bin');

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-primary scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className="max-w-[60px] truncate">{labelText}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
