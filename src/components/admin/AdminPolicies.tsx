import React, { useState, useMemo } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { PolicyItem } from '../../types';
import {
  ScrollText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  X,
  Save,
  Globe,
  Tag,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  Printer
} from 'lucide-react';

const CATEGORY_MAP: Record<string, { label: string; color: string; badgeBg: string }> = {
  privacy: { label: 'Privacy & Data', color: 'text-indigo-400', badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  terms: { label: 'Terms of Service', color: 'text-amber-400', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  refund: { label: 'Refund & Cancellation', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  cookies: { label: 'Cookie & Tracking', color: 'text-purple-400', badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  legal: { label: 'General Legal', color: 'text-blue-400', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  custom: { label: 'Custom Policy', color: 'text-teal-400', badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30' }
};

const TEMPLATE_PRESETS = [
  {
    name: 'Privacy Policy',
    category: 'privacy' as const,
    summary: 'Guidelines on client and telemetry data collection, pixel tracking, and visitor confidentiality.',
    content: `## 1. Overview & Data Commitment
We value your privacy. This policy covers the data we collect across digital marketing channels, advertising funnels, and our corporate website.

## 2. Information Collected
- **Contact Details:** Name, business email, phone, advertising budget range.
- **Telemetry & Pixels:** Anonymous user engagement data via Google Analytics 4 and Meta Conversion APIs.

## 3. Data Processing & Security
We utilize enterprise SSL encryption and role-based permissions. We never sell, lease, or distribute private client lists to external data brokers.

## 4. Contact Details
For privacy inquiries: privacy@digitalgrowthagency.com`
  },
  {
    name: 'Terms & Conditions',
    category: 'terms' as const,
    summary: 'Rules governing retainer agreements, deliverable approvals, ad spend liabilities, and intellectual property.',
    content: `## 1. Engagement & Retainers
By utilizing our marketing agency services, you agree to these Terms. Specific deliverables and project scopes are detailed in individual client invoices.

## 2. Ad Spend & Billing
- Direct advertising platform charges (Meta, Google, TikTok) are paid directly by the client and are separate from management fees.
- Monthly service retainers are invoiced in advance of each 30-day work cycle.

## 3. Intellectual Property
Upon complete payment of all due invoices, the client retains 100% commercial ownership of all custom design assets and ad creatives produced.

## 4. Performance Disclaimer
Digital marketing outcomes depend upon third-party ad auction variables, industry dynamics, and ad network policy updates. Specific financial results cannot be fully guaranteed.`
  },
  {
    name: 'Refund & Cancellation Policy',
    category: 'refund' as const,
    summary: 'Clear conditions for canceling monthly retainers, milestone deliverables, and non-refundable technical setup fees.',
    content: `## 1. Monthly Retainers
Monthly retainers are non-refundable once the 30-day cycle has commenced and campaign optimization has begun. Clients may cancel future cycles with a 30-day written notice.

## 2. Technical Setup & Tracking Audits
Upfront technical audits, tracking architecture installations, and landing page engineering fees are non-refundable after work delivery.

## 3. Milestone Projects
Fixed-price projects that are cancelled prior to final delivery will only be charged for completed milestones.`
  },
  {
    name: 'Cookie & Tracking Policy',
    category: 'cookies' as const,
    summary: 'Explanation of functional cookies, Google Analytics, and ad platform conversion tracking pixels.',
    content: `## 1. What Are Cookies?
Cookies are small configuration files stored on your browser to recall preferences and analyze website traffic.

## 2. Cookies We Utilize
- **Essential Cookies:** Maintain secure sessions and portal authentication.
- **Analytics & Marketing Pixels:** Measure advertising conversions (Meta Pixel, Google Tag Manager).

## 3. Opt-Out Preferences
Visitors may adjust browser privacy settings to reject non-essential cookies at any time.`
  },
  {
    name: 'Client Confidentiality & NDA',
    category: 'legal' as const,
    summary: 'Mutual non-disclosure agreement protecting client revenues, marketing playbooks, and ad account telemetry.',
    content: `## 1. Confidential Information
Both parties agree that all commercial strategies, product margins, conversion data, and proprietary creatives shared during the engagement constitute confidential information.

## 2. Non-Disclosure Obligations
Neither party shall disclose, publish, or disseminate confidential records to third parties without prior written approval.

## 3. Exclusions
Information publicly accessible without breach or independently developed is exempt from these terms.`
  }
];

export const AdminPolicies: React.FC = () => {
  const { data, createPolicy, updatePolicy, deletePolicy } = useAgency();
  const policies = data?.policies || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
  const [previewPolicy, setPreviewPolicy] = useState<PolicyItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PolicyItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState<PolicyItem['category']>('privacy');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formEffectiveDate, setFormEffectiveDate] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');

  // Open Edit or New
  const handleOpenEditor = (policy?: PolicyItem) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormTitle(policy.title);
      setFormSlug(policy.slug);
      setFormCategory(policy.category);
      setFormStatus(policy.status);
      setFormEffectiveDate(policy.effectiveDate || new Date().toISOString().split('T')[0]);
      setFormSummary(policy.summary || '');
      setFormContent(policy.content || '');
    } else {
      setEditingPolicy(null);
      setFormTitle('');
      setFormSlug('');
      setFormCategory('privacy');
      setFormStatus('published');
      setFormEffectiveDate(new Date().toISOString().split('T')[0]);
      setFormSummary('');
      setFormContent('');
    }
    setIsEditorOpen(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setFormTitle(newTitle);
    if (!editingPolicy || !formSlug) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormSlug(generatedSlug);
    }
  };

  const handleApplyTemplate = (template: typeof TEMPLATE_PRESETS[0]) => {
    setFormTitle(template.name);
    setFormSlug(template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    setFormCategory(template.category);
    setFormSummary(template.summary);
    setFormContent(template.content);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const finalSlug = (formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || `policy-${Date.now()}`;

    setIsSubmitting(true);
    try {
      if (editingPolicy) {
        await updatePolicy(editingPolicy.id, {
          title: formTitle.trim(),
          slug: finalSlug,
          category: formCategory,
          status: formStatus,
          effectiveDate: formEffectiveDate,
          summary: formSummary.trim(),
          content: formContent.trim()
        });
      } else {
        await createPolicy({
          title: formTitle.trim(),
          slug: finalSlug,
          category: formCategory,
          status: formStatus,
          effectiveDate: formEffectiveDate,
          summary: formSummary.trim(),
          content: formContent.trim()
        });
      }
      setIsEditorOpen(false);
      setEditingPolicy(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsSubmitting(true);
    try {
      await deletePolicy(deleteCandidate.id);
      setDeleteCandidate(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered List
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.summary && p.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [policies, searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ScrollText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Legal & Policies Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, modify, and delete compliance policies (Privacy Policy, Terms & Conditions, Refund Policy, Cookie Rules) displayed on your public website footer and client agreements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenEditor()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Policy</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search policies by title, slug, or content keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="privacy">Privacy & Data</option>
            <option value="terms">Terms of Service</option>
            <option value="refund">Refund & Cancellation</option>
            <option value="cookies">Cookie Policy</option>
            <option value="legal">General Legal</option>
            <option value="custom">Custom Policy</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Quick Summary Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] uppercase font-semibold tracking-wider text-slate-400">Total Policies</div>
          <div className="text-xl font-bold text-white mt-1">{policies.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] uppercase font-semibold tracking-wider text-emerald-400">Published Live</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {policies.filter(p => p.status === 'published').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] uppercase font-semibold tracking-wider text-amber-400">Drafts</div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {policies.filter(p => p.status === 'draft').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] uppercase font-semibold tracking-wider text-indigo-400">Public Live URL</div>
          <div className="text-xs font-mono text-slate-300 mt-1 truncate">/policy/[slug]</div>
        </div>
      </div>

      {/* Policy List / Cards */}
      {filteredPolicies.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
          <ScrollText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No policy documents found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search or filter options.'
              : 'Add your first policy (e.g., Privacy Policy or Terms and Conditions) to comply with marketing regulations.'}
          </p>
          <button
            onClick={() => handleOpenEditor()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Policy</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPolicies.map((policy) => {
            const cat = CATEGORY_MAP[policy.category] || CATEGORY_MAP.legal;
            const wordCount = policy.content ? policy.content.split(/\s+/).filter(Boolean).length : 0;
            const approxReadTime = Math.max(1, Math.ceil(wordCount / 200));

            return (
              <div
                key={policy.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
              >
                <div>
                  {/* Card Header: Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${cat.badgeBg}`}
                    >
                      {cat.label}
                    </span>

                    <div className="flex items-center gap-2">
                      {policy.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and Slug */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {policy.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>/policy/{policy.slug}</span>
                  </div>

                  {/* Summary */}
                  {policy.summary ? (
                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {policy.summary}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic mt-2.5">
                      No summary provided.
                    </p>
                  )}
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1" title="Last modified">
                      <Clock className="w-3 h-3" />
                      Updated: {policy.lastUpdated || policy.effectiveDate || 'Recent'}
                    </span>
                    <span>•</span>
                    <span>{wordCount} words (~{approxReadTime}m read)</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Live Preview Button */}
                    <button
                      onClick={() => setPreviewPolicy(policy)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit / Change Button */}
                    <button
                      onClick={() => handleOpenEditor(policy)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-indigo-300 hover:bg-indigo-600/10 border border-slate-700/60 hover:border-indigo-500/30 transition-all font-medium text-xs cursor-pointer"
                      title="Edit Policy"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteCandidate(policy)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE POLICY MODAL */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingPolicy ? `Edit Policy: ${editingPolicy.title}` : 'Create New Legal Policy'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Specify policy details, category, slug URL, and full markdown content.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePolicy} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Template Presets (Shown when creating new or updating) */}
              {!editingPolicy && (
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick-Start Templates (Click to Auto-Fill):</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {TEMPLATE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyTemplate(preset)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-[11px] font-medium text-slate-200 hover:text-indigo-200 border border-slate-700/60 hover:border-indigo-500/40 transition-all cursor-pointer"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title and Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Policy Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Privacy Policy"
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>URL Slug</span>
                  </label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-400">
                    <span className="text-slate-600">/policy/</span>
                    <input
                      type="text"
                      required
                      placeholder="privacy-policy"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full bg-transparent text-white focus:outline-none ml-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Category, Status, and Effective Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Policy Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="privacy">Privacy & Data</option>
                    <option value="terms">Terms of Service</option>
                    <option value="refund">Refund & Cancellation</option>
                    <option value="cookies">Cookie & Tracking</option>
                    <option value="legal">General Legal</option>
                    <option value="custom">Custom Policy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Publishing Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="published">Published (Visible in Footer)</option>
                    <option value="draft">Draft (Hidden from Public)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Effective Date</span>
                  </label>
                  <input
                    type="date"
                    value={formEffectiveDate}
                    onChange={(e) => setFormEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Summary / Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">
                    Brief Summary / Meta Description
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {formSummary.length}/250 characters
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={250}
                  placeholder="Short one-line explanation of what this policy covers for clients and visitors..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Full Content (Markdown / Text) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">
                    Full Policy Document Content <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Supports Markdown formatting (## Headings, - Bullet points, **Bold**)
                  </span>
                </div>
                <textarea
                  rows={12}
                  required
                  placeholder="Write or paste your policy text here in markdown format...&#10;&#10;## 1. Scope of Agreement&#10;Describe terms here...&#10;&#10;## 2. Client Rights&#10;- Right to audit&#10;- Right to data deletion"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed transition-all resize-y"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Save & Publish Policy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{previewPolicy.title}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Live Preview
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Effective: {previewPolicy.effectiveDate || 'Current'} • Last updated: {previewPolicy.lastUpdated || 'Current'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Print Document"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewPolicy(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950/50">
              {previewPolicy.summary && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                  <strong>Document Summary:</strong> {previewPolicy.summary}
                </div>
              )}

              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed font-sans">
                {previewPolicy.content.split('\n\n').map((block, i) => {
                  if (block.startsWith('## ')) {
                    return (
                      <h3 key={i} className="text-base sm:text-lg font-bold text-white pt-3 pb-1 border-b border-slate-800/80">
                        {block.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (block.startsWith('### ')) {
                    return (
                      <h4 key={i} className="text-sm sm:text-base font-semibold text-indigo-300 pt-2">
                        {block.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (block.startsWith('---')) {
                    return <hr key={i} className="border-slate-800 my-4" />;
                  }
                  if (block.startsWith('- ')) {
                    const items = block.split('\n').map(l => l.replace(/^- /, ''));
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1.5 text-slate-300">
                        {items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="whitespace-pre-line text-slate-300">{block}</p>;
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900 text-xs text-slate-500">
              <span>Status: <strong className="text-white capitalize">{previewPolicy.status}</strong></span>
              <button
                onClick={() => {
                  const toEdit = previewPolicy;
                  setPreviewPolicy(null);
                  handleOpenEditor(toEdit);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Policy</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteCandidate.title}"</strong>?
              This policy will be removed from your website footer and public compliance pages immediately.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-600/20"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
