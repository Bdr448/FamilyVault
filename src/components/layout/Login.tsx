import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { FolderLock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Authentication failed.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

      {/* Language Header bar on login */}
      <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-card/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-border/60">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
            language === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('gu')}
          className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
            language === 'gu' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ગુજરાતી
        </button>
        <button
          onClick={() => setLanguage('hi')}
          className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
            language === 'hi' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          हिन्दी
        </button>
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* App Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 mb-3">
            <FolderLock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t('common.appTitle')}
          </h2>
          <p className="text-center text-sm text-muted-foreground max-w-xs mt-1.5">
            {t('loginPage.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-border/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 text-xs font-medium text-destructive animate-scale-in">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 tracking-wide uppercase px-0.5">
                {t('loginPage.emailLabel')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full h-11 rounded-2xl border border-input bg-background/50 px-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <label className="text-xs font-bold text-foreground/80 tracking-wide uppercase">
                  {t('loginPage.passwordLabel')}
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-2xl border border-input bg-background/50 pl-4 pr-11 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('loginPage.loginButton')
              )}
            </button>
          </form>
        </div>

        {/* Demo Hint Banner */}
        <div className="mt-6 rounded-3xl border border-border/50 bg-muted/40 p-5 text-center text-xs space-y-2 leading-relaxed">
          <p className="font-bold text-foreground/80">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-card/50 p-2.5 rounded-xl border border-border/40">
              <span className="font-bold block text-primary text-[10px] uppercase">Admin Role</span>
              <span className="text-muted-foreground block truncate">admin@familyvault.com</span>
              <span className="font-mono text-foreground font-semibold">admin123</span>
            </div>
            <div className="bg-card/50 p-2.5 rounded-xl border border-border/40">
              <span className="font-bold block text-emerald-500 text-[10px] uppercase">Family Role</span>
              <span className="text-muted-foreground block truncate">family@familyvault.com</span>
              <span className="font-mono text-foreground font-semibold">family123</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1">
            {t('loginPage.adminHint')} {t('loginPage.familyHint')}
          </p>
        </div>
      </div>
    </div>
  );
};
