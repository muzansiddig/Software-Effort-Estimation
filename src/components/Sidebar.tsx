import React, { useState } from 'react';
import {
  Calculator,
  Bot,
  History,
  User,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: 'estimate' | 'history';
  setActiveTab: (tab: 'estimate' | 'history') => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  onOpenAuth: () => void;
  currentUser: UserProfile | null;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  recordsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenAuth,
  currentUser,
  isChatOpen,
  setIsChatOpen,
  recordsCount = 0,
}) => {
  const isAr = lang === 'ar';
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleTabClick = (tab: 'estimate' | 'history') => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
            aria-label="Toggle Menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm">SEE Pro</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              isChatOpen ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Bot className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAuth}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 start-0 z-50 w-64 bg-slate-900 text-white border-e border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 h-screen ${
          isMobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full md:ltr:translate-x-0 md:rtl:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5">
          
          {/* Logo / Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white text-slate-900 flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div>
                <span className="font-black text-sm tracking-tight">SEE Pro</span>
                <span className="ms-1.5 text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  NASA93
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. تسجيل الدخول (User Login & Identity) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              {isAr ? 'تسجيل الدخول' : 'User Account'}
            </span>
            <div
              onClick={() => {
                onOpenAuth();
                setIsMobileOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 cursor-pointer transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-white truncate">
                  {currentUser ? currentUser.name : (isAr ? 'تسجيل الدخول' : 'Sign In')}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {currentUser ? (isAr ? currentUser.roleTitleAr : currentUser.roleTitle) : (isAr ? 'انقر للدخول' : 'Click to login')}
                </div>
              </div>
              <LogIn className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* 2. الهستري + التقدير الرئيسي */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              {isAr ? 'السجل والتقدير' : 'Estimation & History'}
            </span>
            
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('estimate')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'estimate'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Calculator className={`w-4 h-4 ${activeTab === 'estimate' ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{isAr ? 'منصة التقدير' : 'Estimation Studio'}</span>
              </button>

              <button
                onClick={() => handleTabClick('history')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{isAr ? 'الهستري والسجل' : 'Estimation History'}</span>
                </div>
                {recordsCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === 'history' ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {recordsCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* 3. البوت شات (AI Chatbot) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              {isAr ? 'البوت شات' : 'AI Chatbot'}
            </span>
            <button
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                setIsMobileOpen(false);
              }}
              className={`w-full p-3 rounded-xl border text-start transition-all flex items-center gap-3 ${
                isChatOpen
                  ? 'bg-slate-800 border-white text-white'
                  : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">
                    {isAr ? 'البوت شات الذكي' : 'AI Chatbot'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Groq & Gemini Copilot
                </p>
              </div>
            </button>
          </div>

        </div>

        {/* Footer Language Toggle */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-semibold text-center"
          >
            {lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}
          </button>
        </div>

      </aside>
    </>
  );
};
