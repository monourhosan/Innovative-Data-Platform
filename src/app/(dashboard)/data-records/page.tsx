'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataSubmission, Project, Supervisor, TeamMember } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  Database,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  MapPin,
  User,
  UserCheck,
  CheckCircle2,
  Flag,
  XCircle,
  Clock,
  Layers,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';

function DataRecordsContent() {
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get('highlight');

  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [supervisorFilter, setSupervisorFilter] = useState('all');
  const [teamMemberFilter, setTeamMemberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Inspection Modal
  const [selectedSub, setSelectedSub] = useState<DataSubmission | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, projRes, supRes, tmRes] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/projects'),
        fetch('/api/supervisors'),
        fetch('/api/team-members'),
      ]);

      const [subsData, projData, supData, tmData] = await Promise.all([
        subsRes.json(),
        projRes.json(),
        supRes.json(),
        tmRes.json(),
      ]);

      if (subsData.success) {
        setSubmissions(subsData.data);
        if (highlightParam) {
          const matched = subsData.data.find((s: DataSubmission) => s.id === highlightParam);
          if (matched) setSelectedSub(matched);
        }
      }
      if (projData.success) setProjects(projData.data);
      if (supData.success) setSupervisors(supData.data);
      if (tmData.success) setTeamMembers(tmData.data);
    } catch (err) {
      console.error('Error fetching data records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [highlightParam]);

  const handleUpdateStatus = async (newStatus: 'verified' | 'flagged' | 'rejected') => {
    if (!selectedSub) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/submissions/${selectedSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSub(data.data);
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedSub.id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      sub.team_member_name?.toLowerCase().includes(q) ||
      sub.project_name?.toLowerCase().includes(q) ||
      JSON.stringify(sub.form_data).toLowerCase().includes(q) ||
      sub.id.toLowerCase().includes(q);

    const matchProject = projectFilter === 'all' || sub.project_id === projectFilter;
    const matchSupervisor = supervisorFilter === 'all' || sub.supervisor_id === supervisorFilter;
    const matchTm = teamMemberFilter === 'all' || sub.team_member_id === teamMemberFilter;
    const matchStatus = statusFilter === 'all' || sub.status === statusFilter || sub.sync_status === statusFilter;

    return matchSearch && matchProject && matchSupervisor && matchTm && matchStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-600" />
            Field Data Records & Survey Responses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete data viewer for inspecting, filtering, and validating submitted questionnaires
          </p>
        </div>

        <a
          href="/api/export"
          download="IDP_Data_Export.xlsx"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          Export All Records (.xlsx)
        </a>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all survey answers, respondent names, IDs..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <strong>{filteredSubmissions.length}</strong> of <strong>{submissions.length}</strong> records
          </div>
        </div>

        {/* Multi Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Project Campaign
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Supervisor
            </label>
            <select
              value={supervisorFilter}
              onChange={(e) => setSupervisorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="all">All Supervisors</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Team Member
            </label>
            <select
              value={teamMemberFilter}
              onChange={(e) => setTeamMemberFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="all">All Team Members</option>
              {teamMembers.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.user?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Verification Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified (Approved)</option>
              <option value="flagged">Flagged for Review</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading data records...</span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No submissions found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust search parameters or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-5">Record ID</th>
                  <th className="py-3 px-5">Project / Form</th>
                  <th className="py-3 px-5">Enumerator</th>
                  <th className="py-3 px-5">Supervisor</th>
                  <th className="py-3 px-5">Key Answers Preview</th>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSubmissions.map((sub) => {
                  const answersSummary = Object.entries(sub.form_data || {})
                    .slice(0, 2)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(',') : v}`)
                    .join(' | ');

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedSub(sub)}
                    >
                      <td className="py-4 px-5 font-mono font-bold text-blue-600">
                        {sub.id}
                      </td>

                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900 max-w-[200px] truncate">{sub.project_name}</p>
                        <p className="text-[11px] text-slate-400 max-w-[200px] truncate">{sub.form_title}</p>
                      </td>

                      <td className="py-4 px-5 font-medium text-slate-800">
                        {sub.team_member_name}
                      </td>

                      <td className="py-4 px-5 text-slate-600">
                        {sub.supervisor_name}
                      </td>

                      <td className="py-4 px-5 text-[11px] text-slate-500 max-w-[240px] truncate">
                        {answersSummary || 'No data answers'}
                      </td>

                      <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                        {new Date(sub.submitted_time).toLocaleDateString()} &bull;{' '}
                        {new Date(sub.submitted_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-4 px-5">
                        <Badge
                          variant={
                            sub.status === 'verified'
                              ? 'success'
                              : sub.status === 'flagged'
                              ? 'warning'
                              : sub.status === 'rejected'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {(sub.status || 'verified').toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSub(sub);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUBMISSION INSPECTION MODAL */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Field Submission Record: ${selectedSub.id}`}
          description={`Project: ${selectedSub.project_name} | Form: ${selectedSub.form_title}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Meta badges */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Field Collector</span>
                <span className="font-bold text-slate-900">{selectedSub.team_member_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Supervisor</span>
                <span className="font-bold text-slate-900">{selectedSub.supervisor_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Submitted Time</span>
                <span className="font-medium text-slate-700">
                  {new Date(selectedSub.submitted_time).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Verification</span>
                <Badge
                  variant={
                    selectedSub.status === 'verified'
                      ? 'success'
                      : selectedSub.status === 'flagged'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {(selectedSub.status || 'verified').toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* GPS Metadata */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>GPS Location Coordinates</span>
              </div>
              <p className="text-slate-700">
                <strong>Latitude:</strong> {selectedSub.gps_location?.latitude} &bull;{' '}
                <strong>Longitude:</strong> {selectedSub.gps_location?.longitude} &bull;{' '}
                <strong>Altitude:</strong> {selectedSub.gps_location?.altitude ?? 12}m &bull;{' '}
                <strong>Accuracy:</strong> &plusmn;{selectedSub.gps_location?.accuracy ?? 3.5}m
              </p>
              {selectedSub.gps_location?.address && (
                <p className="text-slate-500">
                  <strong>Location Landmark:</strong> {selectedSub.gps_location.address}
                </p>
              )}
            </div>

            {/* Answers Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Survey Questionnaire Responses
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 w-1/3">Question Key</th>
                      <th className="py-2.5 px-4">Recorded Response Answer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(selectedSub.form_data || {}).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-700 bg-slate-50/50">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {Array.isArray(val)
                            ? val.join(', ')
                            : typeof val === 'object' && val !== null
                            ? JSON.stringify(val)
                            : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification Status Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">
                Mark Verification Status:
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('verified')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve (Verified)
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('flagged')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Flag
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('rejected')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function DataRecordsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2 font-sans">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading data records viewer...</span>
        </div>
      }
    >
      <DataRecordsContent />
    </Suspense>
  );
}
