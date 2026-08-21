import React, { useState } from 'react';
import { UserCheck, X, LogIn, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle, signOutUser } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  lang: 'en' | 'ar';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('lead');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        onLogin(profile);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(isAr ? 'تعذر إتمام الدخول بحساب Google. يمكنك الدخول يدوياً بالأسفل.' : 'Google Sign-In failed. You can sign in manually below.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Sign out warning', e);
    }
    onLogout();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const roleMap: Record<UserProfile['role'], { en: string; ar: string }> = {
      lead: { en: 'Principal Lead Estimator', ar: 'كبير مقدري المشاريع' },
      manager: { en: 'Project Manager', ar: 'مدير المشروع' },
      engineer: { en: 'Software Engineer', ar: 'مهندس برمجيات' },
      researcher: { en: 'Research Scientist', ar: 'باحث أكاديمي' },
      admin: { en: 'System Administrator', ar: 'مسؤول النظام' },
    };

    onLogin({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@estimator.org`,
      role,
      roleTitle: roleMap[role].en,
      roleTitleAr: roleMap[role].ar,
    });
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-lg space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {currentUser ? (isAr ? 'الملف الشخصي والحساب' : 'User Profile') : (isAr ? 'تسجيل الدخول' : 'Sign In')}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {isAr ? 'سحابة Firebase والمزامنة الفورية' : 'Firebase Cloud & Auth Sync'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {currentUser ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-3">
                {currentUser.photoUrl ? (
                  <img src={currentUser.photoUrl} alt="Avatar" className="w-10 h-10 rounded-lg object-cover border border-slate-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-sm">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</h4>
                  <p className="text-slate-500 font-mono truncate">{currentUser.email}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                <span className="text-slate-500">{isAr ? 'الصفة المهنية:' : 'Role:'}</span>
                <strong className="text-slate-800">{isAr ? currentUser.roleTitleAr : currentUser.roleTitle}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-bold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
              <button onClick={onClose} className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg">
                {isAr ? 'إغلاق' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Google Sign-in with Firebase */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{googleLoading ? (isAr ? 'جارِ الاتصال...' : 'Connecting...') : (isAr ? 'متابعة باستخدام حساب Google' : 'Continue with Google')}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-mono uppercase">{isAr ? 'أو الدخول اليدوي' : 'Or Custom Profile'}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'أدخل اسمك الكامل...' : 'Enter your full name...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden text-slate-900 focus:bg-white focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden text-slate-900 focus:bg-white focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isAr ? 'الدور / الصفة' : 'Role'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden text-slate-900 focus:bg-white focus:border-slate-900"
                >
                  <option value="lead">{isAr ? 'كبير مقدري المشاريع (Lead Estimator)' : 'Principal Lead Estimator'}</option>
                  <option value="manager">{isAr ? 'مدير مشروع (Project Manager)' : 'Project Manager'}</option>
                  <option value="engineer">{isAr ? 'مهندس برمجيات (Software Engineer)' : 'Software Engineer'}</option>
                  <option value="researcher">{isAr ? 'باحث أكاديمي (Researcher)' : 'Researcher'}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isAr ? 'دخول وتفعيل الملف' : 'Sign In'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
