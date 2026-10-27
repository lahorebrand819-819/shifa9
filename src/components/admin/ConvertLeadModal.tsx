import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAgency } from '../../context/AgencyContext';
import { LeadInquiry, ClientProfile } from '../../types';
import {
  Sparkles,
  Building2,
  UserCheck,
  DollarSign,
  Calendar,
  ArrowRight,
  CheckCircle2,
  X,
  Layers,
  Loader2,
  TrendingUp,
  Zap,
  Check,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface ConvertLeadModalProps {
  lead: LeadInquiry;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newClient: ClientProfile) => void;
  onNavigateToClients?: () => void;
}

const AVAILABLE_SERVICES = [
  'Social Media Marketing',
  'Meta & Instagram Ads',
  'Google Ads & Search PPC',
  'SEO & Organic Growth',
  'Creative UGC & Video Ads',
  'Website & Funnel Engineering',
  'TikTok Growth & Creator Ads',
  'AI Automation & CRM'
];

const ACCOUNT_MANAGERS = [
  { name: 'Hamza Tariq', role: 'Head of Growth' },
  { name: 'Ayesha Khan', role: 'Performance Director' },
  { name: 'Bilal Aslam', role: 'Lead Media Buyer' },
  { name: 'Daniyal Raza', role: 'Client Strategy Lead' }
];

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccess,
  onNavigateToClients
}) => {
  const { createClient, updateLeadStatus, addToast, formatPrice, currentCurrency } = useAgency();

  // Parse initial retainer from budget or fallback
  const parseInitialRetainer = (): number => {
    if (!lead.budget) return 150000;
    const digitsOnly = lead.budget.replace(/[^0-9]/g, '');
    const num = parseInt(digitsOnly, 10);
    if (!isNaN(num) && num > 1000) {
      return num;
    }
    return 150000;
  };

  // Form states
  const [companyName, setCompanyName] = useState(lead.company || (lead.name ? `${lead.name}'s Brand` : 'New Client'));
  const [contactPerson, setContactPerson] = useState(lead.name || '');
  const [email, setEmail] = useState(lead.email || '');
  const [phone, setPhone] = useState(lead.phone || '');
  const [website, setWebsite] = useState(lead.website || '');
  const [industry, setIndustry] = useState(lead.industry || 'E-Commerce / Retail');
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'GBP'>((lead.currency as any) || currentCurrency || 'PKR');
  const [monthlyRetainer, setMonthlyRetainer] = useState<number>(parseInitialRetainer());
  const [packageTier, setPackageTier] = useState<string>('Scale Accelerator');
  const [assignedManager, setAssignedManager] = useState<string>('Hamza Tariq');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [contractDuration, setContractDuration] = useState<string>('6 Months');
  const [internalNotes, setInternalNotes] = useState<string>(
    `Converted from qualified lead on ${new Date().toLocaleDateString()}. Original inquiry scope: ${lead.message || lead.service || 'Comprehensive Growth Marketing'}`
  );

  // Selected services state
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    if (lead.service) {
      const match = AVAILABLE_SERVICES.find(s => s.toLowerCase().includes(lead.service!.toLowerCase()) || lead.service!.toLowerCase().includes(s.toLowerCase()));
      return match ? [match] : [lead.service];
    }
    return ['Social Media Marketing', 'Meta & Instagram Ads'];
  });

  // Flow states: 'form' | 'processing' | 'success'
  const [flowState, setFlowState] = useState<'form' | 'processing' | 'success'>('form');
  const [createdClientData, setCreatedClientData] = useState<any>(null);

  const annualContractValue = monthlyRetainer * 12;

  const toggleService = (svc: string) => {
    setSelectedServices(prev => 
      prev.includes(svc)
        ? (prev.length > 1 ? prev.filter(s => s !== svc) : prev)
        : [...prev, svc]
    );
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim() || !email.trim()) {
      addToast('Please provide Company Name, Contact Person, and Email.', 'error');
      return;
    }

    setFlowState('processing');

    try {
      // Conversion delay for animated transition feel
      await new Promise(r => setTimeout(r, 900));

      const newClientPayload: Partial<ClientProfile> = {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim(),
        industry,
        country: lead.country || (currency === 'PKR' ? 'Pakistan' : currency === 'GBP' ? 'United Kingdom' : 'United States'),
        services: selectedServices,
        package: packageTier,
        monthlyValueUSD: currency === 'USD' ? monthlyRetainer : currency === 'GBP' ? Math.round(monthlyRetainer * 1.3) : Math.round(monthlyRetainer / 278),
        paymentStatus: 'Active Retainer',
        assignedTeamMember: assignedManager,
        health: 'Healthy',
        healthReason: 'Recently onboarded qualified inbound lead',
        startDate,
        renewalDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: internalNotes,
        projectsCount: 1,
        activeCampaignsCount: selectedServices.length
      };

      const success = await createClient(newClientPayload);

      if (success) {
        // Mark lead as won in pipeline
        await updateLeadStatus(lead.id, 'won', `Converted to Active Client (${companyName}) on ${new Date().toLocaleDateString()}`);
        setCreatedClientData(newClientPayload);
        setFlowState('success');
        addToast(`🎉 ${companyName} successfully converted to Active Client!`, 'success');
        if (onSuccess) {
          onSuccess(newClientPayload as ClientProfile);
        }
      } else {
        setFlowState('form');
        addToast('Failed to create client. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Lead conversion error:', err);
      setFlowState('form');
      addToast('An error occurred during conversion.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Animated Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={flowState === 'processing' ? undefined : onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
        />

        {/* Animated Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col z-10"
        >
          {/* Top Decorative Gradient Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shrink-0" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 shrink-0">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Converting Qualified Lead to Client</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Onboard {lead.name}</span>
                {lead.company && (
                  <span className="text-slate-400 font-semibold text-sm sm:text-base">
                    ({lead.company})
                  </span>
                )}
              </h2>
            </div>

            {flowState !== 'processing' && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Flow State 1: Form View */}
          {flowState === 'form' && (
            <form onSubmit={handleConvertSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Dynamic Value Snapshot Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-300 block">
                    Projected Retainer Value
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1.5 mt-0.5">
                    <span>{currency === 'PKR' ? 'Rs.' : currency === 'GBP' ? '£' : '$'}</span>
                    <span>{monthlyRetainer.toLocaleString()}</span>
                    <span className="text-xs font-semibold text-slate-400">/ month</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block">
                    Estimated Annual Value
                  </span>
                  <div className="text-base font-bold text-emerald-300 mt-0.5">
                    {currency === 'PKR' ? 'Rs.' : currency === 'GBP' ? '£' : '$'} {annualContractValue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Step 1: Client Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>1. Business & Client Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Client / Company Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Apparel Global"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Primary Contact Person <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Zubair Khan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Primary Email <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Direct WhatsApp / Phone <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Contract Services Scope */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>2. Enrolled Services</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {selectedServices.length} Selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SERVICES.map((svc) => {
                    const isSelected = selectedServices.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleService(svc)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{svc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Retainer & Commercial Terms */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>3. Retainer & Package Configuration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Currency</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['PKR', 'USD', 'GBP'] as const).map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setCurrency(curr)}
                          className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currency === curr
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Monthly Retainer Amount ({currency})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="5000"
                        min="1000"
                        value={monthlyRetainer}
                        onChange={(e) => setMonthlyRetainer(Number(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-black text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Presets for Retainer */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-500 font-bold shrink-0">Quick Presets:</span>
                  {(currency === 'PKR' ? [120000, 180000, 250000, 450000, 750000] : [750, 1200, 2000, 3500, 5000]).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMonthlyRetainer(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 font-semibold"
                    >
                      {currency === 'PKR' ? `Rs. ${(preset / 1000)}k` : `$${preset}`}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Account Manager Assigned
                    </label>
                    <select
                      value={assignedManager}
                      onChange={(e) => setAssignedManager(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    >
                      {ACCOUNT_MANAGERS.map((mgr) => (
                        <option key={mgr.name} value={mgr.name}>
                          {mgr.name} — {mgr.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Contract Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Initial Onboarding / Scope Notes
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Kickoff requirements, target ROAS, credentials needed..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Convert to Client</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {/* Flow State 2: Processing Animation */}
          {flowState === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center space-y-4 my-auto"
            >
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Converting Qualified Lead...</h3>
                <p className="text-xs text-slate-400">
                  Provisioning agency client profile, updating CRM stage to Won, and allocating retainers.
                </p>
              </div>
            </motion.div>
          )}

          {/* Flow State 3: Celebration & Success Animation */}
          {flowState === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="p-8 text-center space-y-6 my-auto overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, stiffness: 200, damping: 12 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mx-auto shadow-2xl shadow-emerald-500/30 ring-8 ring-emerald-500/20"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider inline-block">
                  Conversion Complete 🎉
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {companyName} is Now an Active Client!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  The lead has been successfully upgraded to won, retainer accounts are scheduled, and the project team has been notified.
                </p>
              </div>

              {/* Client Brief Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left max-w-md mx-auto space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="text-slate-500">Contact Lead:</span>
                  <span className="font-bold text-slate-200">{contactPerson}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="text-slate-500">Monthly Retainer:</span>
                  <span className="font-extrabold text-emerald-400">
                    {currency === 'PKR' ? 'Rs.' : currency === 'GBP' ? '£' : '$'} {monthlyRetainer.toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="text-slate-500">Assigned Manager:</span>
                  <span className="font-bold text-indigo-400">{assignedManager}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Services Active:</span>
                  <span className="font-bold text-slate-200 truncate max-w-[200px]">
                    {selectedServices.slice(0, 2).join(', ')}{selectedServices.length > 2 ? ` +${selectedServices.length - 2} more` : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onNavigateToClients && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToClients();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <span>View Clients Directory</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
