import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { dataService } from './lib/dataService';

// Layout & Core Screens
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Login } from './components/layout/Login';

// Pages
import { Dashboard } from './components/dashboard/Dashboard';
import { DocumentVault } from './components/vault/DocumentVault';
import { ExpenseTracker } from './components/expenses/ExpenseTracker';
import { FamilyMemberList } from './components/family/FamilyMemberList';
import { EmergencyPage } from './components/emergency/EmergencyPage';
import { SettingsView } from './components/settings/SettingsView';
import { RecycleBin } from './components/vault/RecycleBin';

// Primitive components
import { Loader2, RefreshCcw, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // Tab & Search States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Quick actions trigger channels
  const [openUploadTrigger, setOpenUploadTrigger] = useState(false);
  const [openExpenseTrigger, setOpenExpenseTrigger] = useState(false);

  // Database Data States
  const [documents, setDocuments] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  
  const [dbLoading, setDbLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  // Sync online status
  useEffect(() => {
    const goOnline = () => setOfflineMode(false);
    const goOffline = () => setOfflineMode(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Fetch Database tables
  const refreshAllData = async () => {
    if (!user) return;
    setDbLoading(true);
    try {
      const [
        memberData,
        expenseData,
        folderData,
        documentData,
        eventData,
        emergencyData,
        activityData
      ] = await Promise.all([
        dataService.getFamilyMembers(),
        dataService.getExpenses(),
        dataService.getFolders(),
        dataService.getDocuments(),
        dataService.getEvents(),
        dataService.getEmergencyContacts(),
        dataService.getActivityLogs()
      ]);

      setMembers(memberData);
      setExpenses(expenseData);
      setFolders(folderData);
      setDocuments(documentData);
      setEvents(eventData);
      setEmergencyContacts(emergencyData);
      setActivityLogs(activityData);
    } catch (err) {
      console.error('Failed to load vault database records:', err);
    } finally {
      setDbLoading(false);
    }
  };

  // Refetch when user signs in
  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user]);

  // Unified save wrappers
  const handleSaveMember = async (member: any) => {
    try {
      const saved = await dataService.saveFamilyMember(member);
      await refreshAllData();
      return saved;
    } catch (err) {
      alert(err);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    try {
      await dataService.softDeleteFamilyMember(id, name);
      await refreshAllData();
    } catch (err) {
      alert(err);
    }
  };

  const handleSaveExpense = async (expense: any) => {
    try {
      const saved = await dataService.saveExpense(expense);
      await refreshAllData();
      return saved;
    } catch (err) {
      alert(err);
    }
  };

  const handleDeleteExpense = async (id: string, title: string) => {
    try {
      await dataService.softDeleteExpense(id, title);
      await refreshAllData();
    } catch (err) {
      alert(err);
    }
  };

  const handleSaveContact = async (contact: any) => {
    try {
      const saved = await dataService.saveEmergencyContact(contact);
      await refreshAllData();
      return saved;
    } catch (err) {
      alert(err);
    }
  };

  const handleDeleteContact = async (id: string, name: string) => {
    try {
      await dataService.deleteEmergencyContact(id, name);
      await refreshAllData();
    } catch (err) {
      alert(err);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            documents={documents}
            expenses={expenses}
            members={members}
            activityLogs={activityLogs}
            events={events}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenDoc={(doc) => {
              // Redirect to vault and search/highlight document details
              setActiveTab('vault');
              setSearchQuery(doc.title);
            }}
          />
        );
      case 'vault':
        return (
          <DocumentVault
            documents={documents}
            folders={folders}
            members={members}
            searchQuery={searchQuery}
            onRefreshDocs={refreshAllData}
            onOpenUploadTrigger={openUploadTrigger}
            resetUploadTrigger={() => setOpenUploadTrigger(false)}
          />
        );
      case 'expenses':
        return (
          <ExpenseTracker
            expenses={expenses}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenExpenseTrigger={openExpenseTrigger}
            resetExpenseTrigger={() => setOpenExpenseTrigger(false)}
          />
        );
      case 'family':
        return (
          <FamilyMemberList
            members={members}
            onSaveMember={handleSaveMember}
            onDeleteMember={handleDeleteMember}
          />
        );
      case 'emergency':
        return (
          <EmergencyPage
            emergencyContacts={emergencyContacts}
            familyMembers={members}
            onSaveContact={handleSaveContact}
            onDeleteContact={handleDeleteContact}
          />
        );
      case 'recycle-bin':
        return <RecycleBin onRefreshAll={refreshAllData} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <div>Tab not found.</div>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Authenticating Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background transition-colors duration-200">
      {/* Sidebar - Collapsible on tablet, hidden on mobile */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main content wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Header Navigation bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenUpload={() => {
            setActiveTab('vault');
            setOpenUploadTrigger(true);
          }}
          onOpenExpense={() => {
            setActiveTab('expenses');
            setOpenExpenseTrigger(true);
          }}
        />

        {/* Offline Warning Banner */}
        {offlineMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/10 px-4 py-2.5 flex items-center justify-between text-xs text-amber-600 dark:text-amber-500 font-semibold shrink-0 animate-scale-in">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span>Offline Mode: Syncing updates locally. Database will update when network restores.</span>
            </div>
            <button
              onClick={refreshAllData}
              className="p-1 hover:bg-amber-500/10 rounded-lg transition-colors"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Inner Content panels viewport */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-64px)]">
          {dbLoading && documents.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground py-24">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : (
            renderActiveTab()
          )}
        </main>

        {/* Bottom Nav on Mobile layout */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
