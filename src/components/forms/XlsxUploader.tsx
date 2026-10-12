'use client';

import { useState, useRef } from 'react';
import { Project } from '@/lib/types';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface XlsxUploaderProps {
  projects: Project[];
  onUploadSuccess: () => void;
}

export default function XlsxUploader({ projects, onUploadSuccess }: XlsxUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [customTitle, setCustomTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.xlsx')) {
        setError('Please upload a valid Excel workbook file (.xlsx).');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccessMessage(null);
      setWarnings([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.xlsx')) {
        setError('Please upload a valid Excel workbook file (.xlsx).');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccessMessage(null);
      setWarnings([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an XLSForm Excel file (.xlsx) to upload.');
      return;
    }
    if (!selectedProjectId) {
      setError('Please assign this form to a target project.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    setWarnings([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('project_id', selectedProjectId);
      if (customTitle.trim()) {
        formData.append('title', customTitle.trim());
      }

      const res = await fetch('/api/forms', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process XLSForm file');
      }

      setSuccessMessage('XLSForm validated, parsed into digital structure, and saved successfully!');
      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings);
      }
      setSelectedFile(null);
      setCustomTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Error uploading and processing XLSForm file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header with Title and Download Template CTA */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Upload XLSForm Survey Definition
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Compliant with standard KoboToolbox / ODK XLSForm format (survey, choices, settings sheets).
          </p>
        </div>

        <a
          href="/api/forms/sample-template"
          download="IDP_Sample_XLSForm_Template.xlsx"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shadow-2xs shrink-0"
        >
          <Download className="w-4 h-4 text-blue-600" />
          Download Sample XLSForm (.xlsx)
        </a>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Project Selector & Optional Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800"
              required
            >
              <option value="" disabled>Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name} ({p.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Custom Form Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Defaults to title inside settings sheet"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            {selectedFile ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for conversion
                </p>
                <p className="text-[11px] text-blue-600 mt-2 font-medium">
                  Click or drag another file to replace
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Drag and drop your XLSForm workbook here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  or <span className="text-blue-600 font-semibold underline">browse files</span> from your computer
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Must include 'survey', 'choices', and 'settings' sheets (.xlsx)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Validation Error Message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">XLSForm Validation Failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Success!</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Warnings list */}
        {warnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Parser Warnings:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing & Validating XLSForm...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Validate & Deploy Digital Form
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
