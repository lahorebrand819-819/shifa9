import React, { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import {
  Sparkles,
  Send,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleIcon } from '../common/GoogleIcon';

interface ContactSectionProps {
  initialService?: string;
  initialPackage?: string;
  isStandalonePage?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  initialService = '',
  initialPackage = '',
  isStandalonePage = false
}) => {
  const { data, submitLead, currentCurrency, currentUser, addToast } = useAgency();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    company: currentUser?.company || '',
    service: initialService || initialPackage || 'Meta & Instagram Ads',
    budget: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isGoogleAutofilled, setIsGoogleAutofilled] = useState(!!currentUser?.email);

  const handleGoogleAutofill = () => {
    const autofillName = currentUser?.name || 'Farhan Malik';
    const autofillEmail = currentUser?.email || 'farhan.malik@gmail.com';
    const autofillCompany = currentUser?.company || 'E-Commerce Growth Brands';
    
    setFormData(prev => ({
      ...prev,
      name: autofillName,
      email: autofillEmail,
      company: prev.company || autofillCompany
    }));
    setIsGoogleAutofilled(true);
    addToast(`Connected with Google: ${autofillEmail}`, 'success');
  };

  // Update service if initialService changes
  useEffect(() => {
    if (initialService) {
      setFormData(prev => ({ ...prev, service: initialService }));
    } else if (initialPackage) {
      setFormData(prev => ({ ...prev, service: `Package: ${initialPackage}` }));
    }
  }, [initialService, initialPackage]);

  // Set default budget according to currency
  useEffect(() => {
    if (currentCurrency === 'PKR') {
      setFormData(prev => ({ ...prev, budget: 'Rs. 200,000 - Rs. 500,000 / mo' }));
    } else if (currentCurrency === 'GBP') {
      setFormData(prev => ({ ...prev, budget: '£1,500 - £4,000 / mo' }));
    } else {
      setFormData(prev => ({ ...prev, budget: '$2,000 - $5,000 / mo' }));
    }
  }, [currentCurrency]);

  const budgetOptions: Record<string, string[]> = {
    PKR: [
      'Under Rs. 150,000 / mo',
      'Rs. 150,000 - Rs. 350,000 / mo',
      'Rs. 350,000 - Rs. 750,000 / mo',
      'Rs. 750,000 - Rs. 2,000,000 / mo',
      'Rs. 2,000,000+ / mo (Enterprise Scale)'
    ],
    USD: [
      'Under $1,500 / mo',
      '$1,500 - $3,500 / mo',
      '$3,500 - $7,500 / mo',
      '$7,500 - $15,000 / mo',
      '$15,000+ / mo (Enterprise Scale)'
    ],
    GBP: [
      'Under £1,200 / mo',
      '£1,200 - £3,000 / mo',
      '£3,000 - £6,500 / mo',
      '£6,500 - £12,000 / mo',
      '£12,000+ / mo (Enterprise Scale)'
    ]
  };

  const services = data?.services?.map(s => s.title) || [
    'Meta & Instagram Ads',
    'Google Search & Shopping PPC',
    'SEO & Technical Authority',
    'TikTok Marketing & UGC',
    'High-Converting Web Development',
    'AI Marketing & Chatbots'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMsg('Please fill in your Name, Email, and Phone number.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      service: formData.service,
      budget: formData.budget,
      currency: currentCurrency,
      message: formData.message
    });

    setIsSubmitting(false);
    if (result.success) {
      setIsSubmitted(true);
    } else {
      setErrorMsg(result.error || 'Failed to submit proposal request. Please try again.');
    }
  };

  const settings = data?.settings;
  const agencyName = settings?.agencyName || settings?.name || 'Shifa Productions';
  const contactEmail = settings?.contactEmail || settings?.email || 'shifaproductions.official@gmail.com';
  const phone = settings?.phone || '+92 37062 64133';
  const address = settings?.address || 'Suite 402, Executive Heights, Tech Avenue, Lahore & London';
  const whatsappNumber = (settings?.whatsappNumber || '923706264133').replace(/[^0-9]/g, '') || '923706264133';
  const directWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi ${agencyName}, I just submitted an inquiry for ${formData.service || 'marketing services'}. Looking forward to discussing next steps!`
  )}`;

  return (
    <section id="contact" className={`py-24 relative bg-slate-950 ${isStandalonePage ? 'pt-32' : ''}`}>
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Info & Social Proof */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Let’s Build Something Formidable</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Ready to <span className="gradient-text">Scale Your Revenue?</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                Tell us about your brand and growth goals. Our senior strategists will analyze your funnel and prepare a bespoke 90-day growth roadmap within 24 hours.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Direct Email</div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm font-bold text-white hover:text-indigo-400 transition-colors"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">WhatsApp Direct Line</div>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    <span>{settings?.whatsappNumber ? `+${whatsappNumber}` : phone}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Instant Reply
                    </span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Global Headquarters</div>
                  <div className="text-sm font-bold text-white">
                    {address}
                  </div>
                </div>
              </div>

              {settings?.socialLinks?.linkedin && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Official LinkedIn</div>
                    <a
                      href={settings.socialLinks.linkedin.startsWith('http') ? settings.socialLinks.linkedin : `https://${settings.socialLinks.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5"
                    >
                      <span>Connect on LinkedIn</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* SLA Badge */}
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-400 shrink-0" />
              <div className="text-xs text-slate-300 font-normal">
                <strong className="text-white block font-bold">Fast Response Guarantee:</strong>
                Inquiries are triaged and assigned to senior media buyers within 2 business hours.
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Lead Submission Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
              
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-extrabold text-white">
                        Proposal Request Received!
                      </h3>
                      <p className="text-sm text-slate-300 font-normal max-w-md mx-auto leading-relaxed">
                        Thank you <strong className="text-white">{formData.name}</strong>. Our growth strategist is reviewing your submission and will reach out shortly via WhatsApp/Email.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1.5 text-slate-300">
                      <div><strong className="text-slate-400">Service:</strong> {formData.service}</div>
                      <div><strong className="text-slate-400">Target Budget:</strong> {formData.budget} ({currentCurrency})</div>
                      <div><strong className="text-slate-400">Contact:</strong> {formData.email} • {formData.phone}</div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <a
                        href={directWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 fill-slate-950" />
                        <span>Chat Instantly on WhatsApp</span>
                      </a>

                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            name: '',
                            email: '',
                            phone: '',
                            company: '',
                            service: 'Meta & Instagram Ads',
                            budget: '',
                            message: ''
                          });
                        }}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-xl font-extrabold text-white">Get Your Custom Growth Proposal</h3>
                      <p className="text-xs text-slate-400 mt-1 font-normal">
                        Fill in the details below to unlock an actionable growth audit for your brand.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs font-medium">
                        {errorMsg}
                      </div>
                    )}

                    {/* Continue with Google Autofill Banner */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white p-1.5 flex items-center justify-center shadow shrink-0">
                          <GoogleIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Continue with Google</span>
                            {isGoogleAutofilled && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                                Connected
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-300">
                            {isGoogleAutofilled
                              ? `Autofilled with ${formData.email}`
                              : '1-click instant fill for your name & email'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleAutofill}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <GoogleIcon className="w-3.5 h-3.5" />
                        <span>{isGoogleAutofilled ? 'Switch Google Account' : 'Continue with Google'}</span>
                      </button>
                    </div>

                    {/* Name & Email Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Morgan"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Work Email <span className="text-red-400">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleGoogleAutofill}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                          >
                            <GoogleIcon className="w-3 h-3" />
                            <span>Continue with Google</span>
                          </button>
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="alex@yourbrand.com"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            setIsGoogleAutofilled(false);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Phone & Company Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Phone / WhatsApp Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+92 300 0000000 / +1 555..."
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Company / Website URL
                        </label>
                        <input
                          type="text"
                          placeholder="yourbrand.com"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Service & Budget Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Primary Service Interested In
                        </label>
                        <select
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                          {services.map((s, idx) => (
                            <option key={idx} value={s}>
                              {s}
                            </option>
                          ))}
                          <option value="Full Funnel Retainer Package">Full Funnel Retainer Package</option>
                          <option value="Custom Enterprise Solution">Custom Enterprise Solution</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Estimated Monthly Growth Budget ({currentCurrency})
                        </label>
                        <select
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                          {(budgetOptions[currentCurrency] || budgetOptions.USD).map((b, idx) => (
                            <option key={idx} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message Box */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tell Us About Your Goals & Bottlenecks
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Current monthly revenue, target ROAS, past ad hurdles, timeline..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Strategy Audit Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Proposal Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Strict Privacy & NDA Guaranteed • No Spam Ever</span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
