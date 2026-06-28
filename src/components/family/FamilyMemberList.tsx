import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Phone, Mail, Heart, Calendar, Shield, MapPin, UserPlus, Trash2, Edit2, X, AlertOctagon } from 'lucide-react';

interface FamilyMemberListProps {
  members: any[];
  onSaveMember: (member: any) => Promise<any>;
  onDeleteMember: (id: string, name: string) => Promise<void>;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({
  members,
  onSaveMember,
  onDeleteMember
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    name: '', nickname: '', relation: '', dob: '', marriage_anniversary: '',
    gender: 'Male', blood_group: 'O+', phone: '', email: '', address: '',
    emergency_contact: '', occupation: '', medical_conditions: '', insurance_number: '', notes: ''
  });

  const openDetails = (member: any) => {
    setSelectedMember(member);
    setIsEditing(false);
  };

  const startCreate = () => {
    setEditForm({
      name: '', nickname: '', relation: '', dob: '', marriage_anniversary: '',
      gender: 'Male', blood_group: 'O+', phone: '', email: '', address: '',
      emergency_contact: '', occupation: '', medical_conditions: '', insurance_number: '', notes: ''
    });
    setIsEditing(true);
    setSelectedMember(null);
  };

  const startEdit = (member: any) => {
    setEditForm({ ...member });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveMember(editForm);
    setIsEditing(false);
    setSelectedMember(null);
  };

  const handleDelete = async (member: any) => {
    if (window.confirm(`Are you sure you want to move ${member.name} to the Recycle Bin?`)) {
      await onDeleteMember(member.id, member.name);
      setSelectedMember(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">{t('family.title')}</h3>
          <p className="text-xs text-muted-foreground">{t('family.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold shadow-md shadow-primary/10 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            {t('family.addMember')}
          </button>
        )}
      </div>

      {/* Member Grid */}
      {members.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <AlertOctagon className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium">{t('family.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => openDetails(member)}
              className="glass-card rounded-2xl p-5 hover-card-trigger cursor-pointer flex gap-4"
            >
              {/* Profile Photo Mock */}
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary shrink-0 uppercase">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground truncate">{member.name}</h4>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                    {member.relation}
                  </span>
                </div>
                <div className="space-y-1 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="truncate">{member.phone || t('common.none')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{member.email || t('common.none')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Drawer/Modal Overlay */}
      {selectedMember && !isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-border animate-scale-in max-h-[85vh] overflow-y-auto">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-border/60 pb-4 mb-4">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center font-bold text-2xl text-primary uppercase">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedMember.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedMember.relation} {selectedMember.nickname ? `(${selectedMember.nickname})` : ''}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{selectedMember.occupation || 'No occupation'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main profile properties */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-muted/30 p-3 rounded-2xl border border-border/40 space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Basic Info</span>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  DOB: {selectedMember.dob || t('common.none')}
                </p>
                <p className="font-semibold text-foreground">Gender: {selectedMember.gender}</p>
                {selectedMember.marriage_anniversary && (
                  <p className="font-semibold text-foreground">Anniversary: {selectedMember.marriage_anniversary}</p>
                )}
              </div>

              <div className="bg-muted/30 p-3 rounded-2xl border border-border/40 space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Medical & Insurance</span>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-destructive fill-destructive/20" />
                  Blood: {selectedMember.blood_group || t('common.none')}
                </p>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Ins: {selectedMember.insurance_number || t('common.none')}
                </p>
              </div>

              <div className="col-span-2 space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase px-0.5">Contacts</span>
                <div className="bg-muted/30 p-3 rounded-2xl border border-border/40 space-y-2">
                  <p className="text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <strong>Phone:</strong> {selectedMember.phone || t('common.none')}
                  </p>
                  <p className="text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <strong>Email:</strong> {selectedMember.email || t('common.none')}
                  </p>
                  <p className="text-foreground flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span><strong>Address:</strong> {selectedMember.address || t('common.none')}</span>
                  </p>
                </div>
              </div>

              <div className="col-span-2 bg-rose-500/5 border border-rose-500/10 p-3 rounded-2xl text-rose-600 dark:text-rose-400">
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Emergency Call-Out</span>
                <p className="font-semibold text-xs">
                  {selectedMember.emergency_contact || 'No emergency contact set'}
                </p>
              </div>

              {selectedMember.medical_conditions && (
                <div className="col-span-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl text-amber-700 dark:text-amber-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Allergies / Conditions</span>
                  <p className="text-xs leading-relaxed">{selectedMember.medical_conditions}</p>
                </div>
              )}

              {selectedMember.notes && (
                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase px-0.5">Notes</span>
                  <div className="bg-muted/20 p-3 rounded-2xl border border-border/40">
                    <p className="text-muted-foreground leading-relaxed italic">{selectedMember.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions for Admin */}
            {isAdmin && (
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/50">
                <button
                  onClick={() => startEdit(selectedMember)}
                  className="flex items-center justify-center flex-1 h-10 rounded-2xl border border-input bg-card text-foreground hover:bg-muted text-xs font-semibold gap-1.5 transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5 text-primary" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(selectedMember)}
                  className="flex items-center justify-center flex-1 h-10 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold gap-1.5 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('common.delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-border animate-scale-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {editForm.id ? t('family.editMember') : t('family.addMember')}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.name')} *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.nickname')}</label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.relation')} *</label>
                  <input
                    type="text"
                    required
                    value={editForm.relation}
                    placeholder="e.g. Father, Mother, Self"
                    onChange={(e) => setEditForm({ ...editForm, relation: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.occupation')}</label>
                  <input
                    type="text"
                    value={editForm.occupation}
                    onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.dob')} *</label>
                  <input
                    type="date"
                    required
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.anniversary')}</label>
                  <input
                    type="date"
                    value={editForm.marriage_anniversary}
                    onChange={(e) => setEditForm({ ...editForm, marriage_anniversary: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.bloodGroup')}</label>
                  <select
                    value={editForm.blood_group}
                    onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-2 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.insuranceNumber')}</label>
                  <input
                    type="text"
                    value={editForm.insurance_number}
                    onChange={(e) => setEditForm({ ...editForm, insurance_number: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.phone')}</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.email')}</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.address')}</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.emergencyContact')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Shah (Father) +91 99887 76655"
                    value={editForm.emergency_contact}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.medicalConditions')}</label>
                  <textarea
                    value={editForm.medical_conditions}
                    onChange={(e) => setEditForm({ ...editForm, medical_conditions: e.target.value })}
                    className="w-full h-16 rounded-xl border border-input bg-background/40 p-2.5 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-muted-foreground px-0.5">{t('family.notes')}</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full h-16 rounded-xl border border-input bg-background/40 p-2.5 outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
