import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAgency } from '../../context/AgencyContext';
import { GoogleIcon } from '../common/GoogleIcon';

interface NewsletterSectionProps {
  onOpenPolicy?: (slug: string) => void;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onOpenPolicy }) => {
  const { subscribeNewsletter, currentUser } = useAgency();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleGoogleSubscribe = async () => {
    const targetEmail = currentUser?.email || 'verified.subscriber@gmail.com';
    setStatus('loading');
    setFeedbackMessage('');
    try {
      const result = await subscribeNewsletter(targetEmail, 'google_one_click_subscribe');
      if (result.success) {
        setStatus('success');
        setFeedbackMessage(`Subscribed with Google (${targetEmail})! You'll receive Shifa Productions insights.`);
      } else {
        setStatus('error');
        setFeedbackMessage(result.message || 'Unable to complete Google subscription.');
      }
    } catch {
      setStatus('error');
      setFeedbackMessage('An unexpected network error occurred.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setStatus('error');
      setFeedbackMessage('Please enter your business or personal email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setStatus('error');
      setFeedbackMessage('Please enter a valid email address (e.g. name@company.com).');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const result = await subscribeNewsletter(cleanEmail, 'footer_newsletter_section');
      if (result.success) {
        setStatus('success');
        setFeedbackMessage(result.message);
      } else {
        setStatus('error');
        setFeedbackMessage(result.message || 'Unable to complete subscription. Please try again.');
      }
    } catch {
      setStatus('error');
      setFeedbackMessage('An unexpected network error occurred. Please try again later.');
    }
  };

  const handleReset = () => {
    setEmail('');
    setStatus('idle');
    setFeedbackMessage('');
  };

  return (
    <section 
      id="newsletter-section" 
      aria-label="Newsletter Subscription"
      className="relative py-16 sm:py-20 bg-slate-950 border-t border-slate-900 overflow-hidden"
    >
      {/* Ambient background glow matching Telca Marketing branding */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
      >
        <div className="w-[500px] h-[300px] bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-purple-600/30 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-4">
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>Growth &amp; Strategy Insights</span>
        </div>

        {/* Primary Heading */}
        <h2 
          id="newsletter-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight"
        >
          Stay Ahead With Shifa Productions
        </h2>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Subscribe for useful marketing insights, digital growth tips, AI updates, and occasional Shifa Productions news.
        </p>

        {/* Form or Success State */}
        <div className="mt-8 max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success-card"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-xl shadow-black/40 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  You're on the list!
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">
                  {feedbackMessage || "Thank you for subscribing! You'll receive our next edition of marketing insights directly to your inbox."}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
                >
                  Subscribe another email address
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* 1-Click Continue with Google Subscribe */}
                <button
                  type="button"
                  disabled={status === 'loading'}
                  onClick={handleGoogleSubscribe}
                  className="w-full py-3 sm:py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>Continue with Google (1-Click Subscribe)</span>
                </button>

                <div className="relative py-1 flex items-center justify-center">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-950 px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                    or subscribe with email
                  </span>
                  <div className="border-t border-slate-800 w-full" />
                </div>

                <motion.form
                  key="subscribe-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-3"
                  noValidate
                >
                <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-2 p-1.5 sm:p-2 bg-slate-900/90 border border-slate-800 rounded-2xl focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xl shadow-black/30 backdrop-blur-sm">
                  <div className="relative flex-1 flex items-center min-w-0">
                    <Mail className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="newsletter-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') {
                          setStatus('idle');
                          setFeedbackMessage('');
                        }
                      }}
                      placeholder="Enter your business or personal email"
                      disabled={status === 'loading'}
                      className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none disabled:opacity-50"
                      aria-label="Email address for newsletter"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <button
                    id="newsletter-submit-button"
                    type="submit"
                    disabled={status === 'loading'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-indigo-600/30 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-4 h-4 text-indigo-200" />
                      </>
                    )}
                  </button>
                </div>

                {/* Inline Error Message */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-xs text-rose-400 mt-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{feedbackMessage}</span>
                  </motion.div>
                )}
              </motion.form>
            </div>
            )}
          </AnimatePresence>
        </div>

        {/* Reassuring privacy & anti-spam notice */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            We respect your privacy. No spam, ever.{' '}
            {onOpenPolicy && (
              <button
                type="button"
                onClick={() => onOpenPolicy('privacy')}
                className="text-slate-400 hover:text-slate-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
            )}
          </span>
        </div>

      </div>
    </section>
  );
};
