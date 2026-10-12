'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Cloud,
  CheckCircle2,
  Save,
  Loader2,
  Sliders,
  Globe,
  Sparkles,
  MapPin,
  Wifi,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    platformName: 'Innovative Data Platform',
    creator: 'Saif',
    organization: 'Innovative Data Platform Global',
    syncIntervalMinutes: 15,
    allowOfflineSubmissions: true,
    requireGpsForSubmissions: true,
    storageType: 'local_cloud_compatible',
    aiValidationEnabled: true,
    multiLanguageEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.data) {
          setSettings((prev: any) => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-600" />
          System Settings & Platform Architecture
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage system configuration, sync protocols, and cloud connection parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Organization Settings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Platform Identity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Core organization parameters</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Admin Control
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                System Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName || ''}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Creator & Architect
              </label>
              <input
                type="text"
                value={settings.creator || 'Saif'}
                disabled
                className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization Designation
              </label>
              <input
                type="text"
                value={settings.organization || ''}
                onChange={(e) => setSettings({ ...settings, organization: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Sync & Field Mobile Devices */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Mobile Synchronization Protocols</h2>
            <p className="text-xs text-slate-500 mt-0.5">Parameters for Android Supervisor & Team Member Apps</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-blue-600" />
                  Allow Offline Field Data Collection
                </span>
                <p className="text-[11px] text-slate-500">
                  Collectors can record responses in remote areas without internet; submissions queue on Android and sync automatically when connected.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!!settings.allowOfflineSubmissions}
                onChange={(e) => setSettings({ ...settings, allowOfflineSubmissions: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 ml-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Enforce GPS Fix for Submissions
                </span>
                <p className="text-[11px] text-slate-500">
                  Requires mobile device to establish a valid satellite GPS lock before marking submission as verified.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!!settings.requireGpsForSubmissions}
                onChange={(e) => setSettings({ ...settings, requireGpsForSubmissions: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 ml-4"
              />
            </label>
          </div>
        </div>

        {/* Database & Vercel Deployment Architecture */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Database & Deployment Architecture</h2>
              <p className="text-xs text-slate-500 mt-0.5">PostgreSQL & Vercel deployment status</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready for Vercel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Database className="w-4 h-4 text-blue-600" />
                <span>PostgreSQL / Supabase Schema</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Prisma ORM schema configured at <code className="text-slate-800">prisma/schema.prisma</code> with PostgreSQL connection string via <code className="text-slate-800">DATABASE_URL</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Cloud className="w-4 h-4 text-purple-600" />
                <span>Vercel Serverless Hosting</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Zero configuration required: Next.js App Router route handlers run seamlessly on Vercel Serverless Edge with HTTP-only cookies and Bearer tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Future Ready Features */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Future-Ready Modules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">AI Data Validation</p>
                <p className="text-[11px] text-slate-500">Anomaly detection on field answers</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">GIS Satellite Mapping</p>
                <p className="text-[11px] text-slate-500">Leaflet OpenStreetMap integration</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">All changes persist to storage</span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
