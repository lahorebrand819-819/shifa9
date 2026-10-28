import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import {
  Lock,
  User,
  Mail,
  Building2,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  X,
  UserPlus,
  LogIn,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleIcon } from '../common/GoogleIcon';

export interface AdminLoginProps {
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ 
  onClose, 
  onSuccess, 
  initialMode = 'signin' 
}) => {
  const { login, registerUser, loginWithGoogle } = useAgency();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialMode);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpCompany, setSignUpCompany] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const result = await login(signInIdentifier, signInPassword);
    setIsLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setErrorMsg(result.error || 'Invalid credentials. Please verify your username/email and password.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const result = await registerUser({
      name: signUpName.trim(),
      email: signUpEmail.trim().toLowerCase(),
      company: signUpCompany.trim(),
      password: signUpPassword.trim()
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        onSuccess();
      }, 700);
    } else {
      setErrorMsg(result.error || 'Registration could not be completed. Please try again.');
    }
  };

  const handleQuickGoogleSignIn = async (userEmail = 'shifaproductions.pk.@gmail.com', userName = 'Shifa Productions Owner') => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithGoogle({
        name: userName,
        email: userEmail,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      setIsGoogleLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Google sign-in could not be completed.');
      }
    } catch {
      setIsGoogleLoading(false);
      setErrorMsg('Google sign-in encountered an issue. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          try {
            sessionStorage.setItem('shifa_auth_prompt_dismissed', 'true');
          } catch {}
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md my-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100 max-h-[92vh] overflow-y-auto"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-28 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Top Controls: Close (X) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
              Shifa Productions
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Continue with Google Action */}
        <div className="mb-5 space-y-2.5">
          <button
            type="button"
            disabled={isGoogleLoading || isLoading}
            onClick={() => handleQuickGoogleSignIn('shifaproductions.pk.@gmail.com', 'Shifa Productions Owner')}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4" />
                <span>Continue with Google (shifaproductions.pk.@gmail.com)</span>
              </>
            )}
          </button>

          {/* Account Selector Option */}
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Owner Google Verified</span>
            </span>
            <button
              type="button"
              onClick={() => setShowGoogleChooser(!showGoogleChooser)}
              className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              {showGoogleChooser ? 'Hide Google Accounts' : 'Switch Google Account'}
            </button>
          </div>

          {showGoogleChooser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
            >
              <div className="text-[11px] font-semibold text-slate-300">Choose Google Account:</div>
              <button
                type="button"
                onClick={() => handleQuickGoogleSignIn('shifaproductions.pk.@gmail.com', 'Shifa Productions Owner')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">
                    SP
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">shifaproductions.pk.@gmail.com</div>
                    <div className="text-[10px] text-amber-400 font-semibold">Primary Agency Owner / Super Admin</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickGoogleSignIn('lahorebrand819@gmail.com', 'Agency Director')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[10px] border border-indigo-500/30">
                    AD
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">lahorebrand819@gmail.com</div>
                    <div className="text-[10px] text-slate-400">Agency Director Admin</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickGoogleSignIn('client@yourcompany.com', 'Client Partner')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px] border border-slate-700">
                    CP
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">client@yourcompany.com</div>
                    <div className="text-[10px] text-slate-400">Client / Brand Portal Account</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Client</span>
              </button>
            </motion.div>
          )}

          {/* Divider */}
          <div className="relative pt-2 pb-1 flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
              or sign in with username &amp; password
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'signin' ? (
            /* ================= SIGN IN TAB ================= */
            <motion.form
              key="tab-signin"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignInSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="shifaproductions.pk.@gmail.com, marketing, or admin"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Admin Credentials fill */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Admin: <strong className="text-slate-300">shifaproductions.pk.@gmail.com</strong> / <strong className="text-slate-300">25802580</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSignInIdentifier('shifaproductions.pk.@gmail.com');
                    setSignInPassword('25802580');
                  }}
                  className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold cursor-pointer text-[11px] transition-colors shrink-0"
                >
                  Quick Fill
                </button>
              </div>

              <div className="pt-2 text-center">
                <span className="text-xs text-slate-400">
                  New to Shifa Productions?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setErrorMsg('');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Create an account
                  </button>
                </span>
              </div>
            </motion.form>
          ) : (
            /* ================= CREATE ACCOUNT TAB ================= */
            <motion.form
              key="tab-signup"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignUpSubmit}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Sarah Jenkins"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business / Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="sarah@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company or Brand Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signUpCompany}
                    onChange={(e) => setSignUpCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Acme Growth Inc."
                    autoComplete="organization"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password <span className="text-slate-400 font-normal">(min 6 characters)</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Create secure password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <span className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setErrorMsg('');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Guest / Dismiss Option */}
        <div className="mt-4 pt-3 border-t border-slate-800/70 text-center">
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem('shifa_auth_prompt_dismissed', 'true');
              } catch {}
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
          >
            Maybe later • Continue browsing as guest
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const AuthModal = AdminLogin;

