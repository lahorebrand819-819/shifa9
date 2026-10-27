import React, { useState, useEffect, useRef } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { CurrencySelector } from '../common/CurrencySelector';
import { TELCA_SERVICES, TelcaServiceDefinition } from '../../data/telcaServicesConfig';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  Crown,
  Layers,
  Zap,
  Sliders,
  Shield,
  Clock,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PricingSectionProps {
  onSelectPackage?: (packageName: string) => void;
  onContactTeam?: () => void;
  isStandalonePage?: boolean;
  activeServiceId?: string;
  onServiceChange?: (serviceId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPackage,
  onContactTeam,
  isStandalonePage = false,
  activeServiceId: externalActiveServiceId,
  onServiceChange
}) => {
  const { data, formatPrice, currentCurrency } = useAgency();
  const [internalActiveServiceId, setInternalActiveServiceId] = useState<string>(
    externalActiveServiceId || 'meta-ads'
  );
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Sync external active service if provided
  useEffect(() => {
    if (externalActiveServiceId && externalActiveServiceId !== internalActiveServiceId) {
      setInternalActiveServiceId(externalActiveServiceId);
    }
  }, [externalActiveServiceId]);

  const activeServiceId = externalActiveServiceId || internalActiveServiceId;

  const handleSelectService = (id: string) => {
    setInternalActiveServiceId(id);
    if (onServiceChange) {
      onServiceChange(id);
    }
  };

  // Find active service configuration
  const currentService: TelcaServiceDefinition =
    TELCA_SERVICES.find(s => s.id === activeServiceId) || TELCA_SERVICES[0];

  // Helper to format price for a tier based on active currency
  const getTierPriceDisplay = (usdPrice: number) => {
    const pkrPrice = usdPrice * 280;
    const gbpPrice = Math.round(usdPrice * 0.79);
    return formatPrice(pkrPrice, usdPrice, gbpPrice);
  };

  // Handle CTA actions
  const handlePackageClick = (packageName: string) => {
    if (onSelectPackage) {
      onSelectPackage(`${currentService.name} - ${packageName}`);
    }
  };

  const handleCustomPlanClick = () => {
    if (onSelectPackage) {
      onSelectPackage(`${currentService.name} - Custom Plan`);
    } else if (onContactTeam) {
      onContactTeam();
    }
  };

  const handleTalkToTeam = () => {
    if (onContactTeam) {
      onContactTeam();
    } else if (onSelectPackage) {
      onSelectPackage(`${currentService.name} - General Consultation`);
    } else {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="pricing" className={`py-24 relative bg-slate-950 overflow-hidden ${isStandalonePage ? 'pt-32' : ''}`}>
      {/* Subtle Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[350px] bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dedicated Service Packages • Transparent Investment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Service Pricing & <span className="gradient-text">Growth Packages</span>
          </h2>

          <p className="text-base text-slate-300 leading-relaxed font-normal">
            Every service is backed by its own dedicated, scope-engineered packages. Select a service below to explore tailored deliverables and transparent pricing.
          </p>

          {/* Currency Switcher */}
          <div className="pt-3 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 shadow-md">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Display Currency:
              </span>
              <CurrencySelector />
            </div>
          </div>
        </div>

        {/* SERVICE SWITCHING TABS (All 10 Services) */}
        <div className="mb-10">
          <div className="text-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select a Marketing or Technology Service:
            </span>
          </div>

          {/* Horizontally scrollable container on mobile, wrapped on larger screens */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 px-1 no-scrollbar sm:flex-wrap sm:justify-center"
          >
            {TELCA_SERVICES.map((service) => {
              const isActive = service.id === activeServiceId;
              return (
                <button
                  key={service.id}
                  id={`tab-${service.id}`}
                  onClick={() => handleSelectService(service.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35 border border-indigo-400/50 scale-102'
                      : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <span>{service.tabLabel}</span>
                  {service.highlightBadge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-indigo-300 border border-slate-700'
                      }`}
                    >
                      {service.highlightBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE SERVICE PRICING CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentService.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Active Service Title & 1-line explanation */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentService.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {currentService.deliverableTime}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                  {currentService.shortExplanation}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Billing Structure
                  </span>
                  <span className="text-xs font-semibold text-indigo-300">
                    {currentService.starter.billingType === 'month' ? 'Monthly Retainer' : 'One-Time Project'}
                  </span>
                </div>
                <button
                  onClick={handleTalkToTeam}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ask a Question</span>
                </button>
              </div>
            </div>

            {/* 3 CORE TIERS GRID: STARTER, MEDIUM, GROWTH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* 1. STARTER TIER */}
              <div
                id={`package-${currentService.id}-starter`}
                className="relative rounded-2xl p-6 sm:p-7 bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  {/* Tier Title */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Tier 01
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Starter
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-white mb-2">
                    {currentService.starter.name}
                  </h4>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-slate-800">
                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {getTierPriceDisplay(currentService.starter.priceUSD)}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {currentService.starter.billingType === 'month' ? '/ month' : '/ project'}
                    </span>
                  </div>

                  {/* Short description */}
                  <p className="text-xs text-slate-300 font-normal leading-relaxed mb-6">
                    {currentService.starter.shortDescription}
                  </p>

                  {/* Feature list */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Scope:
                    </div>
                    {currentService.starter.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 font-normal">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    id={`btn-starter-${currentService.id}`}
                    onClick={() => handlePackageClick(currentService.starter.name)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    <span>{currentService.starter.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. MEDIUM TIER (MOST POPULAR) */}
              <div
                id={`package-${currentService.id}-medium`}
                className="relative rounded-2xl p-6 sm:p-7 bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 flex flex-col justify-between transition-all duration-300 md:-translate-y-1.5"
              >
                {/* Most Popular Badge */}
                <div className="absolute -top-3.5 inset-x-0 flex justify-center pointer-events-none">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg flex items-center gap-1.5 border border-white/20">
                    <Crown className="w-3 h-3" />
                    <span>{currentService.medium.badgeText}</span>
                  </span>
                </div>

                <div>
                  {/* Tier Title */}
                  <div className="flex items-center justify-between gap-2 mb-3 mt-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                      Tier 02
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Scale Solution
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-white mb-2">
                    {currentService.medium.name}
                  </h4>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-slate-800">
                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {getTierPriceDisplay(currentService.medium.priceUSD)}
                    </div>
                    <span className="text-xs text-indigo-300/80 font-medium">
                      {currentService.medium.billingType === 'month' ? '/ month' : '/ project'}
                    </span>
                  </div>

                  {/* Short description */}
                  <p className="text-xs text-slate-300 font-normal leading-relaxed mb-6">
                    {currentService.medium.shortDescription}
                  </p>

                  {/* Feature list */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                      Included Scope:
                    </div>
                    {currentService.medium.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-normal">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    id={`btn-medium-${currentService.id}`}
                    onClick={() => handlePackageClick(currentService.medium.name)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <span>{currentService.medium.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3. GROWTH TIER */}
              <div
                id={`package-${currentService.id}-growth`}
                className="relative rounded-2xl p-6 sm:p-7 bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 shadow-xl flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  {/* Tier Title */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
                      Tier 03
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Max Growth
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-white mb-2">
                    {currentService.growth.name}
                  </h4>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-slate-800">
                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {getTierPriceDisplay(currentService.growth.priceUSD)}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {currentService.growth.billingType === 'month' ? '/ month' : '/ project'}
                    </span>
                  </div>

                  {/* Short description */}
                  <p className="text-xs text-slate-300 font-normal leading-relaxed mb-6">
                    {currentService.growth.shortDescription}
                  </p>

                  {/* Feature list */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Scope:
                    </div>
                    {currentService.growth.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 font-normal">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    id={`btn-growth-${currentService.id}`}
                    onClick={() => handlePackageClick(currentService.growth.name)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    <span>{currentService.growth.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. DEDICATED CUSTOM PLAN OPTION */}
            <div
              id={`custom-plan-${currentService.id}`}
              className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/30 to-slate-900/95 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  <Sliders className="w-3 h-3 text-indigo-400" />
                  <span>Custom Architecture</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-white">
                  {currentService.custom.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {currentService.custom.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Custom KPIs & SLA</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dedicated Growth Squad</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Multi-Region / High-Spend Optimization</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <button
                  id={`btn-custom-${currentService.id}`}
                  onClick={handleCustomPlanClick}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold shadow-lg shadow-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentService.custom.ctaText}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* BOTTOM CONVERSION FOOTER & CONSULTATION CTA */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Need Strategic Guidance?</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Not sure which plan is right for your business?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 font-normal max-w-xl">
              Tell us your current monthly revenue, ad spend, and growth goals. Our strategists will outline the ideal roadmap and recommended package.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              id="btn-talk-to-team"
              onClick={handleTalkToTeam}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Talk to Our Team</span>
            </button>
          </div>
        </div>

        {/* PROFESSIONAL AGENCY COMMITMENT (Clean & Honest) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto text-center sm:text-left">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
            <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">No Locked-In Contracts</div>
              <div className="text-[11px] text-slate-400">Cancel or adjust month-to-month retainers anytime.</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Data-Driven Optimization</div>
              <div className="text-[11px] text-slate-400">Bi-weekly & weekly attribution reporting.</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
            <Zap className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Direct Communication</div>
              <div className="text-[11px] text-slate-400">Direct Slack & WhatsApp channel access.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
