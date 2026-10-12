'use client';

import { useEffect, useState } from 'react';
import { Project, Supervisor, TeamMember } from '@/lib/types';
import {
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  CheckCircle2,
  Layers,
  MapPin,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function ExportPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Filter criteria
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedSupervisor, setSelectedSupervisor] = useState('all');
  const [selectedTeamMember, setSelectedTeamMember] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [projRes, supRes, tmRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/supervisors'),
          fetch('/api/team-members'),
        ]);
        const [projData, supData, tmData] = await Promise.all([
          projRes.json(),
          supRes.json(),
          tmRes.json(),
        ]);
        if (projData.success) setProjects(projData.data);
        if (supData.success) setSupervisors(supData.data);
        if (tmData.success) setTeamMembers(tmData.data);
      } catch (err) {
        console.error('Error loading export filters:', err);
      }
    }
    loadFilters();
  }, []);

  const handleTriggerExport = () => {
    setIsExporting(true);
    const params = new URLSearchParams();
    if (selectedProject !== 'all') params.append('projectId', selectedProject);
    if (selectedSupervisor !== 'all') params.append('supervisorId', selectedSupervisor);
    if (selectedTeamMember !== 'all') params.append('teamMemberId', selectedTeamMember);
    if (selectedStatus !== 'all') params.append('status', selectedStatus);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const downloadUrl = `/api/export?${params.toString()}`;
    window.location.href = downloadUrl;

    setTimeout(() => {
      setIsExporting(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Top Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Download className="w-6 h-6 text-blue-600" />
          XLSX Export Studio
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate production-ready multi-sheet Excel workbooks (.xlsx) containing survey responses and field metadata
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Filter & Export Studio */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Custom Export Parameters</h2>
            <p className="text-xs text-slate-500 mt-0.5">Filter records before generating the Excel package</p>
          </div>

          <div className="space-y-4">
            {/* Project Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              >
                <option value="all">All Projects (Consolidated Export)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supervisor & Team Member */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Supervisory Officer
                </label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Team Member (Collector)
                </label>
                <select
                  value={selectedTeamMember}
                  onChange={(e) => setSelectedTeamMember(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                >
                  <option value="all">All Team Members</option>
                  {teamMembers.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.user?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Start Date (Submitted After)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  End Date (Submitted Before)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Verification Filter
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="all">All Records (Verified & Pending)</option>
                <option value="verified">Verified Records Only</option>
                <option value="flagged">Flagged Records Only</option>
                <option value="rejected">Rejected Records</option>
              </select>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Output Format: <strong>Microsoft Excel (.xlsx)</strong>
            </span>

            <button
              onClick={handleTriggerExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating Excel Workbook...' : 'Download Export Package (.xlsx)'}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Sheet Architecture Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Included Excel Sheets
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">1. Submissions Sheet</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Every survey question mapped into clean tabular columns, paired with submitter name, timestamp, and verification tag.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">2. GPS Coordinates Sheet</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Exact latitude, longitude, altitude, accuracy radiuses, and landmark addresses for GIS mapping.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">3. Supervisors & Team Sheet</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Regional officer directory, assigned enumerators, phone contacts, and total throughput counts.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">4. Export Metadata Sheet</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Audit trail recording export timestamp, applied criteria, platform version, and creator credit (Saif).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
