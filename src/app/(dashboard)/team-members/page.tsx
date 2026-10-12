'use client';

import { useEffect, useState } from 'react';
import { Supervisor, TeamMember } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  UserCheck,
  FolderKanban,
  Trash2,
  Power,
  Loader2,
  AlertCircle,
  Database,
  Smartphone,
} from 'lucide-react';

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('all');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+1 (555) ');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('FieldTeam123!');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tmRes, supRes] = await Promise.all([
        fetch('/api/team-members'),
        fetch('/api/supervisors'),
      ]);
      const [tmData, supData] = await Promise.all([
        tmRes.json(),
        supRes.json(),
      ]);

      if (tmData.success) setTeamMembers(tmData.data);
      if (supData.success) {
        setSupervisors(supData.data);
        if (supData.data.length > 0 && !selectedSupervisorId) {
          setSelectedSupervisorId(supData.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setName('');
    setPhone('+1 (555) ');
    setEmail('');
    setUsername('');
    setPassword('FieldTeam123!');
    setSelectedSupervisorId(supervisors[0]?.id || '');
    setErrorMsg(null);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !username || !password || !selectedSupervisorId) {
      setErrorMsg('All fields are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          username,
          password,
          supervisor_id: selectedSupervisorId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create team member');
      }

      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tm: TeamMember) => {
    if (!confirm(`Are you sure you want to remove team member "${tm.user?.name}"?`)) return;
    try {
      await fetch(`/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tm.user_id, status: 'inactive' }),
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting team member:', err);
    }
  };

  const filtered = teamMembers.filter((tm) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      tm.user?.name.toLowerCase().includes(q) ||
      tm.user?.username.toLowerCase().includes(q) ||
      tm.user?.email.toLowerCase().includes(q);
    const matchesSupervisor =
      supervisorFilter === 'all' || tm.supervisor_id === supervisorFilter;
    return matchesSearch && matchesSupervisor;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Field Team Members (Enumerators)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mobile collectors who gather ground surveys using the Field Collector Android App
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Filters and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members by name or username..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={supervisorFilter}
            onChange={(e) => setSupervisorFilter(e.target.value)}
            className="w-full sm:w-60 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
          >
            <option value="all">All Supervisors ({supervisors.length})</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.user?.name} ({s.project?.project_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading field team directory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No field team members found</p>
            <p className="text-xs text-slate-500 mt-1">Add a new collector or adjust filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-5">Collector</th>
                  <th className="py-3 px-5">Contact Details</th>
                  <th className="py-3 px-5">Assigned Supervisor</th>
                  <th className="py-3 px-5">Active Project</th>
                  <th className="py-3 px-5 text-center">Submissions</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((tm) => (
                  <tr key={tm.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {tm.user?.name.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tm.user?.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">@{tm.user?.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {tm.user?.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {tm.user?.phone || 'N/A'}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{tm.supervisor?.user?.name || tm.supervisor_id}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-medium text-slate-700 line-clamp-1 max-w-[200px]" title={tm.project?.project_name}>
                        {tm.project?.project_name || 'N/A'}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {tm.submissions_count || 0}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <Badge variant={tm.user?.status === 'active' ? 'success' : 'neutral'}>
                        {tm.user?.status || 'active'}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDelete(tm)}
                        title="Remove Team Member"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Field Team Member"
        description="Creates an enumerator account for the Field Collector Android App"
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amina Yusuf"
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
                placeholder="amina.field@innovativedata.org"
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
                placeholder="amina_field"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
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
              Supervising Officer <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              required
            >
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.name} &bull; {s.project?.project_name}
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
              Save Team Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
