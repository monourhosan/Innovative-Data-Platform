'use client';

import { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Send,
  Loader2,
  Terminal,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Database,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  title: string;
  description: string;
  consumer: 'Supervisor App' | 'Team Member App' | 'Both Android Apps';
  requestBody?: Record<string, any>;
  sampleResponse: Record<string, any>;
}

const endpoints: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/login',
    title: 'Mobile Authentication & Token Issuance',
    description: 'Authenticates a supervisor or team member and returns a JWT bearer token for subsequent offline/online requests.',
    consumer: 'Both Android Apps',
    requestBody: {
      username: 'tariq_sup',
      password: 'Supervisor123!',
    },
    sampleResponse: {
      success: true,
      message: 'Authentication successful',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'user-sup-1',
        name: 'Tariq Rahman',
        email: 'tariq.sup@innovativedata.org',
        username: 'tariq_sup',
        role: 'supervisor',
      },
    },
  },
  {
    method: 'GET',
    path: '/api/projects',
    title: 'List Active Projects',
    description: 'Fetches the list of active survey campaigns available for data collection.',
    consumer: 'Both Android Apps',
    sampleResponse: {
      success: true,
      count: 3,
      data: [
        {
          id: 'proj-1',
          project_name: 'National Household Nutrition Survey',
          description: 'Demographic and socioeconomic nutrition survey',
          status: 'active',
          supervisors_count: 1,
          submissions_count: 24,
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/api/forms',
    title: 'Download Survey Form Structures',
    description: 'Returns digital form questions, choice lists, constraints, and validation rules for offline caching.',
    consumer: 'Both Android Apps',
    sampleResponse: {
      success: true,
      count: 2,
      data: [
        {
          id: 'form-1',
          project_id: 'proj-1',
          title: 'Household Socioeconomic Questionnaire',
          form_id: 'hh_nutrition_2026',
          version: '2026.04',
          form_structure: {
            title: 'Household Questionnaire',
            questions: [
              {
                type: 'text',
                name: 'respondent_name',
                label: 'Household Head Full Name',
                required: true,
              },
              {
                type: 'integer',
                name: 'age',
                label: 'Age in years',
                required: true,
                constraint: '. >= 18',
              },
            ],
          },
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/submissions',
    title: 'Synchronize Field Data Submission',
    description: 'Mobile field collectors post gathered survey responses accompanied by device GPS coordinates.',
    consumer: 'Team Member App',
    requestBody: {
      project_id: 'proj-1',
      form_id: 'form-1',
      supervisor_id: 'sup-1',
      team_member_id: 'tm-1',
      form_data: {
        respondent_name: 'Mohammad Faruk',
        age: 42,
        drinking_water_source: 'piped',
        family_size: 5,
      },
      gps_location: {
        latitude: 23.8103,
        longitude: 90.4125,
        altitude: 12.4,
        accuracy: 3.2,
        address: 'Dhanmondi Sector 4, Dhaka',
      },
      sync_status: 'synced',
    },
    sampleResponse: {
      success: true,
      message: 'Field data submission successfully recorded and synchronized.',
      submission_id: 'sub-101',
      submitted_time: '2026-04-12T14:50:00Z',
    },
  },
  {
    method: 'GET',
    path: '/api/statistics',
    title: 'System & Campaign Metrics',
    description: 'Returns real-time summary statistics for dashboard and supervisor overview screens.',
    consumer: 'Both Android Apps',
    sampleResponse: {
      success: true,
      data: {
        total_projects: 4,
        total_supervisors: 3,
        total_team_members: 5,
        total_submissions: 28,
        active_users: 9,
        sync_rate: 99,
      },
    },
  },
  {
    method: 'POST',
    path: '/api/users',
    title: 'Provision User Accounts',
    description: 'Used by supervisor or admin to create team members programmatically.',
    consumer: 'Supervisor App',
    requestBody: {
      name: 'Amina Yusuf',
      email: 'amina.field@innovativedata.org',
      phone: '+1 (555) 501-1101',
      username: 'amina_field',
      password: 'FieldTeam123!',
      role: 'team_member',
    },
    sampleResponse: {
      success: true,
      data: {
        id: 'user-tm-1',
        name: 'Amina Yusuf',
        email: 'amina.field@innovativedata.org',
        role: 'team_member',
        status: 'active',
      },
    },
  },
  {
    method: 'GET',
    path: '/api/export',
    title: 'Binary Excel Workbook Export',
    description: 'Generates a multi-sheet Microsoft Excel file (.xlsx) with survey data, GPS metadata, and user information.',
    consumer: 'Both Android Apps',
    sampleResponse: {
      content: 'Binary application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  },
];

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(endpoints[0]);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const runLiveTest = async () => {
    setTesting(true);
    setTestOutput(null);

    try {
      let res: Response;
      if (selectedEndpoint.method === 'GET') {
        res = await fetch(selectedEndpoint.path);
      } else {
        res = await fetch(selectedEndpoint.path, {
          method: selectedEndpoint.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedEndpoint.requestBody || {}),
        });
      }

      if (selectedEndpoint.path === '/api/export') {
        setTestOutput('Received binary .xlsx stream (200 OK)');
      } else {
        const json = await res.json();
        setTestOutput(JSON.stringify(json, null, 2));
      }
    } catch (err: any) {
      setTestOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Code2 className="w-6 h-6 text-blue-600" />
          Android Applications REST API Documentation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Technical specifications for developers integrating the <strong>Supervisor Android App</strong> and <strong>Team Member Android App</strong>
        </p>
      </div>

      {/* Integration Overview Card */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
          <Smartphone className="w-4 h-4" />
          Android Mobile Client Architecture
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Base URL</span>
            <code className="text-blue-300 font-mono block text-xs">https://your-domain.vercel.app</code>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Authentication Header</span>
            <code className="text-emerald-300 font-mono block text-xs">Authorization: Bearer &lt;token&gt;</code>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Sync Protocol</span>
            <span className="text-slate-300 font-medium block">Offline queue with GPS auto-lock</span>
          </div>
        </div>
      </div>

      {/* Endpoints Directory & Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Endpoints Menu (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-4 space-y-2">
          <h2 className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Available REST Endpoints ({endpoints.length})
          </h2>

          <div className="space-y-1.5">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;

              return (
                <button
                  key={ep.method + ep.path}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setTestOutput(null);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-700'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <code className="font-mono text-slate-800 font-semibold">{ep.path}</code>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 line-clamp-1">{ep.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Endpoint Detail & Interactive Runner (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <code className="text-sm font-bold font-mono text-slate-900">{selectedEndpoint.path}</code>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-2">{selectedEndpoint.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedEndpoint.description}</p>
            </div>

            <button
              onClick={runLiveTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0 disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Live Test
            </button>
          </div>

          {/* Request Payload (if applicable) */}
          {selectedEndpoint.requestBody && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Sample Request Body (JSON)
              </span>
              <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-48">
                <pre>{JSON.stringify(selectedEndpoint.requestBody, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Live Test Response Runner */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                {testOutput ? 'Live Server Response' : 'Expected Response Schema'}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    testOutput || JSON.stringify(selectedEndpoint.sampleResponse, null, 2)
                  )
                }
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72">
              <pre>{testOutput || JSON.stringify(selectedEndpoint.sampleResponse, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
