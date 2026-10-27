import React, { useState, useEffect } from 'react';
import { AgencyProvider, useAgency } from './context/AgencyContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { Toast } from './components/common/Toast';
import { HeroSection } from './components/public/HeroSection';
import { ServicesSection } from './components/public/ServicesSection';
import { ProcessSection } from './components/public/ProcessSection';
import { CaseStudiesSection } from './components/public/CaseStudiesSection';
import { PortfolioSection } from './components/public/PortfolioSection';
import { PricingSection } from './components/public/PricingSection';
import { AboutSection } from './components/public/AboutSection';
import { TestimonialsSection } from './components/public/TestimonialsSection';
import { BlogSection } from './components/public/BlogSection';
import { FAQSection } from './components/public/FAQSection';
import { ContactSection } from './components/public/ContactSection';
import { NewsletterSection } from './components/public/NewsletterSection';
import { AuthPromptPopup } from './components/public/AuthPromptPopup';
import { PolicyModal } from './components/public/PolicyModal';
import { PolicyItem } from './types';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isLoading, isAuthenticated, data, currentUser } = useAgency();
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyItem | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedService, setSelectedService] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedPricingServiceId, setSelectedPricingServiceId] = useState('meta-ads');

  // Automated 15-20s timer for visitor Sign In / Sign Up popup (centered)
  useEffect(() => {
    if (isAuthenticated || isAdminView) return;

    // Wipe any obsolete permanent storage block from previous sessions
    try {
      localStorage.removeItem('telca_auth_prompt_dismissed');
    } catch {}

    const timer = setTimeout(() => {
      const isDismissed = sessionStorage.getItem('telca_auth_prompt_dismissed');
      if (!isDismissed && !isAuthenticated && !isAdminView) {
        setAuthModalMode('signin');
        setShowLoginModal(true);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [isAuthenticated, isAdminView]);

  const handleOpenAdminSettings = () => {
    setAdminInitialTab('settings');
    if (isAuthenticated) {
      setIsAdminView(true);
    } else {
      setAuthModalMode('signin');
      setShowLoginModal(true);
    }
  };

  const handleOpenAdmin = (tab: string = 'dashboard') => {
    setAdminInitialTab(tab);
    if (isAuthenticated) {
      setIsAdminView(true);
    } else {
      setAuthModalMode('signin');
      setShowLoginModal(true);
    }
  };

  const handleOpenSignIn = () => {
    setAuthModalMode('signin');
    setShowLoginModal(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalMode('signup');
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // If user signs in or admin logs in, open the requested admin view
    setIsAdminView(true);
  };

  const handleOpenPolicy = (slugOrCategory: string) => {
    const policies = data?.policies || [];
    const matched = policies.find(
      p => p.slug.toLowerCase() === slugOrCategory.toLowerCase() || 
           p.category.toLowerCase() === slugOrCategory.toLowerCase()
    );
    if (matched) {
      setActivePolicyModal(matched);
    } else if (policies.length > 0) {
      setActivePolicyModal(policies[0]);
    }
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPackage = (pkgName: string) => {
    setSelectedPackage(pkgName);
    setSelectedService('');
    handleNavigate('contact');
  };

  const handleSelectService = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    setSelectedPackage('');
    handleNavigate('contact');
  };

  // Scroll listener to update active section in navbar
  useEffect(() => {
    if (isAdminView) return;

    const sections = ['home', 'services', 'pricing', 'portfolio', 'case-studies', 'about', 'blog', 'contact'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const sId of sections) {
        const el = document.getElementById(sId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-sm font-semibold tracking-wide">
          Loading Shifa Productions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Toast Notifications Container */}
      <Toast />

      {/* Admin Mode View */}
      {isAdminView && isAuthenticated ? (
        <AdminLayout 
          onExitAdmin={() => setIsAdminView(false)} 
          initialTab={adminInitialTab}
        />
      ) : (
        /* Public Live Website View */
        <>
          <Navbar
            activeSection={activeSection}
            onNavigate={handleNavigate}
            onOpenAdmin={() => handleOpenAdmin('dashboard')}
            onOpenAdminSettings={handleOpenAdminSettings}
            onOpenSignIn={handleOpenSignIn}
          />
          
          <main>
            <HeroSection
              onGetStarted={() => handleNavigate('contact')}
              onViewWork={() => handleNavigate('portfolio')}
            />
            <ServicesSection
              onSelectServiceForInquiry={handleSelectService}
              onViewPricingForService={(serviceId) => {
                setSelectedPricingServiceId(serviceId);
                handleNavigate('pricing');
              }}
            />
            <ProcessSection />
            <CaseStudiesSection />
            <PortfolioSection />
            <PricingSection
              activeServiceId={selectedPricingServiceId}
              onServiceChange={setSelectedPricingServiceId}
              onSelectPackage={handleSelectPackage}
              onContactTeam={() => handleNavigate('contact')}
            />
            <AboutSection />
            <TestimonialsSection />
            <BlogSection />
            <FAQSection />
            <ContactSection
              initialService={selectedService}
              initialPackage={selectedPackage}
            />
          </main>

          {/* Subscribe / Newsletter Section directly above the Footer */}
          <NewsletterSection onOpenPolicy={handleOpenPolicy} />

          <Footer 
            onNavigate={handleNavigate} 
            onOpenAdmin={() => handleOpenAdmin('dashboard')} 
            onOpenAdminSettings={handleOpenAdminSettings}
          />

          {/* Floating WhatsApp Quick Connect */}
          <WhatsAppButton />

          {/* Soft, Non-Intrusive Sign In / Sign Up Prompt (appears after 15-20s active browsing) */}
          <AuthPromptPopup
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
            isSuppressed={showLoginModal || !!activePolicyModal}
          />

          {/* Sign In / Sign Up Modal */}
          {showLoginModal && (
            <AdminLogin
              initialMode={authModalMode}
              onClose={() => setShowLoginModal(false)}
              onSuccess={handleLoginSuccess}
            />
          )}

          {/* Public Policy Viewer Modal */}
          {activePolicyModal && (
            <PolicyModal
              policy={activePolicyModal}
              onClose={() => setActivePolicyModal(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AgencyProvider>
      <MainContent />
    </AgencyProvider>
  );
}
