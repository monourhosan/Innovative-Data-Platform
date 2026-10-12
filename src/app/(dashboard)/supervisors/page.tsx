'use client';

import { useEffect, useState } from 'react';
import { Project, Supervisor, User } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  UserCheck,
  Plus,
  Search,
  KeyRound,
  ShieldAlert,
  Power,
  Trash2,
  Mail,
  Phone,
  FolderKanban,
  Users,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
} from 'lucide-react';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedSup, setSelectedSup] = useState<Supervisor | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [assignedProject, setAssignedProject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const fetchSupervisorsAndProjects = async () => {
    try {
      setLoading(true);
      const [supRes, projRes] = await Promise.all([
        fetch('/api/supervisors'),
        fetch('/api/projects'),
      ]);
      const [supData, projData] = await Promise.all([
        supRes.json(),
        projRes.json(),
      ]);

      if (supData.success) setSupervisors(supData.data);
      if (projData.success) {
        setProjects(projData.data);
        if (projData.data.length > 0 && !assignedProject) {
          setAssignedProject(projData.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching supervisors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisorsAndProjects();
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = 'Sup#';
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const openCreateModal = () => {
    setFullName('');
    setPhone('+1 (555) ');
    setEmail('');
    setUsername('');
    generatePassword();
    setAssignedProject(projects[0]?.id || '');
    setErrorMsg(null);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !username || !password || !assignedProject) {
      setErrorMsg('All fields are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/supervisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          username,
          password,
          assigned_project: assignedProject,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create supervisor');
      }

      setCreateModalOpen(false);
      setSelectedSup(data.data);
      setCredModalOpen(true);
      fetchSupervisorsAndProjects();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating supervisor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (sup: Supervisor) => {
    if (!sup.user) return;
    const nextStatus = sup.user.status === 'active' ? 'suspended' : 'active';
    try {
      await fetch(`/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sup.user.id,
          status: nextStatus,
        }),
      });
      fetchSupervisorsAndProjects();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDelete = async (sup: Supervisor) => {
    if (!confirm(`Are you sure you want to delete supervisor "${sup.user?.name}"?`)) return;
    try {
      await fetch(`/api/supervisors/${sup.id}`, { method: 'DELETE' });
      fetchSupervisorsAndProjects();
    } catch (err) {
      console.error('Error deleting supervisor:', err);
    }
  };

  const copyCredentialsText = () => {
    if (!selectedSup) return;
    const text = `Innovative Data Platform - Supervisor Credentials\nUsername: ${selectedSup.user?.username}\nPassword: ${password || 'Supervisor123!'}\nAssigned Project: ${selectedSup.project?.project_name}\nSupervisor Android App Login Endpoint: /api/login`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  const filteredSupervisors = supervisors.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.user?.name.toLowerCase().includes(q) ||
      s.user?.username.toLowerCase().includes(q) ||
      s.user?.email.toLowerCase().includes(q) ||
      s.project?.project_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Supervisor Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Commission regional supervisors, manage field assignments, and issue mobile credentials
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Supervisor
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supervisors by name, username, email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Total: <strong>{supervisors.length}</strong> Supervisors
        </span>
      </div>

      {/* Supervisors Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading supervisors directory...</span>
          </div>
        ) : filteredSupervisors.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No supervisors found</p>
            <p className="text-xs text-slate-500 mt-1">Click "Create New Supervisor" to register one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-5">Supervisor</th>
                  <th className="py-3 px-5">Contact Details</th>
                  <th className="py-3 px-5">Assigned Project</th>
                  <th className="py-3 px-5 text-center">Team Members</th>
                  <th className="py-3 px-5 text-center">Submissions</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSupervisors.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {s.user?.name.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.user?.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">@{s.user?.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {s.user?.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.user?.phone || 'N/A'}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={s.project?.project_name}>
                        {s.project?.project_name || s.assigned_project}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                        {s.team_members_count || 0}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {s.submissions_count || 0}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <Badge variant={s.user?.status === 'active' ? 'success' : 'danger'}>
                        {s.user?.status || 'active'}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSup(s);
                            setActivityModalOpen(true);
                          }}
                          title="View Supervisor Activity"
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Activity className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedSup(s);
                            setCredModalOpen(true);
                          }}
                          title="View / Reset Credentials"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(s)}
                          title={s.user?.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            s.user?.status === 'active'
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(s)}
                          title="Delete Supervisor"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE SUPERVISOR MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Supervisor"
        description="Creates user account with role 'supervisor' and generates credentials"
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
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Tariq Rahman"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supervisor@innovativedata.org"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="tariq_sup"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  Generate
                </button>
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={assignedProject}
              onChange={(e) => setAssignedProject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name} ({p.status})
                </option>
              ))}
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
              Provision Supervisor
            </button>
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS DIALOG */}
      {selectedSup && (
        <Modal
          isOpen={credModalOpen}
          onClose={() => setCredModalOpen(false)}
          title="Supervisor Access Credentials"
          description="Provisioning information for Supervisor Android Application"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Supervisor</span>
                <span className="font-bold text-slate-900">{selectedSup.user?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Username</span>
                  <code className="font-mono font-bold text-blue-600 text-xs">{selectedSup.user?.username}</code>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Password</span>
                  <code className="font-mono font-bold text-purple-600 text-xs">
                    {password || 'Supervisor123!'}
                  </code>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Assigned Project</span>
                <span className="font-medium text-slate-700">{selectedSup.project?.project_name}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Provide these credentials to the supervisor to log into the <strong>Supervisor Android App</strong>.
            </p>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={copyCredentialsText}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
              >
                {copiedCreds ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCreds ? 'Copied to Clipboard!' : 'Copy Credentials'}
              </button>

              <button
                onClick={() => setCredModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* SUPERVISOR ACTIVITY MODAL */}
      {selectedSup && (
        <Modal
          isOpen={activityModalOpen}
          onClose={() => setActivityModalOpen(false)}
          title={`Supervisor Activity: ${selectedSup.user?.name}`}
          description={`Project: ${selectedSup.project?.project_name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Field Team</span>
                <span className="text-base font-bold text-slate-900">{selectedSup.team_members_count || 0} Members</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Collected Records</span>
                <span className="text-base font-bold text-blue-600">{selectedSup.submissions_count || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Account Status</span>
                <Badge variant={selectedSup.user?.status === 'active' ? 'success' : 'danger'}>
                  {selectedSup.user?.status}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <p className="font-semibold text-slate-800">Operational Summary</p>
              <p className="text-slate-500">
                Registered since: {new Date(selectedSup.user?.created_at || '').toLocaleDateString()}
              </p>
              <p className="text-slate-500">
                Active Android synchronizations: {selectedSup.submissions_count || 0} successful field uploads verified.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActivityModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
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
