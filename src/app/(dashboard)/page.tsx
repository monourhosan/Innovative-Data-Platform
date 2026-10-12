'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  UserCheck,
  Users,
  Database,
  Activity,
  Plus,
  UploadCloud,
  FileSpreadsheet,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Charts from '@/components/dashboard/Charts';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { SystemStatistics, Project, DataSubmission } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, subsRes] = await Promise.all([
        fetch('/api/statistics'),
        fetch('/api/projects'),
        fetch('/api/submissions'),
      ]);

      const [statsData, projectsData, subsData] = await Promise.all([
        statsRes.json(),
        projectsRes.json(),
        subsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (projectsData.success) setProjects(projectsData.data.slice(0, 3));
      if (subsData.success) setSubmissions(subsData.data.slice(0, 4));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Hero Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Operations Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Innovative Data Platform
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Central field survey coordination, KoboToolbox-compliant XLSForm management,
              and live synchronization for Android Supervisor & Team Member apps.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
            <Link
              href="/forms"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition-all"
            >
              <UploadCloud className="w-4 h-4 text-blue-400" />
              Upload XLSForm
            </Link>
            <Link
              href="/export"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export .xlsx
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Required Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Projects"
          value={stats?.total_projects ?? 4}
          subtitle="Active survey campaigns"
          icon={FolderKanban}
          colorScheme="blue"
          trend={{ value: '1 new', isPositive: true }}
        />
        <StatCard
          title="Supervisors"
          value={stats?.total_supervisors ?? 3}
          subtitle="Regional field leaders"
          icon={UserCheck}
          colorScheme="purple"
          trend={{ value: '100% active', isPositive: true }}
        />
        <StatCard
          title="Team Members"
          value={stats?.total_team_members ?? 5}
          subtitle="Mobile field enumerators"
          icon={Users}
          colorScheme="indigo"
          trend={{ value: 'Online', isPositive: true }}
        />
        <StatCard
          title="Data Records"
          value={stats?.total_submissions ?? 28}
          subtitle={`${stats?.submissions_today ?? 4} synchronized today`}
          icon={Database}
          colorScheme="emerald"
          trend={{ value: `${stats?.sync_rate ?? 99}% sync`, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={stats?.active_users ?? 9}
          subtitle="Authenticated staff"
          icon={Activity}
          colorScheme="amber"
          trend={{ value: 'All roles', isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <Charts
        timelineDates={stats?.chart_data.dates ?? ['Apr 6', 'Apr 7', 'Apr 8', 'Apr 9', 'Apr 10', 'Apr 11', 'Apr 12']}
        timelineCounts={stats?.chart_data.submissions ?? [2, 3, 1, 4, 3, 5, 4]}
        projectProgress={stats?.project_progress ?? []}
      />

      {/* Two Column Grid: Active Projects & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects & Latest Submissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Table Preview */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Projects Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">Campaigns currently collecting survey responses</p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All Projects
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {projects.map((proj) => (
                <div key={proj.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{proj.project_name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{proj.description}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Supervisors: <strong>{proj.supervisors_count || 1}</strong></span>
                      <span>Records: <strong>{proj.submissions_count || 0}</strong></span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {proj.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Synchronized Submissions */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Latest Field Submissions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Incoming records received with verified GPS metadata</p>
              </div>
              <Link
                href="/data-records"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Explore Records
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {submissions.map((sub) => (
                <div key={sub.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800">{sub.team_member_name}</p>
                      <span className="text-[10px] text-slate-400">&bull;</span>
                      <span className="text-[11px] text-slate-500">{sub.project_name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{sub.gps_location?.address || `${sub.gps_location.latitude}, ${sub.gps_location.longitude}`}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {sub.sync_status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(sub.submitted_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Feed */}
        <div>
          <ActivityFeed activities={stats?.recent_activities ?? []} />
        </div>
      </div>
    </div>
  );
}
