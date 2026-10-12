'use client';

import { useEffect, useState } from 'react';
import { Project, ProjectStatus } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Database,
  Edit2,
  Trash2,
  Power,
  BarChart3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('active');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setFormName('');
    setFormDescription('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);
    setFormEndDate(endDate.toISOString().split('T')[0]);
    setFormStatus('active');
    setErrorMsg(null);
    setCreateModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setSelectedProject(p);
    setFormName(p.project_name);
    setFormDescription(p.description);
    setFormStartDate(p.start_date.split('T')[0]);
    setFormEndDate(p.end_date.split('T')[0]);
    setFormStatus(p.status);
    setErrorMsg(null);
    setEditModalOpen(true);
  };

  const openStatsModal = (p: Project) => {
    setSelectedProject(p);
    setStatsModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      setErrorMsg('Project name and description are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: formName.trim(),
          description: formDescription.trim(),
          start_date: formStartDate,
          end_date: formEndDate,
          status: formStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create project');
      }
      setCreateModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: formName.trim(),
          description: formDescription.trim(),
          start_date: formStartDate,
          end_date: formEndDate,
          status: formStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update project');
      }
      setEditModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (p: Project) => {
    const nextStatus: ProjectStatus = p.status === 'active' ? 'archived' : 'active';
    try {
      await fetch(`/api/projects/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchProjects();
    } catch (err) {
      console.error('Error toggling project status:', err);
    }
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`Are you sure you want to delete project "${p.project_name}"?`)) {
      return;
    }
    try {
      await fetch(`/api/projects/${p.id}`, { method: 'DELETE' });
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-blue-600" />
            Project Management System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, oversee, and schedule field data collection initiatives
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or description..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
          >
            <option value="all">All Statuses ({projects.length})</option>
            <option value="active">Active Only</option>
            <option value="planning">Planning Only</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Projects Grid Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading projects database...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No matching projects found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or create a new project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const isInactive = p.status === 'archived' || p.status === 'completed';

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {p.project_name}
                    </h3>
                    <Badge
                      variant={
                        p.status === 'active'
                          ? 'success'
                          : p.status === 'planning'
                          ? 'primary'
                          : 'neutral'
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {p.description}
                  </p>

                  {/* Dates */}
                  <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {new Date(p.start_date).toLocaleDateString()} -{' '}
                      {new Date(p.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Operational Metrics Pills */}
                  <div className="pt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Supervisors
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {p.supervisors_count || 1}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Forms
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {p.forms_count || 1}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Submissions
                      </span>
                      <span className="text-xs font-bold text-blue-600">
                        {p.submissions_count || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openStatsModal(p)}
                      title="View Project Statistics"
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      title="Edit Project"
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(p)}
                      title={isInactive ? 'Activate Project' : 'Deactivate Project'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isInactive
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      title="Delete Project"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <a
                    href={`/forms?projectId=${p.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    View Forms
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        description="Provision a new digital field research campaign"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. National Water Sanitation & Hygiene Assessment"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Summary of survey scope, geographic focus, and objectives..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as ProjectStatus)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="active">Active (Collecting field data)</option>
              <option value="planning">Planning (Draft phase)</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PROJECT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Project Configuration"
        description="Modify campaign details and parameters"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as ProjectStatus)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* PROJECT STATISTICS MODAL */}
      {selectedProject && (
        <Modal
          isOpen={statsModalOpen}
          onClose={() => setStatsModalOpen(false)}
          title={`Statistics: ${selectedProject.project_name}`}
          description={`Project ID: ${selectedProject.id}`}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Status</span>
                <Badge variant={selectedProject.status === 'active' ? 'success' : 'neutral'}>
                  {selectedProject.status}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Supervisors</span>
                <span className="text-base font-bold text-slate-800">{selectedProject.supervisors_count || 1}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Survey Forms</span>
                <span className="text-base font-bold text-slate-800">{selectedProject.forms_count || 1}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Submissions</span>
                <span className="text-base font-bold text-blue-600">{selectedProject.submissions_count || 0}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Campaign Timeline</h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Start Date: <strong>{new Date(selectedProject.start_date).toLocaleDateString()}</strong></span>
                  <span>End Date: <strong>{new Date(selectedProject.end_date).toLocaleDateString()}</strong></span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-2/3" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setStatsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
