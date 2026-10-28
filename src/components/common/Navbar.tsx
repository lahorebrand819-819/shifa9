import React, { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { CurrencySelector } from './CurrencySelector';
import {
  Menu,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Phone,
  ShieldCheck,
  Lock,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleIcon } from './GoogleIcon';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenAdminSettings?: () => void;
  onOpenSignIn?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeSection, 
  onNavigate, 
  onOpenAdmin,
  onOpenAdminSettings,
  onOpenSignIn
}) => {
  const { data, isAuthenticated } = useAgency();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Services', id: 'services' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Portfolio', id: 'portfolio' },
    { label: 'Case Studies', id: 'case-studies' },
    { label: 'About', id: 'about' },
    { label: 'Blog', id: 'blog' },
    { label: 'Contact', id: 'contact' }
  ];

  const handleLinkClick = (id: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(id);
  };

  const agencyName = data?.settings?.agencyName || data?.settings?.name || 'Shifa Productions';
  const logo = data?.settings?.logo;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 overflow-visible ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-xl shadow-black/40 py-2.5 sm:py-3'
          : 'bg-transparent py-3 sm:py-4'
      }`}
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 overflow-visible">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none cursor-pointer shrink-0"
          aria-label={`${agencyName} Home`}
        >
          <div className="flex items-center shrink-0">
            <div className="p-0.5 rounded-xl bg-slate-900/90 border border-amber-500/30 group-hover:border-amber-400/60 shadow-md shadow-black/50 transition-all flex items-center overflow-hidden">
              <img
                src={logo || '/shifa-logo.png'}
                alt={agencyName}
                className="h-8 sm:h-9 w-8 sm:w-9 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/shifa-logo.png';
                }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-xs xs:text-sm sm:text-base lg:text-lg text-white tracking-tight group-hover:text-amber-400 transition-colors whitespace-nowrap">
                {agencyName}
              </span>
              <span className="hidden xs:inline-block text-[8px] sm:text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                OFFICIAL
              </span>
            </div>
            <p className="hidden xl:block text-[10px] text-slate-400 font-medium tracking-wide uppercase whitespace-nowrap">
              Production & Digital Marketing Agency
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 bg-slate-900/60 p-1 rounded-full border border-slate-800/80 backdrop-blur-md shrink-0">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-2.5 xl:px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls: Currency Selector, Admin, Sign In, Get Started, and Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0">
          {/* Currency Selector (Pill buttons for PKR / USD / GBP - visible on sm+) */}
          <div className="hidden sm:block shrink-0">
            <CurrencySelector variant="pills" />
          </div>

          {/* Admin Settings Button - Visible directly on mobile, tablet, and desktop */}
          <button
            onClick={onOpenAdminSettings || onOpenAdmin}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 xl:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
            title="Open Agency Admin Settings & Control Panel"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xl:inline">Admin Settings</span>
            <span className="inline xl:hidden">Admin</span>
          </button>

          {/* Visitor Sign In / Account Button - High contrast with Google Icon */}
          <button
            onClick={onOpenSignIn || onOpenAdmin}
            className="hidden xs:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/90 hover:border-indigo-500/50 transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-sm"
            title="Sign In or Continue with Google"
          >
            <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
          </button>

          {/* Get Started Primary Action Button - Always visible, never clipped, perfectly aligned */}
          <button
            onClick={() => handleLinkClick('contact')}
            className="relative group overflow-hidden flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4.5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer whitespace-nowrap"
            aria-label="Get Started with Shifa Productions"
          >
            <span className="tracking-tight">Get Started</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Mobile & Tablet Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer ml-0.5"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-6 py-5 overflow-hidden"
          >
            <div className="flex flex-col gap-2.5">
              {/* Mobile Drawer Brand Header - Explicitly shows Shifa Productions */}
              <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center">
                    <img
                      src={logo || '/shifa-logo.png'}
                      alt={agencyName}
                      className="h-8 w-8 object-cover rounded-lg"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/shifa-logo.png';
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white tracking-tight">{agencyName}</div>
                    <div className="text-[10px] text-amber-400 font-medium tracking-wide uppercase">Production & Agency</div>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OFFICIAL
                </span>
              </div>

              {/* Currency Selector */}
              <div className="pb-2 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currency:</span>
                <CurrencySelector />
              </div>

              {/* Admin Panel Quick Access Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAdminSettings) onOpenAdminSettings();
                  else onOpenAdmin();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/10 border border-amber-500/40 text-amber-300 transition-all cursor-pointer shadow-md my-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-xs flex items-center gap-1.5">
                      <span>Admin Control Panel</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        ADMIN
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-400/90 font-medium">Clients, Projects, Leads &amp; Settings</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
              </button>

              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                {/* 1-Tap Continue with Google Button */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenSignIn) onOpenSignIn();
                    else onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-md cursor-pointer"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleLinkClick('contact')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Free Proposal</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenAdminSettings) onOpenAdminSettings();
                      else onOpenAdmin();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenSignIn) onOpenSignIn();
                      else onOpenAdmin();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAuthenticated ? 'My Account' : 'Sign In'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
