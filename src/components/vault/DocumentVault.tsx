import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { compressImage } from '../../utils/imageCompressor';
import {
  Folder,
  FileText,
  Grid,
  List,
  Upload,
  Star,
  Lock,
  Download,
  Trash2,
  X,
  Plus,
  Info,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Printer,
  ChevronRight,
  AlertCircle,
  Clock,
  Tag,
  Share2
} from 'lucide-react';

interface DocumentVaultProps {
  documents: any[];
  folders: any[];
  members: any[];
  searchQuery: string;
  onRefreshDocs: () => Promise<void>;
  onOpenUploadTrigger: boolean; // Flag to force upload modal open
  resetUploadTrigger: () => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  folders,
  members,
  searchQuery,
  onRefreshDocs,
  onOpenUploadTrigger,
  resetUploadTrigger
}) => {
  const { t } = useTranslation();
  const { user, vaultPin } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State Management
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal states
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [duplicatePromptFile, setDuplicatePromptFile] = useState<File | null>(null);
  const [duplicateDocMatch, setDuplicateDocMatch] = useState<any | null>(null);
  const [pinPromptDoc, setPinPromptDoc] = useState<any | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Upload Form states
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCat, setUploadCat] = useState('Aadhaar');
  const [uploadFolder, setUploadFolder] = useState('');
  const [uploadOwnerId, setUploadOwnerId] = useState('');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isProtected, setIsProtected] = useState(false);

  // Preview options state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [versions, setVersions] = useState<any[]>([]);
  const [shareSuccess, setShareSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Force open upload modal if quick action is clicked
  React.useEffect(() => {
    if (onOpenUploadTrigger) {
      setUploadFolder(selectedFolderId || folders[0]?.id || '');
      setIsUploadOpen(true);
      resetUploadTrigger();
    }
  }, [onOpenUploadTrigger, folders, selectedFolderId]);

  // Categories list
  const docCategories = [
    'Aadhaar', 'PAN', 'Passport', 'Driving License', 'Insurance',
    'Medical Reports', 'Property Papers', 'Vehicle RC', 'Birth Certificate',
    'Marriage Certificate', 'Income Tax', 'Electricity Bills', 'Gas Bills',
    'Water Bills', 'Education Certificates', 'Other'
  ];

  // Fetch document versions when details open
  const loadVersions = async (docId: string) => {
    try {
      const vers = await dataService.getDocumentVersions(docId);
      setVersions(vers);
    } catch {
      setVersions([]);
    }
  };

  // Determine Expiry Status color
  const getStatusColor = (doc: any) => {
    if (!doc.expiry_date) return 'bg-emerald-500/10 text-emerald-500';
    const today = new Date();
    const expiry = new Date(doc.expiry_date);
    const diff = expiry.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'bg-rose-500/10 text-rose-500'; // Expired
    if (days <= 30) return 'bg-amber-500/10 text-amber-500 animate-pulse'; // Expiring soon
    return 'bg-emerald-500/10 text-emerald-500'; // Active
  };

  const getStatusTextKey = (doc: any) => {
    if (!doc.expiry_date) return 'vault.active';
    const today = new Date();
    const expiry = new Date(doc.expiry_date);
    const diff = expiry.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'vault.expired';
    if (days <= 30) return 'vault.expiringSoon';
    return 'vault.active';
  };

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (doc.is_deleted) return false;
      
      // Folder check
      if (selectedFolderId && doc.folder_id !== selectedFolderId) return false;
      
      // Category check
      if (selectedCategory !== 'All' && doc.category !== selectedCategory) return false;
      
      // Global search check
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesDesc = doc.description?.toLowerCase().includes(query);
        const matchesOwner = doc.owner_name?.toLowerCase().includes(query);
        const matchesCat = doc.category.toLowerCase().includes(query);
        const matchesTags = doc.tags?.some((t: string) => t.toLowerCase().includes(query));
        const matchesOcr = doc.ocr_text?.toLowerCase().includes(query);
        
        return matchesTitle || matchesDesc || matchesOwner || matchesCat || matchesTags || matchesOcr;
      }
      
      return true;
    });
  }, [documents, selectedFolderId, selectedCategory, searchQuery]);

  // Handle document details click (checking password protection first)
  const handleDocClick = (doc: any) => {
    if (doc.is_password_protected) {
      setPinPromptDoc(doc);
      setPinInput('');
      setPinError(false);
    } else {
      setSelectedDoc(doc);
      setZoom(1);
      setRotation(0);
      loadVersions(doc.id);
    }
  };

  // PIN Verification
  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === vaultPin) {
      const doc = pinPromptDoc;
      setPinPromptDoc(null);
      setSelectedDoc(doc);
      setZoom(1);
      setRotation(0);
      loadVersions(doc.id);
    } else {
      setPinError(true);
    }
  };

  // Handle file select & check for duplicate
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadFileCheck(file);
    }
  };

  const processUploadFileCheck = (file: File) => {
    // Check duplicate by title/filename in the list
    const exactMatch = documents.find(
      (d) => !d.is_deleted && d.title.toLowerCase() === file.name.split('.')[0].toLowerCase()
    );

    if (exactMatch) {
      setDuplicateDocMatch(exactMatch);
      setDuplicatePromptFile(file);
    } else {
      setUploadFile(file);
      setUploadTitle(file.name.split('.')[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadFileCheck(file);
    }
  };

  // Perform upload logic (includes optional canvas image compression)
  const handleUploadSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const selectedFile = uploadFile || duplicatePromptFile;
    if (!selectedFile) return;

    setUploadProgress(20);
    
    // 1. Compression
    let finalFile: Blob | File = selectedFile;
    if (selectedFile.type.startsWith('image/')) {
      finalFile = await compressImage(selectedFile);
    }
    setUploadProgress(50);

    // Get owner details
    const owner = members.find(m => m.id === uploadOwnerId);
    
    // Save Document Payload
    const docData: any = {
      title: uploadTitle,
      description: uploadDesc,
      category: uploadCat,
      folder_id: uploadFolder,
      owner_id: uploadOwnerId || null,
      owner_name: owner ? owner.name : 'Shared',
      expiry_date: uploadExpiry || null,
      tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
      is_password_protected: isProtected,
      password_pin: isProtected ? vaultPin : null
    };

    // If duplicate replace decision was made, attach old ID
    if (duplicateDocMatch && duplicatePromptFile && !uploadFile) {
      docData.id = duplicateDocMatch.id;
    }

    try {
      setUploadProgress(80);
      await dataService.saveDocument(docData, finalFile as File);
      setUploadProgress(100);
      
      // Cleanup states
      setIsUploadOpen(false);
      setUploadFile(null);
      setDuplicatePromptFile(null);
      setDuplicateDocMatch(null);
      setUploadTitle('');
      setUploadDesc('');
      setUploadExpiry('');
      setUploadTags('');
      setUploadProgress(null);
      
      onRefreshDocs();
    } catch (err: any) {
      const errMsg = err?.message || err?.error_description || err?.details || JSON.stringify(err);
      alert('Upload failed: ' + errMsg);
      setUploadProgress(null);
    }
  };

  const handleDuplicateResolve = (decision: 'replace' | 'new_copy' | 'cancel') => {
    if (decision === 'replace' && duplicateDocMatch && duplicatePromptFile) {
      // Set values and execute overwrite upload
      setUploadTitle(duplicateDocMatch.title);
      setUploadDesc(duplicateDocMatch.description || '');
      setUploadCat(duplicateDocMatch.category);
      setUploadFolder(duplicateDocMatch.folder_id || '');
      setUploadOwnerId(duplicateDocMatch.owner_id || '');
      setIsProtected(duplicateDocMatch.is_password_protected);
      setUploadFile(null); // Triggers the duplicate matching file block in upload submit
      
      // Execute upload immediately
      setTimeout(() => {
        handleUploadSubmit();
      }, 100);
    } else if (decision === 'new_copy' && duplicatePromptFile) {
      // Create new document with suffix
      setUploadFile(duplicatePromptFile);
      setUploadTitle(duplicatePromptFile.name.split('.')[0] + ' (Copy)');
      setDuplicatePromptFile(null);
      setDuplicateDocMatch(null);
    } else {
      // Cancel
      setDuplicatePromptFile(null);
      setDuplicateDocMatch(null);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, doc: any) => {
    e.stopPropagation();
    try {
      await dataService.saveDocument({ ...doc, is_favorite: !doc.is_favorite });
      onRefreshDocs();
      if (selectedDoc && selectedDoc.id === doc.id) {
        setSelectedDoc({ ...selectedDoc, is_favorite: !selectedDoc.is_favorite });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocDelete = async () => {
    if (!selectedDoc) return;
    if (window.confirm(`Move "${selectedDoc.title}" to Recycle Bin?`)) {
      try {
        await dataService.softDeleteDocument(selectedDoc.id, selectedDoc.title);
        setSelectedDoc(null);
        onRefreshDocs();
      } catch (err) {
        alert(err);
      }
    }
  };

  // Preview utility controls
  const handlePrint = () => {
    if (!selectedDoc) return;
    const printWin = window.open(selectedDoc.file_url, '_blank');
    printWin?.print();
  };

  const getDownloadUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    return fileUrl.includes('?') ? `${fileUrl}&download=` : `${fileUrl}?download=`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 pb-20 md:pb-6 h-[calc(100vh-100px)] overflow-hidden animate-fade-in">
      {/* 1. Left Folders Tree panel */}
      <div className="w-full md:w-56 bg-card/40 border border-border/60 rounded-3xl p-4 shrink-0 flex flex-col max-h-[160px] md:max-h-full overflow-y-auto">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 block">
          {t('vault.folders')}
        </span>
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl shrink-0 transition-colors ${
              selectedFolderId === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Folder className="h-4 w-4" />
            <span>{t('vault.allDocuments')}</span>
          </button>
          
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl shrink-0 transition-colors ${
                selectedFolderId === f.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Middle Documents Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {/* Category filter pills */}
          <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCategory === 'All'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/80'
              }`}
            >
              All
            </button>
            {['Passport', 'Aadhaar', 'PAN', 'Insurance', 'Vehicle RC', 'Property Papers'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle and add buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center bg-card border border-border/60 rounded-xl p-0.5 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setUploadFolder(selectedFolderId || folders[0]?.id || '');
                setIsUploadOpen(true);
              }}
              className="flex items-center gap-1 h-9 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/10"
            >
              <Plus className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Documents Grid / List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredDocs.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">No documents matching filters found.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocClick(doc)}
                  className="glass-card rounded-2xl p-4 cursor-pointer hover-card-trigger relative flex flex-col justify-between h-40"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="h-5.5 w-5.5" />
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      {doc.is_password_protected && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      <button
                        onClick={(e) => handleFavoriteToggle(e, doc)}
                        className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                      >
                        <Star className={`h-4 w-4 ${doc.is_favorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h5 className="text-xs font-bold text-foreground truncate">{doc.title}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{doc.category} • {doc.owner_name}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-3">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getStatusColor(doc)}`}>
                      {t(getStatusTextKey(doc))}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card/40 border border-border/60 rounded-3xl overflow-hidden divide-y divide-border/60">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocClick(doc)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-foreground truncate">{doc.title}</h5>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{doc.category} • {doc.owner_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getStatusColor(doc)}`}>
                      {t(getStatusTextKey(doc))}
                    </span>
                    {doc.is_password_protected && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                    <button
                      onClick={(e) => handleFavoriteToggle(e, doc)}
                      className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                    >
                      <Star className={`h-4 w-4 ${doc.is_favorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. PIN Lock Prompt Dialog */}
      {pinPromptDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border animate-scale-in text-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">{t('vault.enterPin')}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t('vault.pinPrompt')}</p>

            <form onSubmit={verifyPin} className="space-y-4">
              {pinError && (
                <p className="text-[11px] font-semibold text-destructive animate-pulse">{t('vault.incorrectPin')}</p>
              )}
              <input
                type="password"
                maxLength={4}
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError(false);
                }}
                placeholder="••••"
                className="w-28 h-12 text-center text-xl font-bold tracking-widest rounded-2xl border border-input bg-background/50 focus:border-primary focus:bg-background outline-none transition-all"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinPromptDoc(null)}
                  className="flex-1 h-10 rounded-xl border border-input font-bold text-xs hover:bg-muted"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/10"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Duplicate Detection Prompt Dialog */}
      {duplicatePromptFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border animate-scale-in text-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">{t('vault.duplicateTitle')}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              {t('vault.duplicatePrompt', { name: duplicatePromptFile.name })}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDuplicateResolve('replace')}
                className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/15"
              >
                {t('vault.dupReplace')}
              </button>
              <button
                onClick={() => handleDuplicateResolve('new_copy')}
                className="w-full h-11 rounded-2xl border border-input bg-card text-foreground font-bold text-xs hover:bg-muted"
              >
                {t('vault.dupNewVersion')}
              </button>
              <button
                onClick={() => handleDuplicateResolve('cancel')}
                className="w-full h-11 rounded-2xl bg-destructive/10 text-destructive font-bold text-xs hover:bg-destructive/20"
              >
                {t('vault.dupCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Upload File Drawer / Dialog */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-border animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {t('vault.uploadFile')}
              </h3>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadFile(null);
                  setUploadTitle('');
                  setUploadDesc('');
                }}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadProgress !== null ? (
              <div className="py-12 text-center space-y-4">
                <span className="font-bold text-foreground text-sm">Uploading file... {uploadProgress}%</span>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                {/* Drag-n-Drop File Area */}
                {!uploadFile ? (
                  <div
                    ref={dragRef}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-muted/10 transition-all flex flex-col items-center justify-center gap-2.5"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground/60" />
                    <div>
                      <span className="font-bold text-foreground block">{t('vault.dropZone')}</span>
                      <span className="text-[10px] text-muted-foreground block mt-1">{t('vault.supportedFiles')}</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground truncate max-w-[240px]">{uploadFile.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="p-1.5 rounded-xl hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Document Title */}
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-muted-foreground px-0.5">Document Title *</label>
                    <input
                      type="text"
                      required
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-muted-foreground px-0.5">Description</label>
                    <textarea
                      value={uploadDesc}
                      onChange={(e) => setUploadDesc(e.target.value)}
                      className="w-full h-16 rounded-xl border border-input bg-background/40 p-2.5 outline-none focus:border-primary/50 focus:bg-background transition-all resize-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground px-0.5">{t('vault.categories')} *</label>
                    <select
                      value={uploadCat}
                      onChange={(e) => setUploadCat(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background/40 px-2 outline-none focus:border-primary/50 focus:bg-background transition-all"
                    >
                      {docCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Folder */}
                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground px-0.5">{t('vault.folders')} *</label>
                    <select
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background/40 px-2 outline-none focus:border-primary/50 focus:bg-background transition-all"
                    >
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Owner */}
                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground px-0.5">{t('vault.owner')}</label>
                    <select
                      value={uploadOwnerId}
                      onChange={(e) => setUploadOwnerId(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background/40 px-2 outline-none focus:border-primary/50 focus:bg-background transition-all"
                    >
                      <option value="">Shared (All family)</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground px-0.5">{t('vault.expiryDate')}</label>
                    <input
                      type="date"
                      value={uploadExpiry}
                      onChange={(e) => setUploadExpiry(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                    />
                  </div>

                  {/* Tags */}
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-muted-foreground px-0.5">{t('vault.tags')} (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="Passport, Visa, Travel"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background/40 px-3 outline-none focus:border-primary/50 focus:bg-background transition-all"
                    />
                  </div>

                  {/* Password protection toggle (Admin only) */}
                  {isAdmin && (
                    <div className="col-span-2 flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">{t('vault.pinProtected')}</span>
                        <span className="text-[10px] text-muted-foreground block">{t('settings.pinHint')}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isProtected}
                        onChange={(e) => setIsProtected(e.target.checked)}
                        className="h-4.5 w-4.5 rounded-lg border-input bg-background text-primary"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 mt-6 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadOpen(false);
                      setUploadFile(null);
                      setUploadTitle('');
                    }}
                    className="px-4 py-2 rounded-xl border border-input hover:bg-muted font-bold text-xs"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadFile}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. Document Previewer & Metadata Panel Drawer Overlay */}
      {selectedDoc && (
        <div className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm flex items-center justify-end">
          {/* Main Overlay panel slides from right */}
          <div className="w-full lg:w-[85vw] h-full bg-card border-l border-border flex flex-col lg:flex-row animate-slide-up shadow-2xl overflow-hidden pt-safe-pt pb-safe-pb">
            
            {/* Left: Custom Universal File Previewer viewport */}
            <div className="flex-1 bg-muted/40 flex flex-col relative h-[50vh] lg:h-full border-b lg:border-b-0 lg:border-r border-border/60">
              {/* Top toolbar */}
              <div className="h-12 border-b border-border/60 flex items-center justify-between px-4 bg-background/40 shrink-0">
                <span className="text-xs font-bold truncate max-w-[200px] md:max-w-md">{selectedDoc.title}</span>
                
                {/* Viewport Control Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    title={t('vault.zoomOut')}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] font-bold w-10 text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    title={t('vault.zoomIn')}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-[1px] bg-border mx-1" />
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    title={t('vault.rotate')}
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    title={t('vault.print')}
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-6 select-none relative">
                {selectedDoc.file_type.startsWith('image/') ? (
                  <img
                    src={selectedDoc.file_url}
                    alt={selectedDoc.title}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-border"
                  />
                ) : selectedDoc.file_type.includes('pdf') ? (
                  <iframe
                    src={`${selectedDoc.file_url}#toolbar=0`}
                    title="PDF Preview"
                    className="w-full h-full border border-border rounded-xl shadow-lg bg-card"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                ) : (
                  <div className="bg-card p-8 rounded-3xl border border-border text-center space-y-3 shrink-0 max-w-sm">
                    <FileText className="h-12 w-12 text-primary mx-auto" />
                    <h5 className="text-sm font-bold">Preview Not Available</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This file format ({selectedDoc.file_type.split('/').pop()?.toUpperCase()}) cannot be rendered directly. Please download the document to view its contents.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Metadata Panel (File Info, Versions, Downloads) */}
            <div className="w-full lg:w-96 flex flex-col h-[50vh] lg:h-full bg-card">
              {/* Header */}
              <div className="h-16 border-b border-border/60 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="h-4.5 w-4.5 text-primary" />
                  <span className="font-bold text-sm uppercase tracking-wider text-foreground">File Information</span>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Information scroll body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Meta details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-foreground leading-snug">{selectedDoc.title}</h4>
                    <p className="text-muted-foreground mt-1 leading-relaxed">{selectedDoc.description || 'No description provided.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Category</span>
                      <span className="font-bold text-foreground truncate block mt-0.5">{selectedDoc.category}</span>
                    </div>
                    <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Owner</span>
                      <span className="font-bold text-foreground truncate block mt-0.5">{selectedDoc.owner_name}</span>
                    </div>
                    <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Expiry Date</span>
                      <span className="font-bold text-foreground truncate block mt-0.5">
                        {selectedDoc.expiry_date || 'No expiration'}
                      </span>
                    </div>
                    <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">File Size</span>
                      <span className="font-bold text-foreground truncate block mt-0.5">
                        {(selectedDoc.file_size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags block */}
                {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDoc.tags.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted border border-border/40 text-[10px] font-semibold text-foreground">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document versions list */}
                <div className="space-y-3">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {t('vault.versionHistory')}
                  </span>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {/* Current version */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                      <div>
                        <span className="font-bold text-primary text-[10px] uppercase block">Current Version</span>
                        <span className="text-muted-foreground text-[10px]">
                          Uploaded by: {selectedDoc.owner_name}
                        </span>
                      </div>
                      <a
                        href={getDownloadUrl(selectedDoc.file_url)}
                        download={selectedDoc.title}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          dataService.incrementDownloadCount(selectedDoc.id);
                          onRefreshDocs();
                        }}
                        className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center"
                        title={t('common.download')}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* Older versions */}
                    {versions.map((ver) => (
                      <div key={ver.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40">
                        <div>
                          <span className="font-semibold text-foreground text-[10px] block">Version {ver.version}</span>
                          <span className="text-muted-foreground text-[10px]">
                            {new Date(ver.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={getDownloadUrl(ver.file_url)}
                          download={`${selectedDoc.title}_v${ver.version}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-input bg-card text-foreground hover:bg-muted transition-all flex items-center justify-center"
                          title={t('common.download')}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                  <a
                    href={getDownloadUrl(selectedDoc.file_url)}
                    download={selectedDoc.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      dataService.incrementDownloadCount(selectedDoc.id);
                      onRefreshDocs();
                    }}
                    className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    {t('common.download')}
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDoc.file_url);
                      setShareSuccess(true);
                      setTimeout(() => setShareSuccess(false), 2000);
                    }}
                    className={`flex-1 h-11 rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      shareSuccess 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold' 
                        : 'border-input bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    <Share2 className="h-4 w-4" />
                    {shareSuccess ? 'Link Copied!' : 'Share Link'}
                  </button>
                  
                  {isAdmin && (
                    <button
                      onClick={handleDocDelete}
                      className="h-11 px-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all shrink-0"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
