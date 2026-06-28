import React, { useMemo } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import {
  FileText,
  TrendingUp,
  AlertCircle,
  History,
  Star,
  Pin,
  HardDrive,
  Users,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  documents: any[];
  expenses: any[];
  members: any[];
  activityLogs: any[];
  events: any[];
  onNavigate: (tab: string) => void;
  onOpenDoc: (doc: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  expenses,
  members,
  activityLogs,
  events,
  onNavigate,
  onOpenDoc
}) => {
  const { t, language } = useTranslation();

  // 1. Calculate Metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const thisMonthStr = new Date().toISOString().slice(0, 7);

  const todayExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.expense_date === todayStr && !e.is_deleted)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses, todayStr]);

  const monthlyExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.expense_date.startsWith(thisMonthStr) && !e.is_deleted)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses, thisMonthStr]);

  const activeDocs = useMemo(() => documents.filter((d) => !d.is_deleted), [documents]);

  const expiringSoonCount = useMemo(() => {
    const today = new Date();
    return activeDocs.filter((d) => {
      if (!d.expiry_date) return false;
      const expiry = new Date(d.expiry_date);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    }).length;
  }, [activeDocs]);

  const starredDocs = useMemo(() => {
    return activeDocs.filter((d) => d.is_favorite);
  }, [activeDocs]);

  const birthdaysCount = useMemo(() => {
    return events.filter((e) => e.type === 'birthday' && !e.is_deleted).length;
  }, [events]);

  // 2. Storage Statistics
  const totalStorageLimit = 100 * 1024 * 1024; // 100 MB Demo limit
  const storageUsed = useMemo(() => {
    return activeDocs.reduce((sum, d) => sum + (Number(d.file_size) || 0), 0);
  }, [activeDocs]);

  const storagePercentage = useMemo(() => {
    return Math.min(100, Math.round((storageUsed / totalStorageLimit) * 100));
  }, [storageUsed, totalStorageLimit]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Group by document type for PieChart
  const storageTypeData = useMemo(() => {
    const types: Record<string, number> = {};
    activeDocs.forEach((d) => {
      const extension = d.file_type.split('/').pop()?.toUpperCase() || 'OTHER';
      types[extension] = (types[extension] || 0) + d.file_size;
    });

    return Object.entries(types).map(([name, value]) => ({
      name,
      value
    }));
  }, [activeDocs]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // 3. Monthly Expense graph series (Recharts)
  const chartData = useMemo(() => {
    const months = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const label = monthDate.toLocaleString(language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN', { month: 'short' });
      const prefix = monthDate.toISOString().slice(0, 7);
      
      const amount = expenses
        .filter((e) => e.expense_date.startsWith(prefix) && !e.is_deleted)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      months.push({ name: label, amount });
    }
    return months;
  }, [expenses, language]);

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Metric Cards Grid - Responsive layout for 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Today's Spend */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between hover-card-trigger">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.todayExpenses')}</span>
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground">₹{todayExpenses.toLocaleString()}</h3>
            <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Logged today</p>
          </div>
        </div>

        {/* This Month's Spend */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between hover-card-trigger" onClick={() => onNavigate('expenses')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.monthExpenses')}</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground">₹{monthlyExpenses.toLocaleString()}</h3>
            <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Budget tracking</p>
          </div>
        </div>

        {/* Expiry alerts */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between hover-card-trigger" onClick={() => onNavigate('vault')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.docsExpiring')}</span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground">{expiringSoonCount}</h3>
            <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Require renewal</p>
          </div>
        </div>

        {/* Family Profiles Count */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between hover-card-trigger" onClick={() => onNavigate('family')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.familyCount')}</span>
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground">{members.length}</h3>
            <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Members registered</p>
          </div>
        </div>

        {/* Upcoming Birthdays count */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between hover-card-trigger" onClick={() => onNavigate('family')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.upcomingBirthdays')}</span>
            <div className="p-1.5 rounded-xl bg-pink-500/10 text-pink-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground">{birthdaysCount}</h3>
            <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Anniversaries & DOBs</p>
          </div>
        </div>

        {/* Storage card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between hover-card-trigger">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.storageUsed')}</span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground">{storagePercentage}%</h3>
            <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">
              {formatSize(storageUsed)} / 100 MB
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Trend & Vault, Right Activity & Expiry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Charts and Starred */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend chart */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">{t('expenses.trend')}</h4>
              <span className="text-xs font-medium text-muted-foreground">Last 6 Months</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Starred / Pinned Documents */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="h-4 w-4 text-primary fill-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">{t('dashboard.pinnedDocs')}</h4>
            </div>
            {starredDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">{t('dashboard.noPinned')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {starredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onOpenDoc(doc)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-all cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{doc.category} • {doc.owner_name}</p>
                    </div>
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Family timeline & Storage */}
        <div className="space-y-6">
          
          {/* Storage Distribution */}
          <div className="glass-card rounded-3xl p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-4">{t('dashboard.storageChart')}</h4>
            <div className="flex items-center justify-between">
              {storageTypeData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center w-full py-6">No files uploaded yet.</p>
              ) : (
                <>
                  <div className="h-32 w-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={storageTypeData}
                          innerRadius={36}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {storageTypeData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 pl-4 space-y-1.5 max-h-32 overflow-y-auto">
                    {storageTypeData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between text-[10px] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-foreground">{formatSize(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Family Activity Feed (Timeline) */}
          <div className="glass-card rounded-3xl p-6 flex flex-col h-[340px]">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <History className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">{t('dashboard.recentActivity')}</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">{t('dashboard.noActivity')}</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium text-foreground leading-relaxed">
                        {log.details}
                      </p>
                      <span className="text-[10px] text-muted-foreground block">
                        {new Date(log.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
