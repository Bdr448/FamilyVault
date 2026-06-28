import React, { useState, useRef } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { isDemoMode } from '../../lib/supabase';
import {
  Sun,
  Moon,
  Monitor,
  Languages,
  Lock,
  Download,
  Upload,
  Info,
  CheckCircle,
  AlertTriangle,
  HardDrive
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { vaultPin, setVaultPin, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [pinFormVal, setPinFormVal] = useState(vaultPin);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update PIN handler
  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinFormVal.length !== 4) return;
    setVaultPin(pinFormVal);
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 3000);
  };

  // Backup Export
  const handleExportJSON = () => {
    dataService.exportBackup();
  };

  // Backup Restore
  const handleRestoreSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = dataService.restoreBackup(json);
        setRestoreSuccess(success);
        if (success) {
          // Soft page reload after 1.5 seconds to refresh state
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch {
        setRestoreSuccess(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback) return;
    setFeedbackSuccess(true);
    setFeedback('');
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl mx-auto animate-fade-in text-xs font-medium">
      {/* 1. Appearance / Theme */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
          <Monitor className="h-4.5 w-4.5 text-primary" />
          {t('settings.appearance')}
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
              theme === 'light' ? 'bg-primary/5 border-primary text-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <Sun className="h-5 w-5 mb-2" />
            <span className="font-bold">{t('settings.lightMode')}</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-primary/5 border-primary text-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <Moon className="h-5 w-5 mb-2" />
            <span className="font-bold">{t('settings.darkMode')}</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
              theme === 'system' ? 'bg-primary/5 border-primary text-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <Monitor className="h-5 w-5 mb-2" />
            <span className="font-bold">{t('settings.systemMode')}</span>
          </button>
        </div>
      </div>

      {/* 2. Languages Switching */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
          <Languages className="h-4.5 w-4.5 text-primary" />
          {t('settings.language')}
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[['en', 'English'], ['gu', 'ગુજરાતી'], ['hi', 'हिन्दी']].map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLanguage(code as any)}
              className={`p-3.5 rounded-xl border text-center font-bold transition-all ${
                language === code ? 'bg-primary/5 border-primary text-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Security Access PIN (Admin only) */}
      {isAdmin && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-primary" />
            {t('settings.securityPin')}
          </h4>
          <p className="text-muted-foreground leading-relaxed px-0.5">
            {t('settings.pinHint')}
          </p>

          <form onSubmit={handlePinUpdate} className="flex items-center gap-3">
            <input
              type="password"
              maxLength={4}
              required
              value={pinFormVal}
              onChange={(e) => setPinFormVal(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-24 h-10 text-center text-lg font-bold tracking-widest rounded-xl border border-input bg-background/50 focus:border-primary focus:bg-background outline-none transition-all"
            />
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 shadow-md shadow-primary/10 transition-all"
            >
              Update PIN
            </button>
            {pinSuccess && (
              <span className="text-emerald-500 flex items-center gap-1 font-semibold pl-1 animate-scale-in">
                <CheckCircle className="h-4 w-4" />
                Updated!
              </span>
            )}
          </form>
        </div>
      )}

      {/* 4. Backup & Restore (Admin only in Demo mode) */}
      {isAdmin && isDemoMode && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
            <HardDrive className="h-4.5 w-4.5 text-primary" />
            {t('settings.backupSection')}
          </h4>
          <p className="text-muted-foreground leading-relaxed px-0.5">
            {t('settings.backupDesc')}
          </p>

          {restoreSuccess !== null && (
            <div className={`p-4 rounded-2xl flex items-start gap-2.5 font-semibold text-xs leading-relaxed animate-scale-in ${
              restoreSuccess ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
            }`}>
              {restoreSuccess ? (
                <>
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>Backup restored successfully! Re-syncing database profiles, reloading app...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>Failed to parse backup file. Please make sure the JSON matches a valid Family Vault schema.</span>
                </>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 shadow-md shadow-primary/15 transition-all"
            >
              <Download className="h-4 w-4" />
              {t('settings.exportJson')}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-input bg-card text-foreground hover:bg-muted font-bold transition-all"
            >
              <Upload className="h-4 w-4 text-primary" />
              {t('settings.restoreData')}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestoreSelect}
              accept=".json"
              className="hidden"
            />
          </div>
          <span className="text-[10px] text-muted-foreground leading-relaxed block px-0.5 font-semibold">
            {t('settings.restoreWarning')}
          </span>
        </div>
      )}

      {/* 5. Feedback Form */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-primary" />
          {t('settings.feedbackTitle')}
        </h4>
        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
          <textarea
            required
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t('settings.feedbackLabel')}
            className="w-full h-20 rounded-xl border border-input bg-background/50 p-3 outline-none focus:border-primary/50 focus:bg-background transition-all resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 shadow-md shadow-primary/10 transition-all animate-fade-in"
            >
              Send Feedback
            </button>
            {feedbackSuccess && (
              <span className="text-emerald-500 font-semibold flex items-center gap-1 animate-scale-in">
                <CheckCircle className="h-4 w-4" />
                Thank you!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 6. Footer System details */}
      <div className="text-center text-muted-foreground/60 text-[10px] py-4 space-y-1 font-semibold leading-relaxed">
        <p>Family Vault v1.1.0 • Running in {isDemoMode ? 'Sandbox Demo Mode (LocalStorage)' : 'Supabase Production Mode'}</p>
        <p>© 2026 Shah Family Inc. All Rights Reserved.</p>
      </div>
    </div>
  );
};
