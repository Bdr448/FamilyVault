import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Download,
  Plus,
  Trash2,
  Edit2,
  X,
  Search
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

interface ExpenseTrackerProps {
  expenses: any[];
  onSaveExpense: (expense: any) => Promise<any>;
  onDeleteExpense: (id: string, title: string) => Promise<void>;
  onOpenExpenseTrigger: boolean;
  resetExpenseTrigger: () => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onSaveExpense,
  onDeleteExpense,
  onOpenExpenseTrigger,
  resetExpenseTrigger
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State Management
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  // Form inputs
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState('');

  const categories = ['Food', 'Medical', 'Travel', 'Shopping', 'Bills', 'Education', 'Fuel', 'Investment', 'Other'];
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#64748b'];

  // Handle open triggered from App level
  React.useEffect(() => {
    if (onOpenExpenseTrigger) {
      startCreate();
      resetExpenseTrigger();
    }
  }, [onOpenExpenseTrigger]);

  const startCreate = () => {
    setFormId(null);
    setFormTitle('');
    setFormAmount('');
    setFormCategory('Food');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormNotes('');
    setIsFormOpen(true);
  };

  const startEdit = (exp: any) => {
    setFormId(exp.id);
    setFormTitle(exp.title);
    setFormAmount(String(exp.amount));
    setFormCategory(exp.category);
    setFormDate(exp.expense_date);
    setFormNotes(exp.notes || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;

    await onSaveExpense({
      id: formId,
      title: formTitle,
      amount: parseFloat(formAmount),
      category: formCategory,
      expense_date: formDate,
      notes: formNotes
    });

    setIsFormOpen(false);
  };

  const handleDelete = async (exp: any) => {
    if (window.confirm(`Move expense "${exp.title}" to Recycle Bin?`)) {
      await onDeleteExpense(exp.id, exp.title);
    }
  };

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (exp.is_deleted) return false;
      if (selectedCategoryFilter !== 'All' && exp.category !== selectedCategoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(query);
        const matchesNotes = exp.notes?.toLowerCase().includes(query);
        return matchesTitle || matchesNotes;
      }
      return true;
    }).sort((a, b) => b.expense_date.localeCompare(a.expense_date));
  }, [expenses, selectedCategoryFilter, searchQuery]);

  // Analytics Computations
  const analytics = useMemo(() => {
    const activeExps = expenses.filter(e => !e.is_deleted);
    if (activeExps.length === 0) return { highest: 'N/A', lowest: 'N/A', avgDaily: 0, savings: 0, topExpense: 0 };

    // Total monthly spending
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlySum = activeExps
      .filter(e => e.expense_date.startsWith(thisMonth))
      .reduce((s, e) => s + Number(e.amount), 0);

    // Sum by category
    const catSums: Record<string, number> = {};
    activeExps.forEach(e => {
      catSums[e.category] = (catSums[e.category] || 0) + Number(e.amount);
    });

    let highestCat = 'N/A';
    let highestVal = 0;
    let lowestCat = 'N/A';
    let lowestVal = Infinity;

    Object.entries(catSums).forEach(([cat, val]) => {
      if (val > highestVal) {
        highestVal = val;
        highestCat = cat;
      }
      if (val < lowestVal) {
        lowestVal = val;
        lowestCat = cat;
      }
    });

    const topExpVal = activeExps.reduce((max, e) => Math.max(max, Number(e.amount)), 0);
    const avgDailyVal = monthlySum / 30;
    const assumedMonthlyIncome = 75000; // Seeding assumed income budget

    return {
      highest: highestCat,
      lowest: lowestVal === Infinity ? 'N/A' : lowestCat,
      avgDaily: Math.round(avgDailyVal),
      savings: Math.max(0, assumedMonthlyIncome - monthlySum),
      topExpense: topExpVal
    };
  }, [expenses]);

  // Chart data: Group by category
  const pieChartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      dataMap[exp.category] = (dataMap[exp.category] || 0) + Number(exp.amount);
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  // Bar Chart Data: Monthly / Weekly / Yearly splits
  const barChartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      let label = exp.expense_date;
      if (chartPeriod === 'monthly') {
        label = exp.expense_date.substring(5, 7); // month number
      } else if (chartPeriod === 'yearly') {
        label = exp.expense_date.substring(0, 4); // year
      }
      dataMap[label] = (dataMap[label] || 0) + Number(exp.amount);
    });

    return Object.entries(dataMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredExpenses, chartPeriod]);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ['Title,Amount,Category,Date,Notes\n'];
    const rows = filteredExpenses.map(e => 
      `"${e.title.replace(/"/g, '""')}",${e.amount},"${e.category}","${e.expense_date}","${(e.notes || '').replace(/"/g, '""')}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `family_expenses_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* 1. Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">{t('expenses.title')}</h3>
          <p className="text-xs text-muted-foreground">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-input bg-card text-foreground hover:bg-muted text-xs font-semibold"
          >
            <Download className="h-4 w-4" />
            {t('expenses.exportCsv')}
          </button>
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/10"
          >
            <Plus className="h-4 w-4" />
            {t('expenses.addExpense')}
          </button>
        </div>
      </div>

      {/* 2. Analytical Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t('expenses.highestCategory')}</span>
          <h4 className="text-sm font-bold text-foreground mt-2">{analytics.highest}</h4>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t('expenses.topExpense')}</span>
          <h4 className="text-sm font-bold text-foreground mt-2">₹{analytics.topExpense.toLocaleString()}</h4>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t('expenses.avgDaily')}</span>
          <h4 className="text-sm font-bold text-foreground mt-2">₹{analytics.avgDaily.toLocaleString()}</h4>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t('expenses.monthlySavings')}</span>
          <h4 className="text-sm font-bold text-foreground mt-2">₹{analytics.savings.toLocaleString()}</h4>
        </div>
      </div>

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Category Pie Chart */}
        <div className="glass-card rounded-3xl p-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Expenses by Category</h4>
          <div className="h-56 w-full flex items-center justify-center">
            {pieChartData.length === 0 ? (
              <p className="text-xs text-muted-foreground">No expenses logged to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2.5 mt-3 justify-center">
            {pieChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[9px] font-bold">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-muted-foreground">{item.name} (₹{item.value.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Trend Bar Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spend Analysis</h4>
            <div className="flex items-center bg-card border border-border/60 rounded-xl p-0.5 shrink-0 text-[10px]">
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${chartPeriod === 'weekly' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${chartPeriod === 'monthly' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChartPeriod('yearly')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${chartPeriod === 'yearly' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                Yearly
              </button>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {barChartData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-20">No matching spend records found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 4. Ledger Table & Category Filter */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between mb-4">
          <div className="flex items-center gap-1.5 border border-input rounded-2xl px-3 py-1.5 max-w-sm w-full bg-background/50">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses..."
              className="w-full bg-transparent outline-none text-xs"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto max-w-full pb-1">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border shrink-0 ${
                selectedCategoryFilter === 'All'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border/80'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border shrink-0 ${
                  selectedCategoryFilter === cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        {filteredExpenses.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-10">{t('expenses.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">{exp.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[9px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-foreground">₹{Number(exp.amount).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{exp.expense_date}</td>
                    <td className="py-3.5 px-4 text-muted-foreground truncate max-w-[150px]">{exp.notes || '-'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(exp)}
                          className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                          title={t('common.edit')}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(exp)}
                            className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Creator/Editor Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border animate-scale-in">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {formId ? t('expenses.editExpense') : t('expenses.addExpense')}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('expenses.amount')} *</label>
                <input
                  type="number"
                  required
                  min={0.01}
                  step={0.01}
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('expenses.category')} *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-2 outline-none focus:border-primary/50 focus:bg-background transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('expenses.date')} *</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('expenses.notes')}</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full h-16 rounded-xl border border-input bg-background/40 p-2.5 outline-none focus:border-primary/50 focus:bg-background transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-input hover:bg-muted font-bold text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/10"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
