import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { PolicyItem } from '../../types';
import { PolicyModal } from '../public/PolicyModal';
import {
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ArrowUpRight,
  Shield,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Heart,
  ScrollText
} from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenAdminSettings?: () => void;
}

const toExternalUrl = (url?: string) => {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin, onOpenAdminSettings }) => {
  const { data } = useAgency();
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);

  const settings = data?.settings;
  const agencyName = settings?.agencyName || settings?.name || 'Shifa Productions';
  const social = settings?.socialLinks || {};
  const publishedPolicies = data?.policies?.filter(p => p.status === 'published') || [];

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Agency Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 p-2 pr-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-md">
                <img
                  src={settings?.logo || '/shifa-logo.png'}
                  alt={agencyName}
                  className="h-11 w-11 object-cover rounded-xl shadow border border-amber-500/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/shifa-logo.png';
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base text-white tracking-tight">
                      {agencyName}
                    </span>
                    <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Production &amp; Digital Marketing</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {settings?.footerText ||
                'Accelerating ambitious brands through high-impact paid ads, organic SEO dominance, bespoke e-commerce engines, and cutting-edge AI marketing automation.'}
            </p>

            {/* Social Media Links (Only display if configured) */}
            <div className="flex items-center gap-2.5 pt-2">
              {social.instagram && (
                <a
                  href={toExternalUrl(social.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-pink-400 flex items-center justify-center transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={toExternalUrl(social.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-blue-400 flex items-center justify-center transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={toExternalUrl(social.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-sky-400 flex items-center justify-center transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={toExternalUrl(social.youtube)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={toExternalUrl(social.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Core Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Growth Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
                >
                  <span>Meta & Instagram Ads</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Google Search & Shopping PPC
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  SEO & Technical Authority
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  TikTok Growth & UGC
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  High-Converting Web Development
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  AI Automation & Chatbots
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Agency Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Packages & Pricing (Multi-Currency)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('portfolio')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Portfolio & Client Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('case-studies')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Case Studies & Metrics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  About Our Team
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Marketing Insights Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <a
                  href={`mailto:${settings?.contactEmail}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {settings?.contactEmail || 'growth@digitalgrowthagency.com'}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <a href={`tel:${settings?.phone}`} className="hover:text-white transition-colors">
                  {settings?.phone || '+92 300 1234567'}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{settings?.address || 'Lahore & London Global Hubs'}</span>
              </li>
              <li className="pt-1">
                <button
                  onClick={() => onNavigate('contact')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-lg font-semibold text-xs transition-all"
                >
                  <span>Request Custom Audit</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Policies & Discreet Admin Link */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-900 mt-2">
          <p>
            {settings?.copyrightText?.includes('Digital Growth')
              ? '© 2026 Shifa Productions. All rights reserved. Built with precision for market leaders.'
              : settings?.copyrightText ||
                '© 2026 Shifa Productions. All rights reserved.'}
          </p>

          {/* Dynamic Public Policies Links */}
          {publishedPolicies.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
              {publishedPolicies.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy)}
                  className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {policy.title}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-500">
              Crafted for high ROI
            </span>

            {/* Discreet Admin Settings & Control Panel Button */}
            <button
              onClick={onOpenAdminSettings || onOpenAdmin}
              className="group flex items-center gap-1.5 text-slate-500 hover:text-amber-400 transition-colors text-[11px] font-medium cursor-pointer"
              title="Open Agency Admin Settings & Control Panel"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500/70 group-hover:text-amber-400 transition-colors" />
              <span>Admin Settings & Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Public Policy Viewer Modal */}
      {selectedPolicy && (
        <PolicyModal
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </footer>
  );
};
