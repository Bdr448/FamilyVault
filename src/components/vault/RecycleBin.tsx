import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { FileText, Receipt, Users, RotateCcw, Trash2 } from 'lucide-react';

interface RecycleBinProps {
  onRefreshAll: () => Promise<void>;
}

export const RecycleBin: React.FC<RecycleBinProps> = ({ onRefreshAll }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [deletedDocs, setDeletedDocs] = useState<any[]>([]);
  const [deletedExps, setDeletedExps] = useState<any[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const data = await dataService.getDeletedItems();
      setDeletedDocs(data.documents);
      setDeletedExps(data.expenses);
      setDeletedMembers(data.familyMembers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestore = async (type: 'documents' | 'expenses' | 'family_members', id: string) => {
    try {
      await dataService.restoreItem(type, id);
      await fetchDeleted();
      await onRefreshAll();
    } catch (err) {
      alert(err);
    }
  };

  const handlePurge = async (type: 'documents' | 'expenses' | 'family_members', id: string, title: string) => {
    if (window.confirm(`Are you absolutely sure you want to PERMANENTLY delete "${title}"? This cannot be undone.`)) {
      try {
        await dataService.purgeItem(type, id);
        await fetchDeleted();
        await onRefreshAll();
      } catch (err) {
        alert(err);
      }
    }
  };

  const hasItems = deletedDocs.length > 0 || deletedExps.length > 0 || deletedMembers.length > 0;

  if (loading) {
    return <div className="text-xs text-muted-foreground text-center py-20">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in text-xs font-semibold">
      {/* 1. Header */}
      <div>
        <h3 className="text-lg font-bold text-foreground">{t('recycleBin.title')}</h3>
        <p className="text-xs text-muted-foreground">{t('recycleBin.subtitle')}</p>
      </div>

      {!hasItems ? (
        <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <Trash2 className="h-12 w-12 text-muted-foreground/35 mb-3" />
          <p className="text-sm font-medium">{t('recycleBin.emptyBin')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* A. Documents section */}
          {deletedDocs.length > 0 && (
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-primary" />
                Deleted Documents
              </h4>

              <div className="divide-y divide-border/60">
                {deletedDocs.map((doc) => (
                  <div key={doc.id} className="py-3.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('recycleBin.deletedDate')}: {new Date(doc.deleted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore('documents', doc.id)}
                        className="flex items-center gap-1 h-8 px-3.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-[10px]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t('common.restore')}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handlePurge('documents', doc.id, doc.title)}
                          className="flex items-center gap-1 h-8 px-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all font-bold text-[10px]"
                          title={t('common.purge')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B. Expenses section */}
          {deletedExps.length > 0 && (
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Receipt className="h-4.5 w-4.5 text-primary" />
                Deleted Expenses
              </h4>

              <div className="divide-y divide-border/60">
                {deletedExps.map((exp) => (
                  <div key={exp.id} className="py-3.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{exp.title} (₹{exp.amount})</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('recycleBin.deletedDate')}: {new Date(exp.deleted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore('expenses', exp.id)}
                        className="flex items-center gap-1 h-8 px-3.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-[10px]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t('common.restore')}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handlePurge('expenses', exp.id, exp.title)}
                          className="flex items-center gap-1 h-8 px-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all font-bold text-[10px]"
                          title={t('common.purge')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. Family Members section */}
          {deletedMembers.length > 0 && (
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-primary" />
                Deleted Family Profiles
              </h4>

              <div className="divide-y divide-border/60">
                {deletedMembers.map((member) => (
                  <div key={member.id} className="py-3.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{member.name} ({member.relation})</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('recycleBin.deletedDate')}: {new Date(member.deleted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore('family_members', member.id)}
                        className="flex items-center gap-1 h-8 px-3.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-[10px]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t('common.restore')}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handlePurge('family_members', member.id, member.name)}
                          className="flex items-center gap-1 h-8 px-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all font-bold text-[10px]"
                          title={t('common.purge')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
