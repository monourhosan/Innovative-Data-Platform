'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project, SurveyForm } from '@/lib/types';
import XlsxUploader from '@/components/forms/XlsxUploader';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  Code2,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  Loader2,
  Plus,
} from 'lucide-react';

export default function FormsPage() {
  const [forms, setForms] = useState<SurveyForm[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormForJson, setSelectedFormForJson] = useState<SurveyForm | null>(null);
  const [uploaderVisible, setUploaderVisible] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [formsRes, projectsRes] = await Promise.all([
        fetch('/api/forms'),
        fetch('/api/projects'),
      ]);
      const [formsData, projectsData] = await Promise.all([
        formsRes.json(),
        projectsRes.json(),
      ]);

      if (formsData.success) setForms(formsData.data);
      if (projectsData.success) setProjects(projectsData.data);
    } catch (err) {
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteForm = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete survey form "${title}"?`)) return;
    try {
      await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error deleting form:', err);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Survey Forms & XLSForm Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            KoboToolbox-compatible XLSForm parser, validation engine, and digital form distributor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/forms/sample-template"
            download="IDP_Sample_XLSForm_Template.xlsx"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Sample Template (.xlsx)
          </a>
          <button
            onClick={() => setUploaderVisible(!uploaderVisible)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            {uploaderVisible ? 'Hide Uploader' : 'Upload New Form'}
          </button>
        </div>
      </div>

      {/* XLSForm Uploader Section */}
      {uploaderVisible && (
        <XlsxUploader projects={projects} onUploadSuccess={fetchData} />
      )}

      {/* Active Deployed Forms List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Active Deployed Digital Forms ({forms.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Available for immediate synchronization onto Android mobile devices
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading survey forms...</span>
          </div>
        ) : forms.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No survey forms deployed yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Upload an XLSForm spreadsheet above or download the sample template to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {forms.map((f) => (
              <div key={f.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                    <Badge variant="primary">{f.form_id}</Badge>
                    <Badge variant="neutral">v{f.version}</Badge>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>Project: <strong className="text-slate-700">{f.project_name}</strong></span>
                    <span>&bull;</span>
                    <span>Source: <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">{f.uploaded_file}</code></span>
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Questions: <strong className="text-slate-700">{f.form_structure?.questions?.length || 0}</strong></span>
                    <span>Submissions: <strong className="text-blue-600">{f.submissions_count || 0}</strong></span>
                    <span>Uploaded: {new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/forms/preview/${f.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Interactive Test & Preview
                  </Link>

                  <button
                    onClick={() => setSelectedFormForJson(f)}
                    title="View Form JSON Structure"
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Code2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteForm(f.id, f.title)}
                    title="Delete Form"
                    className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JSON Structure Inspection Modal */}
      {selectedFormForJson && (
        <Modal
          isOpen={!!selectedFormForJson}
          onClose={() => setSelectedFormForJson(null)}
          title={`Digital JSON Schema: ${selectedFormForJson.title}`}
          description={`Form ID: ${selectedFormForJson.form_id} | Version: ${selectedFormForJson.version}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              This compiled JSON format is fetched directly by the Android mobile apps via <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">GET /api/forms/{selectedFormForJson.id}</code> for offline survey collection.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(selectedFormForJson.form_structure, null, 2)}</pre>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFormForJson(null)}
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
