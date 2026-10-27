import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { ProjectItem } from '../../types';
import {
  Briefcase,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  X,
  UserCheck,
  Columns,
  ListFilter,
  BarChart2,
  Building2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const PROJECT_STATUSES = [
  { id: 'planning', label: 'Planning', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  { id: 'in-progress', label: 'In Progress', color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
  { id: 'review', label: 'Review & QA', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  { id: 'completed', label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' }
];

interface AdminProjectsProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({ onNavigateTab }) => {
  const { data, createProject, updateProject, deleteProject, addToast } = useAgency();
  const projects = data?.projects || [];
  const clients = data?.clients || [];

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const defaultClientName = clients[0]?.companyName || clients[0]?.businessName || 'General Client';

  const [formData, setFormData] = useState<Partial<ProjectItem>>({
    title: '',
    projectName: '',
    client: defaultClientName,
    serviceCategory: 'Meta Ads & Creative Production',
    service: 'Meta Ads & Creative Production',
    status: 'In Progress',
    progress: 35,
    progressPercent: 35,
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    assignedTeam: ['Hamza Tariq'],
    description: ''
  });

  // Helper to normalize status for comparison
  const normalizeStatus = (rawStatus?: string): string => {
    if (!rawStatus) return 'in-progress';
    const s = rawStatus.toLowerCase().trim();
    if (s.includes('plan')) return 'planning';
    if (s.includes('prog') || s.includes('active')) return 'in-progress';
    if (s.includes('review') || s.includes('qa') || s.includes('client')) return 'review';
    if (s.includes('comp') || s.includes('done')) return 'completed';
    return 'in-progress';
  };

  const filteredProjects = projects.filter(p => {
    const pTitle = p.title || p.projectName || '';
    const pClient = p.client || '';
    const pCategory = p.serviceCategory || p.service || '';
    const pNormStatus = normalizeStatus(p.status as string);

    const matchesStatus = statusFilter === 'all' || pNormStatus === statusFilter;
    const matchesSearch =
      pTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      projectName: '',
      client: clients[0]?.companyName || clients[0]?.businessName || 'Sapphire Retail',
      serviceCategory: 'Meta Ads & Creative Production',
      service: 'Meta Ads & Creative Production',
      status: 'In Progress',
      progress: 30,
      progressPercent: 30,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedTeam: ['Hamza Tariq'],
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: ProjectItem) => {
    const pTitle = proj.title || proj.projectName || '';
    const pCat = proj.serviceCategory || proj.service || '';
    const pProg = proj.progress ?? proj.progressPercent ?? 0;
    const pDue = proj.dueDate || proj.deadline || new Date().toISOString().split('T')[0];
    const team = Array.isArray(proj.assignedTeam) ? proj.assignedTeam : [proj.assignedTeam || 'Hamza Tariq'];

    setEditingProject(proj);
    setFormData({
      ...proj,
      title: pTitle,
      projectName: pTitle,
      serviceCategory: pCat,
      service: pCat,
      progress: pProg,
      progressPercent: pProg,
      dueDate: pDue,
      deadline: pDue,
      assignedTeam: team
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = (formData.title || formData.projectName || '').trim();
    const finalClient = (formData.client || '').trim();

    if (!finalTitle || !finalClient) {
      addToast('Please provide Project Name and Client', 'error');
      return;
    }

    const team = Array.isArray(formData.assignedTeam) 
      ? formData.assignedTeam 
      : [(formData.assignedTeam as any || 'Hamza Tariq')];
    const prog = typeof formData.progress === 'number' ? formData.progress : (formData.progressPercent || 30);
    const cat = formData.serviceCategory || formData.service || 'Performance Marketing';
    const due = formData.dueDate || formData.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const projectPayload: Partial<ProjectItem> = {
      ...formData,
      title: finalTitle,
      projectName: finalTitle,
      client: finalClient,
      serviceCategory: cat,
      service: cat,
      progress: prog,
      progressPercent: prog,
      dueDate: due,
      deadline: due,
      assignedTeam: team,
      status: formData.status || 'In Progress'
    };

    if (editingProject) {
      const success = await updateProject(editingProject.id, projectPayload);
      if (success) setIsModalOpen(false);
    } else {
      const success = await createProject(projectPayload);
      if (success) setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete project "${title}"?`)) {
      await deleteProject(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Client Projects Tracker</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {projects.length} Total Projects
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track deliverable milestones, development progress bars, client links, and team allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('clients')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Go to Clients</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project, client, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['all', 'planning', 'in-progress', 'review', 'completed'].map((st) => (
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

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/40">
                  <th className="py-3.5 px-4">Project Name & Client</th>
                  <th className="py-3.5 px-4">Service Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Assigned Team</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-bold text-slate-300">No projects found</p>
                      <p className="text-xs text-slate-500 mt-1">Create a new project or adjust your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    const normStatus = normalizeStatus(p.status as string);
                    const statusObj = PROJECT_STATUSES.find(s => s.id === normStatus) || PROJECT_STATUSES[1];
                    const pTitle = p.title || p.projectName || 'Untitled Project';
                    const pCategory = p.serviceCategory || p.service || 'Marketing Service';
                    const progressVal = p.progress ?? p.progressPercent ?? 0;
                    const dueDateVal = p.dueDate || p.deadline || 'Ongoing';
                    const teamMembers = Array.isArray(p.assignedTeam) ? p.assignedTeam : [p.assignedTeam || 'Hamza Tariq'];

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{pTitle}</div>
                          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>Client: {p.client}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-indigo-400">{pCategory}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${statusObj.bg} ${statusObj.color} border ${statusObj.border}`}>
                            {(p.status || statusObj.label).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 w-28">
                            <div className="flex justify-between text-[10px] font-bold text-slate-300">
                              <span>{progressVal}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, progressVal))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            {dueDateVal}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {teamMembers.map((mem, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                                {mem}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, pTitle)}
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
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROJECT_STATUSES.map((st) => {
            const list = filteredProjects.filter(p => normalizeStatus(p.status as string) === st.id);
            return (
              <div key={st.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${st.color.replace('text-', 'bg-')}`} />
                    <span className="text-xs font-bold text-white">{st.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${st.bg} ${st.color} border ${st.border}`}>
                    {list.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {list.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-[11px] text-slate-500">
                      No projects in this stage
                    </div>
                  ) : (
                    list.map((proj) => {
                      const pTitle = proj.title || proj.projectName || 'Untitled Project';
                      const progressVal = proj.progress ?? proj.progressPercent ?? 0;
                      const dueDateVal = proj.dueDate || proj.deadline || 'Ongoing';
                      const team = Array.isArray(proj.assignedTeam) ? proj.assignedTeam : [proj.assignedTeam || 'Hamza Tariq'];

                      return (
                        <div
                          key={proj.id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 space-y-2 transition-colors cursor-pointer group"
                          onClick={() => handleOpenEdit(proj)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{pTitle}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-2.5 h-2.5 text-slate-500" />
                                <span>{proj.client}</span>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(proj);
                              }} 
                              className="text-slate-500 hover:text-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                              <span>Progress</span>
                              <span>{progressVal}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, progressVal))}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                            <span>Due {dueDateVal}</span>
                            <span className="font-medium text-slate-300">{team[0] || 'Team'}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Create / Edit Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title || formData.projectName || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, projectName: e.target.value })}
                  placeholder="e.g. Q4 TikTok Scaling & UGC Video Ads"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Client Name *</label>
                  {clients.length > 0 ? (
                    <div className="space-y-1">
                      <select
                        value={formData.client || ''}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                      >
                        {clients.map(c => {
                          const cName = c.companyName || c.businessName || 'Client';
                          return <option key={c.id} value={cName}>{cName}</option>;
                        })}
                        <option value="custom">-- Enter Custom Name --</option>
                      </select>
                      {formData.client === 'custom' && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom brand name"
                          onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-xs mt-1"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData.client || ''}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      placeholder="e.g. Sapphire Apparel"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Service Category</label>
                  <input
                    type="text"
                    value={formData.serviceCategory || formData.service || ''}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value, service: e.target.value })}
                    placeholder="e.g. Paid Advertising"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stage Status</label>
                  <select
                    value={formData.status || 'In Progress'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review & QA</option>
                    <option value="Waiting for Client">Waiting for Client</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Progress ({formData.progress ?? formData.progressPercent ?? 30}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress ?? formData.progressPercent ?? 30}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value), progressPercent: Number(e.target.value) })}
                    className="w-full accent-indigo-500 mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || formData.deadline || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Assigned Team (comma separated)</label>
                  <input
                    type="text"
                    value={(Array.isArray(formData.assignedTeam) ? formData.assignedTeam : [formData.assignedTeam || 'Hamza Tariq']).join(', ')}
                    onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Hamza Tariq, Bilal Ahmed"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Deliverables Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key milestones, creative assets, deliverables..."
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
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
