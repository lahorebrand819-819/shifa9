import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { ClientProfile, ProjectItem } from '../../types';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Briefcase,
  UserCheck,
  Building2,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
  Filter
} from 'lucide-react';

interface AdminClientsProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminClients: React.FC<AdminClientsProps> = ({ onNavigateTab }) => {
  const { data, formatPrice, createClient, updateClient, deleteClient, createProject, addToast } = useAgency();

  const clients = data?.clients || [];
  const projects = data?.projects || [];
  const campaigns = data?.campaigns || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);

  // Quick project creation state from client drawer
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    serviceCategory: 'Meta Ads & Creative Production',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    assignedTeam: 'Hamza Tariq'
  });

  // Client Form State
  const [formData, setFormData] = useState<Partial<ClientProfile>>({
    companyName: '',
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    country: 'Pakistan',
    industry: 'E-Commerce / Retail',
    activeServices: ['Meta Ads (Facebook & Instagram)'],
    package: 'Scale Growth',
    monthlyRetainer: 150000,
    monthlyValueUSD: 540,
    currency: 'PKR',
    status: 'active',
    paymentStatus: 'Active Retainer',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    accountManager: 'Hamza Tariq',
    assignedTeamMember: 'Hamza Tariq',
    health: 'Healthy',
    totalRevenue: 150000,
    notes: ''
  });

  // Safe client filtering with full fallback safety for any legacy records
  const filteredClients = clients.filter(c => {
    const name = c.companyName || c.businessName || '';
    const contact = c.contactPerson || '';
    const email = c.email || '';
    const manager = c.accountManager || c.assignedTeamMember || '';
    const clientStatus = (c.status || c.paymentStatus || c.health || 'active').toLowerCase();

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && (clientStatus.includes('active') || clientStatus === 'paid' || clientStatus === 'healthy')) ||
      clientStatus.includes(statusFilter.toLowerCase());

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      companyName: '',
      businessName: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      country: 'Pakistan',
      industry: 'E-Commerce / Retail',
      activeServices: ['Meta Ads (Facebook & Instagram)'],
      package: 'Scale Growth',
      monthlyRetainer: 150000,
      monthlyValueUSD: 540,
      currency: 'PKR',
      status: 'active',
      paymentStatus: 'Active Retainer',
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      accountManager: 'Hamza Tariq',
      assignedTeamMember: 'Hamza Tariq',
      health: 'Healthy',
      totalRevenue: 150000,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: ClientProfile) => {
    const name = client.companyName || client.businessName || '';
    const services = client.activeServices || client.services || ['Meta Ads'];
    const retainer = client.monthlyRetainer || (client.monthlyValueUSD ? client.monthlyValueUSD * 278 : 150000);
    const manager = client.accountManager || client.assignedTeamMember || 'Hamza Tariq';

    setEditingClient(client);
    setFormData({
      ...client,
      companyName: name,
      businessName: name,
      activeServices: services,
      monthlyRetainer: retainer,
      accountManager: manager,
      assignedTeamMember: manager
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = (formData.companyName || formData.businessName || '').trim();
    if (!finalName || !formData.contactPerson?.trim() || !formData.email?.trim()) {
      addToast('Please fill in Company Name, Contact Person, and Email', 'error');
      return;
    }

    const services = formData.activeServices && formData.activeServices.length > 0 
      ? formData.activeServices 
      : ['Meta Ads (Facebook & Instagram)'];
    const retainer = Number(formData.monthlyRetainer) || 150000;
    const usdEquivalent = Math.round(retainer / 278);
    const manager = formData.accountManager || formData.assignedTeamMember || 'Hamza Tariq';

    const clientPayload: Partial<ClientProfile> = {
      ...formData,
      companyName: finalName,
      businessName: finalName,
      activeServices: services,
      services: services,
      monthlyRetainer: retainer,
      monthlyValueUSD: usdEquivalent,
      accountManager: manager,
      assignedTeamMember: manager,
      totalRevenue: formData.totalRevenue || retainer,
      status: formData.status || 'active',
      paymentStatus: (formData.status === 'active' ? 'Active Retainer' : 'Paid') as any,
      health: (formData.health || 'Healthy') as any
    };

    if (editingClient) {
      const success = await updateClient(editingClient.id, clientPayload);
      if (success) {
        setIsModalOpen(false);
        if (selectedClient?.id === editingClient.id) {
          setSelectedClient({ ...editingClient, ...clientPayload } as ClientProfile);
        }
      }
    } else {
      const success = await createClient(clientPayload);
      if (success) {
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from clients?`)) {
      await deleteClient(id);
      if (selectedClient?.id === id) {
        setSelectedClient(null);
      }
    }
  };

  const handleCreateProjectForClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newProjectData.title.trim()) {
      addToast('Please enter a project title', 'error');
      return;
    }

    const clientName = selectedClient.companyName || selectedClient.businessName || 'Client';
    const success = await createProject({
      title: newProjectData.title.trim(),
      projectName: newProjectData.title.trim(),
      client: clientName,
      clientId: selectedClient.id,
      serviceCategory: newProjectData.serviceCategory,
      service: newProjectData.serviceCategory,
      status: 'In Progress',
      progress: 25,
      progressPercent: 25,
      dueDate: newProjectData.dueDate,
      deadline: newProjectData.dueDate,
      assignedTeam: [newProjectData.assignedTeam || 'Hamza Tariq'],
      description: `Project commissioned for ${clientName}`
    });

    if (success) {
      setIsProjectModalOpen(false);
      setNewProjectData({
        title: '',
        serviceCategory: 'Meta Ads & Creative Production',
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        assignedTeam: 'Hamza Tariq'
      });
      addToast(`Project created for ${clientName}!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Agency Clients</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {clients.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active retainers, account managers, linked campaigns, and revenue attribution per brand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('projects')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Go to Projects</span>
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, contact person, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['all', 'active', 'onboarding', 'paused', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/40">
                <th className="py-3.5 px-4">Company & Contact</th>
                <th className="py-3.5 px-4">Active Services</th>
                <th className="py-3.5 px-4">Monthly Retainer</th>
                <th className="py-3.5 px-4">Status & Health</th>
                <th className="py-3.5 px-4">Account Lead</th>
                <th className="py-3.5 px-4">Since</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-300">No client accounts found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new client.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const companyName = client.companyName || client.businessName || 'Unnamed Client';
                  const servicesList = client.activeServices || client.services || [];
                  const monthlyVal = client.monthlyRetainer || (client.monthlyValueUSD ? client.monthlyValueUSD * 278 : 0);
                  const manager = client.accountManager || client.assignedTeamMember || 'Hamza Tariq';
                  const clientStatus = (client.status || client.paymentStatus || 'active').toLowerCase();
                  const phoneClean = (client.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setSelectedClient(client)}
                          className="font-bold text-white cursor-pointer hover:text-indigo-400 flex items-center gap-2"
                        >
                          <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{companyName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {client.contactPerson || 'Contact'} • {client.email} {client.phone ? `• ${client.phone}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {servicesList.slice(0, 2).map((srv, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                              {srv}
                            </span>
                          ))}
                          {servicesList.length > 2 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{servicesList.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {formatPrice(monthlyVal)}
                        <span className="text-[10px] text-slate-500 font-normal block">/ month</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            clientStatus.includes('active') || clientStatus === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : clientStatus.includes('onboard')
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : clientStatus.includes('pause') || clientStatus === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {(client.status || client.paymentStatus || 'ACTIVE').toUpperCase()}
                          </span>
                          {client.health && (
                            <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                              client.health === 'Healthy' ? 'text-emerald-400' : client.health === 'Needs Attention' ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                client.health === 'Healthy' ? 'bg-emerald-400' : client.health === 'Needs Attention' ? 'bg-amber-400' : 'bg-rose-400'
                              }`} />
                              <span>{client.health}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {manager}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {client.startDate || '2026-01-01'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {phoneClean && (
                            <a
                              href={`https://wa.me/${phoneClean}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 text-[11px] font-bold"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => handleOpenEdit(client)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id, companyName)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Client Profile Drawer */}
      {selectedClient && (() => {
        const companyName = selectedClient.companyName || selectedClient.businessName || 'Client';
        const clientServices = selectedClient.activeServices || selectedClient.services || [];
        const clientRetainer = selectedClient.monthlyRetainer || (selectedClient.monthlyValueUSD ? selectedClient.monthlyValueUSD * 278 : 0);
        const manager = selectedClient.accountManager || selectedClient.assignedTeamMember || 'Hamza Tariq';
        const clientProjects = projects.filter(p => (p.client || '').toLowerCase() === companyName.toLowerCase());
        const clientCampaigns = campaigns.filter(c => (c.client || '').toLowerCase() === companyName.toLowerCase());

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">{companyName}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      (selectedClient.status || selectedClient.paymentStatus) === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {(selectedClient.status || selectedClient.paymentStatus || 'ACTIVE').toUpperCase()}
                    </span>
                    {selectedClient.health && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {selectedClient.health}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span>Contact: {selectedClient.contactPerson}</span>
                    <span>• {selectedClient.email}</span>
                    {selectedClient.phone && <span>• {selectedClient.phone}</span>}
                    {selectedClient.country && <span>• {selectedClient.country}</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Monthly Retainer</div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">{formatPrice(clientRetainer)}</div>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Lifetime Revenue</div>
                  <div className="text-base font-black text-white mt-0.5">{formatPrice(selectedClient.totalRevenue || clientRetainer)}</div>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Account Lead</div>
                  <div className="text-base font-black text-indigo-400 mt-0.5">{manager}</div>
                </div>
              </div>

              {/* Active Services */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Retained Services:</span>
                <div className="flex flex-wrap gap-1.5">
                  {clientServices.map((srv, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Client Linked Projects */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Assigned Client Projects ({clientProjects.length}):</span>
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Project</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {clientProjects.length === 0 ? (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
                      <span>No active standalone projects assigned for this client.</span>
                      <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold hover:bg-indigo-600/30 text-[10px]"
                      >
                        Start Project
                      </button>
                    </div>
                  ) : (
                    clientProjects.map(p => {
                      const pTitle = p.title || p.projectName || 'Project';
                      const pCat = p.serviceCategory || p.service || 'Marketing';
                      const pProg = p.progress ?? p.progressPercent ?? 0;
                      const pDue = p.dueDate || p.deadline || 'Ongoing';

                      return (
                        <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white">{pTitle}</div>
                            <div className="text-[11px] text-slate-400">{pCat} • Due {pDue}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400">{pProg}% Complete</span>
                            <div className="text-[10px] text-slate-500">{p.status}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Client Linked Campaigns */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Active Live Campaigns ({clientCampaigns.length}):</span>
                <div className="space-y-2">
                  {clientCampaigns.length === 0 ? (
                    <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-500">No active ad sets tracked under this brand name</div>
                  ) : (
                    clientCampaigns.map(c => (
                      <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{c.name} ({c.platform})</div>
                          <div className="text-[11px] text-slate-400">Spend: {formatPrice(c.spend || c.spendUSD)} • Conversions: {c.conversions || 0}</div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-400">{c.roas}x ROAS</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Communication Notes */}
              {selectedClient.notes && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Account Notes & Strategy:</span>
                  <p className="text-slate-300 leading-relaxed">{selectedClient.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {selectedClient.phone && (
                    <a
                      href={`https://wa.me/${selectedClient.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Client</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleOpenEdit(selectedClient);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                  >
                    Edit Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* QUICK PROJECT CREATION MODAL FOR CLIENT */}
      {isProjectModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Create New Project</h3>
                <p className="text-xs text-slate-400">For {selectedClient.companyName || selectedClient.businessName}</p>
              </div>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectForClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Meta Shopping & Catalog Ads"
                  value={newProjectData.title}
                  onChange={(e) => setNewProjectData({ ...newProjectData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Service Category</label>
                <input
                  type="text"
                  value={newProjectData.serviceCategory}
                  onChange={(e) => setNewProjectData({ ...newProjectData, serviceCategory: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newProjectData.dueDate}
                    onChange={(e) => setNewProjectData({ ...newProjectData, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Assigned Lead</label>
                  <input
                    type="text"
                    value={newProjectData.assignedTeam}
                    onChange={(e) => setNewProjectData({ ...newProjectData, assignedTeam: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create / Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingClient ? 'Edit Client Account' : 'Add New Client'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName || formData.businessName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value, businessName: e.target.value })}
                    placeholder="e.g. Sapphire Apparel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Bilal Ahmed"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Monthly Retainer (PKR)</label>
                  <input
                    type="number"
                    value={formData.monthlyRetainer || 150000}
                    onChange={(e) => setFormData({ ...formData, monthlyRetainer: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Account Status</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Account Manager</label>
                  <input
                    type="text"
                    value={formData.accountManager || formData.assignedTeamMember || 'Hamza Tariq'}
                    onChange={(e) => setFormData({ ...formData, accountManager: e.target.value, assignedTeamMember: e.target.value })}
                    placeholder="e.g. Hamza Tariq"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Account Health</label>
                  <select
                    value={formData.health || 'Healthy'}
                    onChange={(e) => setFormData({ ...formData, health: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="At Risk">At Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry || 'E-Commerce / Retail'}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Fashion & Apparel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Active Services (comma-separated)</label>
                <input
                  type="text"
                  value={(formData.activeServices || formData.services || []).join(', ')}
                  onChange={(e) => {
                    const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setFormData({ ...formData, activeServices: list, services: list });
                  }}
                  placeholder="Meta Ads, Google Ads PPC, E-Commerce Dev"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Account Notes & Strategy</label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Goals, target ROAS, ad spend commitments..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
