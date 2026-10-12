'use client';

import { useState } from 'react';
import { SurveyFormStructure, SurveyQuestion } from '@/lib/types';
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Calendar,
  Clock,
  Layers,
  MapPin,
} from 'lucide-react';

interface FormRendererProps {
  structure: SurveyFormStructure;
  projectId: string;
  formId: string;
  onSubmitSuccess?: (submissionId: string) => void;
}

export default function FormRenderer({
  structure,
  projectId,
  formId,
  onSubmitSuccess,
}: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCheckboxToggle = (name: string, choiceName: string) => {
    const current = (formData[name] as string[]) || [];
    const next = current.includes(choiceName)
      ? current.filter((c) => c !== choiceName)
      : [...current, choiceName];
    handleInputChange(name, next);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const q of structure.questions) {
      const val = formData[q.name];

      // Required check
      if (q.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[q.name] = 'This question is required.';
          continue;
        }
      }

      // Integer/number check
      if (val !== undefined && val !== '' && (q.type === 'integer' || q.type === 'decimal')) {
        const num = Number(val);
        if (isNaN(num)) {
          newErrors[q.name] = 'Please enter a valid number.';
          continue;
        }

        // Basic constraint verification
        if (q.name === 'age' && (num < 18 || num > 120)) {
          newErrors[q.name] = q.constraint_message || 'Age must be between 18 and 120.';
          continue;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          form_id: formId,
          supervisor_id: 'sup-1',
          team_member_id: 'tm-1',
          form_data: formData,
          gps_location: {
            latitude: 23.8103 + (Math.random() - 0.5) * 0.05,
            longitude: 90.4125 + (Math.random() - 0.5) * 0.05,
            altitude: 12.0,
            accuracy: 3.0,
            address: 'Web Preview Simulator Location',
          },
          sync_status: 'synced',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit test response');
      }

      setSubmittedId(data.submission_id || 'test-sub-1');
      if (onSubmitSuccess) onSubmitSuccess(data.submission_id);
    } catch (err: any) {
      alert(err.message || 'Error submitting test record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group questions by group if defined
  const groupedQuestions: { groupName?: string; questions: SurveyQuestion[] }[] = [];
  let currentGroupName: string | undefined = undefined;
  let currentList: SurveyQuestion[] = [];

  for (const q of structure.questions) {
    if (q.group !== currentGroupName) {
      if (currentList.length > 0) {
        groupedQuestions.push({ groupName: currentGroupName, questions: currentList });
      }
      currentGroupName = q.group;
      currentList = [q];
    } else {
      currentList.push(q);
    }
  }
  if (currentList.length > 0) {
    groupedQuestions.push({ groupName: currentGroupName, questions: currentList });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Form Header */}
      <div className="p-6 border-b border-slate-100 bg-linear-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
          <Layers className="w-4 h-4" />
          Interactive Digital Questionnaire
        </div>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-white">{structure.title}</h2>
        <div className="mt-2 flex items-center gap-4 text-xs text-blue-100">
          <span>Form ID: <strong className="text-white">{structure.form_id}</strong></span>
          <span>Version: <strong className="text-white">{structure.version}</strong></span>
          <span>Questions: <strong className="text-white">{structure.questions.length}</strong></span>
        </div>
      </div>

      {submittedId ? (
        <div className="p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Test Submission Synchronized!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The questionnaire data was validated and synchronized into the database with simulated GPS coordinates.
            Submission ID: <strong className="text-slate-800">{submittedId}</strong>
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSubmittedId(null);
                setFormData({});
              }}
              className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              Fill Out Again
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {groupedQuestions.map((group, gIdx) => (
            <div key={gIdx} className="space-y-6">
              {group.groupName && (
                <div className="pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {group.groupName}
                  </h4>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.questions.map((q) => {
                  const error = errors[q.name];
                  const isFullWidth = ['text', 'select_multiple', 'note'].includes(q.type);

                  return (
                    <div
                      key={q.name}
                      className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}
                    >
                      <label className="block text-xs font-bold text-slate-800">
                        {q.label}
                        {q.required && <span className="text-rose-500 ml-1">*</span>}
                      </label>
                      {q.hint && <p className="text-[11px] text-slate-400">{q.hint}</p>}

                      {/* Text Input */}
                      {q.type === 'text' && (
                        <input
                          type="text"
                          value={formData[q.name] || ''}
                          onChange={(e) => handleInputChange(q.name, e.target.value)}
                          placeholder="Type answer here..."
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                        />
                      )}

                      {/* Number Input */}
                      {(q.type === 'integer' || q.type === 'decimal') && (
                        <input
                          type="number"
                          step={q.type === 'decimal' ? '0.01' : '1'}
                          value={formData[q.name] || ''}
                          onChange={(e) => handleInputChange(q.name, e.target.value)}
                          placeholder="0"
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                        />
                      )}

                      {/* Date Input */}
                      {q.type === 'date' && (
                        <div className="relative">
                          <input
                            type="date"
                            value={formData[q.name] || ''}
                            onChange={(e) => handleInputChange(q.name, e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                          />
                        </div>
                      )}

                      {/* Time Input */}
                      {q.type === 'time' && (
                        <div className="relative">
                          <input
                            type="time"
                            value={formData[q.name] || ''}
                            onChange={(e) => handleInputChange(q.name, e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                          />
                        </div>
                      )}

                      {/* Select One (Radio Options) */}
                      {q.type === 'select_one' && (
                        <div className="space-y-2 pt-1">
                          {(q.choices || []).map((choice) => (
                            <label
                              key={choice.name}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                formData[q.name] === choice.name
                                  ? 'border-blue-500 bg-blue-50/40 text-blue-900 font-medium'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.name}
                                value={choice.name}
                                checked={formData[q.name] === choice.name}
                                onChange={() => handleInputChange(q.name, choice.name)}
                                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{choice.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Select Multiple (Checkboxes) */}
                      {q.type === 'select_multiple' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {(q.choices || []).map((choice) => {
                            const isChecked = ((formData[q.name] as string[]) || []).includes(choice.name);
                            return (
                              <label
                                key={choice.name}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                  isChecked
                                    ? 'border-blue-500 bg-blue-50/40 text-blue-900 font-medium'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCheckboxToggle(q.name, choice.name)}
                                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span>{choice.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Error text */}
                      {error && (
                        <p className="flex items-center gap-1 text-[11px] text-rose-600 font-medium pt-0.5">
                          <AlertCircle className="w-3 h-3" />
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Simulated GPS Stamp */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Simulated Field Collector GPS: <strong>23.8103° N, 90.4125° E (&plusmn;3.5m)</strong></span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              GPS Fixed
            </span>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synchronizing Form...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Test Field Response
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
