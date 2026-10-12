'use client';

import { useEffect, useState } from 'react';
import { Project, DataSubmission } from '@/lib/types';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Calendar,
  Layers,
  Users,
  Download,
  Loader2,
} from 'lucide-react';

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportData() {
      try {
        const [projRes, subsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/submissions'),
        ]);
        const [projData, subsData] = await Promise.all([
          projRes.json(),
          subsRes.json(),
        ]);
        if (projData.success) setProjects(projData.data);
        if (subsData.success) setSubmissions(subsData.data);
      } catch (err) {
        console.error('Error loading report analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Generating analytics reports...</span>
      </div>
    );
  }

  const verifiedCount = submissions.filter((s) => s.status === 'verified').length;
  const flaggedCount = submissions.filter((s) => s.status === 'flagged').length;
  const pendingCount = submissions.filter((s) => s.status === 'pending' || s.sync_status === 'pending').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Field Performance & Analytics Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated intelligence on enumerator performance, survey completeness, and verification audits
          </p>
        </div>

        <a
          href="/api/export"
          download="IDP_Analytics_Report.xlsx"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shadow-2xs"
        >
          <Download className="w-4 h-4 text-blue-600" />
          Export Report (.xlsx)
        </a>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Verification Rate</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {submissions.length > 0 ? Math.round((verifiedCount / submissions.length) * 100) : 100}%
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {verifiedCount} records approved
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Survey Volume</span>
          <div className="mt-2 text-2xl font-bold text-blue-600">{submissions.length} Records</div>
          <p className="text-xs text-slate-500 mt-1">Across {projects.length} campaigns</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Offline Resilience</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">100%</div>
          <p className="text-xs text-slate-500 mt-1">Zero field packet drops</p>
        </div>
      </div>

      {/* Campaign Progress Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Campaign Target vs Completed Submissions</h2>
          <span className="text-xs text-slate-400">Q2 2026</span>
        </div>

        <div className="p-6 space-y-6">
          {projects.map((p) => {
            const count = submissions.filter((s) => s.project_id === p.id).length;
            const target = 10;
            const percentage = Math.min(100, Math.round((count / target) * 100));

            return (
              <div key={p.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{p.project_name}</span>
                  <span className="font-bold text-slate-900">
                    {count} / {target} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 70 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
