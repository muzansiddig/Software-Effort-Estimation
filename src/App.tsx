import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { EstimationForm } from './components/EstimationForm';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryView } from './components/HistoryView';
import { ChatbotPanel } from './components/ChatbotPanel';
import { AuthModal } from './components/AuthModal';
import { NASA93Input, PredictionResult, EstimationRecord, UserProfile } from './types';
import { INITIAL_FORM_STATE } from './constants/nasa93_metadata';
import { 
  predictEffort, 
  getSavedEstimations, 
  saveEstimationRecord, 
  deleteEstimationRecord,
  loadCloudEstimations 
} from './services/api';
import { subscribeToAuth } from './services/firebase';

const USER_STORAGE_KEY = 'see_pro_auth_user';

export default function App() {
  const [activeTab, setActiveTab] = useState<'estimate' | 'history'>('estimate');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [form, setForm] = useState<NASA93Input>(INITIAL_FORM_STATE);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<EstimationRecord[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try { localStorage.removeItem(USER_STORAGE_KEY); } catch {}
  };

  useEffect(() => {
    // Initial local records
    setHistoryRecords(getSavedEstimations());

    // Load from Firestore
    loadCloudEstimations().then((recs) => {
      setHistoryRecords(recs);
    });

    // Subscribe to Firebase Auth
    const unsubscribe = subscribeToAuth((fbProfile) => {
      if (fbProfile) {
        setCurrentUser(fbProfile);
        try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fbProfile)); } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.equivphyskloc <= 0) {
      setError(lang === 'ar' ? 'يجب أن يكون حجم الكود (KLOC) أكبر من صفر.' : 'KLOC must be greater than 0.');
      return;
    }
    setLoading(true);
    setError('');
    setIsSaved(false);

    try {
      const pred = await predictEffort(form);
      setResult(pred);
    } catch (err: any) {
      setError(err.message || 'Failed to estimate');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!result) return;
    saveEstimationRecord({
      projectname: form.projectname,
      cat2: form.cat2,
      kloc: form.equivphyskloc,
      mode: form.mode,
      estimated_effort: result.estimated_effort,
      schedule_months: result.schedule_months,
      model: result.model,
      inputs: { ...form },
      createdBy: currentUser?.name,
      createdByUserEmail: currentUser?.email,
      userId: currentUser?.uid || currentUser?.id,
    });
    setHistoryRecords(getSavedEstimations());
    setIsSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar: Login, History, Chatbot */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        recordsCount={historyRecords.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
          
          {activeTab === 'estimate' && (
            <div className="space-y-6 animate-fade-in">
              {result && (
                <ResultDisplay
                  result={result}
                  input={form}
                  lang={lang}
                  onSave={handleSaveToHistory}
                  isSaved={isSaved}
                />
              )}
              <EstimationForm
                form={form}
                setForm={setForm}
                onSubmit={handleEstimate}
                loading={loading}
                error={error}
                lang={lang}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView
              records={historyRecords}
              onDeleteRecord={(id) => { 
                deleteEstimationRecord(id); 
                setHistoryRecords(getSavedEstimations()); 
              }}
              onLoadRecord={(inputs) => { 
                setForm(inputs); 
                setActiveTab('estimate'); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }}
              lang={lang}
            />
          )}

        </main>
      </div>

      {/* AI Chatbot Drawer */}
      <ChatbotPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        form={form}
        setForm={setForm}
        lang={lang}
      />

      {/* User Login & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        lang={lang}
      />

    </div>
  );
}
