'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SurveyForm } from '@/lib/types';
import FormRenderer from '@/components/forms/FormRenderer';
import { ArrowLeft, Loader2, Smartphone, CheckCircle2 } from 'lucide-react';

export default function FormPreviewClient({ id }: { id: string }) {
  const [form, setForm] = useState<SurveyForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/${id}`);
        const data = await res.json();
        if (data.success) {
          setForm(data.data);
        }
      } catch (err) {
        console.error('Error loading form preview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Compiling digital form renderer...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-800">Form not found</p>
        <Link
          href="/forms"
          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to forms list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/forms"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Forms
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Mobile Device Emulator Mode</span>
        </div>
      </div>

      {lastSubmissionId && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              Test record recorded! Submission ID: <strong>{lastSubmissionId}</strong>
            </span>
          </div>
          <Link
            href="/data-records"
            className="font-bold underline hover:text-emerald-900"
          >
            View in Data Viewer &rarr;
          </Link>
        </div>
      )}

      {/* Interactive Form Component */}
      <FormRenderer
        structure={form.form_structure}
        projectId={form.project_id}
        formId={form.id}
        onSubmitSuccess={(subId) => setLastSubmissionId(subId)}
      />
    </div>
  );
}
