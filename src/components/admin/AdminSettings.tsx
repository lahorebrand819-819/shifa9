import React, { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { AgencySettings, WebsiteSettings } from '../../types';
import { AdminPolicies } from './AdminPolicies';
import {
  Settings,
  Save,
  Lock,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  DollarSign,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ScrollText,
  ImageIcon,
  Wifi,
  WifiOff,
  Database,
  Radio,
  Loader2,
  RefreshCw
} from 'lucide-react';

type SettingsTab = 'general' | 'policies' | 'currencies' | 'security';

export const AdminSettings: React.FC = () => {
  const {
    data,
    updateSettings,
    changePassword,
    showToast,
    syncStatus,
    lastSyncedAt,
    serverVersion,
    isSavingSettings,
    broadcastSyncTest
  } = useAgency();
  const currentSettings = data?.settings;
  const policiesCount = data?.policies?.length || 0;

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const [formData, setFormData] = useState<AgencySettings>(() => {
    return (
      currentSettings || {
        agencyName: 'Shifa Productions',
        name: 'Shifa Productions',
        tagline: 'Scaling High-Growth Brands Through Performance Marketing & Creative Execution',
        description: '',
        email: 'shifaproductions.official@gmail.com',
        contactEmail: 'shifaproductions.official@gmail.com',
        phone: '+92 37062 64133',
        address: 'Executive Tower, Main Boulevard, Innovation District',
        whatsappNumber: '923706264133',
        whatsappMessage: 'Hi Shifa Productions, I want to discuss a video production & marketing project. Let’s talk strategy!',
        currencies: {
          PKR: { enabled: true, symbol: 'Rs.', name: 'Pakistani Rupee' },
          USD: { enabled: true, symbol: '$', name: 'US Dollar' },
          GBP: { enabled: true, symbol: '£', name: 'British Pound' }
        },
        defaultCurrency: 'PKR',
        socialLinks: {
          linkedin: 'https://www.linkedin.com/in/uzair-younas-b28941371?utm_source=share_via&utm_content=profile&utm_medium=member_android',
          twitter: 'https://twitter.com/shifaproductions',
          instagram: 'https://www.instagram.com/shifaproductions',
          facebook: 'https://www.facebook.com/share/1Faaqfxihc/',
          youtube: 'https://youtube.com/@shifaproductions'
        },
        footerText: '© 2026 Shifa Productions. All rights reserved.',
        copyrightText: '© 2026 Shifa Productions. All rights reserved. Built with precision for market leaders.',
        logo: '/shifa-logo.png',
        favicon: '/shifa-logo.png',
        primaryColor: '#6366f1',
        secondaryColor: '#a855f7',
        themeMode: 'dark',
        buttonStyle: 'rounded',
        seoTitle: 'Shifa Productions | Performance Marketing & AI Agency',
        seoDescription: 'Scale your brand with Shifa Productions.'
      }
    );
  });

  // Keep form synchronized when settings are loaded or updated from context/server
  useEffect(() => {
    if (currentSettings) {
      setFormData(prev => ({
        ...prev,
        ...currentSettings,
        agencyName: currentSettings.agencyName || currentSettings.name || prev.agencyName,
        name: currentSettings.name || currentSettings.agencyName || prev.name,
        email: currentSettings.email || currentSettings.contactEmail || prev.email,
        contactEmail: currentSettings.contactEmail || currentSettings.email || prev.contactEmail,
        phone: currentSettings.phone || prev.phone,
        tagline: currentSettings.tagline || prev.tagline,
        address: currentSettings.address || prev.address,
        logo: currentSettings.logo || prev.logo,
        favicon: currentSettings.favicon || prev.favicon,
        whatsappNumber: currentSettings.whatsappNumber || prev.whatsappNumber,
        whatsappMessage: currentSettings.whatsappMessage || prev.whatsappMessage,
        socialLinks: {
          ...prev.socialLinks,
          ...(currentSettings.socialLinks || {})
        },
        currencies: (currentSettings as any).currencies || prev.currencies
      }));
    }
  }, [currentSettings]);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedName = formData.agencyName || formData.name || 'Shifa Productions';
    const resolvedEmail = formData.email || formData.contactEmail || 'shifaproductions.official@gmail.com';
    const payload: Partial<WebsiteSettings> = {
      ...formData,
      name: resolvedName,
      agencyName: resolvedName,
      contactEmail: resolvedEmail,
      email: resolvedEmail
    };
    await updateSettings(payload);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsChangingPass(true);
    const result = await changePassword(oldPassword, newPassword);
    setIsChangingPass(false);

    if (result.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const [isTestingBroadcast, setIsTestingBroadcast] = useState(false);

  const handleTestBroadcast = async () => {
    setIsTestingBroadcast(true);
    await broadcastSyncTest();
    setIsTestingBroadcast(false);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header & Cross-Device Sync Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Agency & Global Settings</h2>
          <p className="text-xs text-slate-400">
            Configure agency contact, branding, client policies, multi-currency pricing, and real-time database settings.
          </p>
        </div>

        {/* Real-Time Cross-Device Synchronization Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="relative flex items-center justify-center">
              <span className={`w-2.5 h-2.5 rounded-full ${
                syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                syncStatus === 'reconnecting' ? 'bg-amber-500 animate-ping' : 'bg-rose-500'
              }`} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white">
                  {syncStatus === 'connected' ? 'Real-Time Sync Connected' :
                   syncStatus === 'reconnecting' ? 'Reconnecting Live Stream...' : 'Offline Mode'}
                </span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  v{serverVersion}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Synced {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestBroadcast}
            disabled={isTestingBroadcast}
            title="Send test signal across all connected devices and browsers"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {isTestingBroadcast ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Test Sync</span>
          </button>
        </div>
      </div>

      {/* Centralized Database Architecture Notification Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white flex items-center gap-2">
              <span>Centralized Persistent Database & Live SSE Streaming Active</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Multi-Device Synchronized
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Settings and content updates are saved to the central database and immediately broadcast to all active devices, browsers, and visitors without manual refresh.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 sm:text-right shrink-0">
          <span className="text-slate-500">Database Engine:</span> <span className="text-slate-300 font-medium">Atomic File + Supabase Ready</span>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>General Profile & Contact</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Legal & Policies</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'policies' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-500/20'
          }`}>
            {policiesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('currencies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'currencies'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Currencies & Localization</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* POLICIES TAB */}
      {activeTab === 'policies' && <AdminPolicies />}

      {/* GENERAL PROFILE TAB */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Brand & Contact Section */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">General Agency Profile</h3>
          </div>

          {/* Official Agency Logo Display */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-1.5 bg-slate-900 border border-amber-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-black/50">
                <img
                  src={formData.logo || '/shifa-logo.png'}
                  alt="Brand Logo"
                  className="h-12 w-12 object-cover rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/shifa-logo.png';
                  }}
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Brand Logo</h4>
                <p className="text-xs text-slate-400">Custom luxury embossed logo active on navbar, footer, and admin panel.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, logo: '/shifa-logo.png', favicon: '/shifa-logo.png' })}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              >
                Reset to Shifa Logo
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Logo URL / Asset Path</label>
              <input
                type="text"
                value={formData.logo || '/shifa-logo.png'}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                placeholder="/shifa-logo.png"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Favicon URL / Asset Path</label>
              <input
                type="text"
                value={formData.favicon || '/shifa-logo.png'}
                onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                placeholder="/shifa-logo.png"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Agency Name</label>
              <input
                type="text"
                required
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Public Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Office Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Agency Hero Headline / Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* WhatsApp Real-Time Direct Contact Configuration */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">WhatsApp Integration & Floating CTA</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Phone Number (with country code, no + or spaces)
              </label>
              <input
                type="text"
                required
                placeholder="923001234567"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Prefilled Greeting Message
              </label>
              <input
                type="text"
                value={formData.whatsappMessage}
                onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Social Profiles */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Social & Agency Links</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={formData.socialLinks.linkedin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Twitter / X</label>
              <input
                type="text"
                value={formData.socialLinks.twitter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram</label>
              <input
                type="text"
                value={formData.socialLinks.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Facebook</label>
              <input
                type="text"
                value={formData.socialLinks.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Global Settings */}
        <button
          type="submit"
          disabled={isSavingSettings}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          {isSavingSettings ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving to Central Database & Syncing...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile Settings & Sync</span>
            </>
          )}
        </button>
      </form>
      )}

      {/* TAB 3: CURRENCIES & LOCALIZATION */}
      {activeTab === 'currencies' && (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Multi-Currency Global Switcher</h3>
            </div>

            <p className="text-xs text-slate-400">
              Configure currencies activated for conversion across services, pricing tables, and client proposals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">PKR (Pakistani Rupee)</span>
                  <input
                    type="checkbox"
                    checked={formData.currencies.PKR.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currencies: {
                          ...formData.currencies,
                          PKR: { ...formData.currencies.PKR, enabled: e.target.checked }
                        }
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Prefix: Rs. (Formatted with commas)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">USD (US Dollar)</span>
                  <input
                    type="checkbox"
                    checked={formData.currencies.USD.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currencies: {
                          ...formData.currencies,
                          USD: { ...formData.currencies.USD, enabled: e.target.checked }
                        }
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Prefix: $ (International clients)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">GBP (British Pound)</span>
                  <input
                    type="checkbox"
                    checked={formData.currencies.GBP.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currencies: {
                          ...formData.currencies,
                          GBP: { ...formData.currencies.GBP, enabled: e.target.checked }
                        }
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Prefix: £ (UK clients)</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Default Selected Currency</label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value as any })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingSettings}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSavingSettings ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Central Database & Syncing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Currency Settings & Sync</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* TAB 4: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Change Master Admin Password</h3>
          </div>

          <p className="text-xs text-slate-400">
            Keep your agency control panel protected. Update master credentials below.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
