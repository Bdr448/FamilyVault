import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Phone, MapPin, Heart, Plus, Trash2, Edit2, X, AlertTriangle, Stethoscope } from 'lucide-react';

interface EmergencyPageProps {
  emergencyContacts: any[];
  familyMembers: any[];
  onSaveContact: (contact: any) => Promise<any>;
  onDeleteContact: (id: string, name: string) => Promise<void>;
}

export const EmergencyPage: React.FC<EmergencyPageProps> = ({
  emergencyContacts,
  familyMembers,
  onSaveContact,
  onDeleteContact
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Doctor');
  const [formPhone, setFormPhone] = useState('');
  const [formAltPhone, setFormAltPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDetails, setFormDetails] = useState('');

  const startCreate = () => {
    setFormId(null);
    setFormName('');
    setFormRole('Doctor');
    setFormPhone('');
    setFormAltPhone('');
    setFormAddress('');
    setFormDetails('');
    setIsFormOpen(true);
  };

  const startEdit = (c: any) => {
    setFormId(c.id);
    setFormName(c.name);
    setFormRole(c.role_or_relation);
    setFormPhone(c.phone);
    setFormAltPhone(c.alternate_phone || '');
    setFormAddress(c.address || '');
    setFormDetails(c.details || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    await onSaveContact({
      id: formId,
      name: formName,
      role_or_relation: formRole,
      phone: formPhone,
      alternate_phone: formAltPhone,
      address: formAddress,
      details: formDetails
    });

    setIsFormOpen(false);
  };

  const handleDelete = async (c: any) => {
    if (window.confirm(`Permanently remove emergency contact "${c.name}"?`)) {
      await onDeleteContact(c.id, c.name);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">{t('emergency.title')}</h3>
          <p className="text-xs text-muted-foreground">{t('emergency.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/10"
          >
            <Plus className="h-4 w-4" />
            {t('emergency.addContact')}
          </button>
        )}
      </div>

      {/* 2. Grid split: Left Helplines list, Right Blood registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Contacts List */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-0.5">
            {t('emergency.contacts')}
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-l-rose-500/80 relative"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-bold text-foreground">{contact.name}</h5>
                      <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400 mt-0.5 block uppercase tracking-wider">
                        {contact.role_or_relation}
                      </span>
                    </div>
                    {/* Admin actions */}
                    {isAdmin && (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => startEdit(contact)}
                          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {/* Protect default helplines from delete */}
                        {!['100', '101', '102', '100 / 112', '102 / 108'].includes(contact.phone) && (
                          <button
                            onClick={() => handleDelete(contact)}
                            className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-rose-500" />
                      {contact.phone}
                    </p>
                    {contact.alternate_phone && (
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {contact.alternate_phone}
                      </p>
                    )}
                    {contact.address && (
                      <p className="text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{contact.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {contact.details && (
                  <div className="mt-4 bg-muted/40 p-2.5 rounded-xl border border-border/30 text-[10px] text-muted-foreground leading-relaxed">
                    {contact.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Blood Registry & Quick medical view */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                {t('emergency.bloodRegistry')}
              </h4>
            </div>

            <div className="divide-y divide-border/60">
              {familyMembers.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.relation}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {member.medical_conditions && (
                      <div className="h-5 w-5 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center" title="Has medical notes">
                        <AlertTriangle className="h-3 w-3" />
                      </div>
                    )}
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-xs tracking-wider">
                      {member.blood_group || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick instructions widget */}
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-5 space-y-3 text-rose-600 dark:text-rose-400 text-xs">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              <h5 className="font-bold uppercase tracking-wide">Emergency Guidelines</h5>
            </div>
            <p className="leading-relaxed">
              1. Call the national emergency helpline number <strong>112</strong> immediately in severe accidents.
            </p>
            <p className="leading-relaxed">
              2. Refer to family medical cards stored under the <strong>Medical</strong> folder in the Document Vault.
            </p>
            <p className="leading-relaxed">
              3. Family health insurance IDs are logged inside each member's details panel on the family dashboard.
            </p>
          </div>
        </div>

      </div>

      {/* Emergency Contact Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border animate-scale-in">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {formId ? 'Edit Helpline' : 'Add Emergency Contact'}
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
                <label className="font-bold text-muted-foreground px-0.5">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('emergency.role')} *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-2 outline-none focus:border-primary/50 focus:bg-background transition-all"
                >
                  {['Doctor', 'Hospital', 'Insurance Agent', 'Ambulance', 'Police', 'Fire Department', 'Other Service'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('emergency.phone')} *</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('emergency.altPhone')}</label>
                <input
                  type="text"
                  value={formAltPhone}
                  onChange={(e) => setFormAltPhone(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('emergency.address')}</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground px-0.5">{t('emergency.details')}</label>
                <textarea
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
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
