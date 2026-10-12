'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DataSubmission, Project, Supervisor } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import {
  Activity,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Users,
  Database,
  Wifi,
  WifiOff,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
} from 'lucide-react';

// Dynamically import GisMap with SSR disabled to prevent Leaflet window errors
const GisMap = dynamic(() => import('@/components/map/GisMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 gap-2 border border-slate-200">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <span className="text-xs font-semibold">Loading Leaflet GIS View...</span>
    </div>
  ),
});

export default function MonitoringPage() {
  const [submissions, setSubmissions] = useState<DataSubmission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Selected State
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSub, setSelectedSub] = useState<DataSubmission | null>(null);

  const fetchMonitoringData = async () => {
    try {
      const [subsRes, projRes, supRes] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/projects'),
        fetch('/api/supervisors'),
      ]);

      const [subsData, projData, supData] = await Promise.all([
        subsRes.json(),
        projRes.json(),
        supRes.json(),
      ]);

      if (subsData.success) setSubmissions(subsData.data);
      if (projData.success) setProjects(projData.data);
      if (supData.success) setSupervisors(supData.data);
    } catch (err) {
      console.error('Error fetching live monitoring data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    // Auto refresh interval (simulating real-time telemetry)
    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchMonitoringData();
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      sub.team_member_name?.toLowerCase().includes(q) ||
      sub.project_name?.toLowerCase().includes(q) ||
      sub.gps_location?.address?.toLowerCase().includes(q);
    const matchesProject = projectFilter === 'all' || sub.project_id === projectFilter;
    const matchesStatus = statusFilter === 'all' || sub.sync_status === statusFilter;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const activeSupervisorsCount = supervisors.filter((s) => s.user?.status === 'active').length;
  const syncedCount = submissions.filter((s) => s.sync_status === 'synced').length;
  const pendingCount = submissions.filter((s) => s.sync_status === 'pending').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-600" />
            Live Field Monitoring & GIS Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geolocation tracking of Android mobile field submissions and collector movements
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Syncing Telemetry...' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* Real-time Status Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Supervisors</span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{activeSupervisorsCount} Regional Leads</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Online & coordinating</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Collectors</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">5 Enumerators</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Actively capturing surveys</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GPS Synced</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600">{syncedCount} Records</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Coordinates locked & verified</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Offline Queued</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-600">{pendingCount} Records</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending device handshake</div>
        </div>
      </div>

      {/* Interactive GIS Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-blue-600" />
            Field Submission Coordinates Map
          </span>
          <span className="text-slate-400">
            Click on any marker pin to view submission telemetry
          </span>
        </div>

        <GisMap
          submissions={filteredSubmissions}
          selectedSubmissionId={selectedSub?.id}
          onMarkerClick={(sub) => setSelectedSub(sub)}
        />
      </div>

      {/* Filter and Live Submissions Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by collector, location, or project..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="all">All Sync States</option>
              <option value="synced">Synced Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>

        {/* Live Submissions Feed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-5">Collector</th>
                <th className="py-3 px-5">Project Campaign</th>
                <th className="py-3 px-5">GPS Location</th>
                <th className="py-3 px-5">Submission Time</th>
                <th className="py-3 px-5">Upload Status</th>
                <th className="py-3 px-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubmissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;

                return (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {sub.team_member_name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{sub.team_member_name}</p>
                          <p className="text-[10px] text-slate-400">ID: {sub.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-medium text-slate-800 max-w-[200px] truncate">
                      {sub.project_name}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-[11px]">
                          {sub.gps_location?.latitude.toFixed(4)}°, {sub.gps_location?.longitude.toFixed(4)}°
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                        {sub.gps_location?.address}
                      </p>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(sub.submitted_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sub.submitted_time).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <Badge variant={sub.sync_status === 'synced' ? 'success' : 'warning'}>
                        {sub.sync_status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <a
                        href={`/data-records?highlight=${sub.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Answers
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
