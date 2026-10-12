'use client';

import { useState } from 'react';
import { TrendingUp, CheckCircle2, Users, Calendar } from 'lucide-react';

interface ChartsProps {
  timelineDates: string[];
  timelineCounts: number[];
  projectProgress: {
    name: string;
    target: number;
    completed: number;
    percentage: number;
  }[];
}

export default function Charts({
  timelineDates,
  timelineCounts,
  projectProgress,
}: ChartsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...timelineCounts, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Data Submission Timeline Bar & Area Chart */}
      <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Field Data Submissions Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily volume of records synchronized from Android field devices
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Last 7 Days
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="mt-6">
          <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-100">
            {timelineDates.map((date, idx) => {
              const count = timelineCounts[idx] || 0;
              const heightPercent = Math.max(12, Math.round((count / maxVal) * 100));
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={date + idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-10 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md shadow-lg pointer-events-none z-20 whitespace-nowrap">
                      {count} submissions
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                      isHovered
                        ? 'bg-blue-600 shadow-md shadow-blue-500/30'
                        : 'bg-blue-500/80 hover:bg-blue-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between px-2 pt-2 text-[11px] font-medium text-slate-400">
            {timelineDates.map((date, idx) => (
              <span
                key={date + idx}
                className={`text-center flex-1 transition-colors ${
                  hoveredIndex === idx ? 'text-blue-600 font-bold' : ''
                }`}
              >
                {date}
              </span>
            ))}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[11px] text-slate-400">Weekly Total</div>
            <div className="text-base font-bold text-slate-800">
              {timelineCounts.reduce((a, b) => a + b, 0)} Records
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Peak Daily Sync</div>
            <div className="text-base font-bold text-blue-600">{maxVal} Submissions</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Sync Success</div>
            <div className="text-base font-bold text-emerald-600">99.4%</div>
          </div>
        </div>
      </div>

      {/* 2. Project Progress & Target Fulfillment */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Project Progress
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target completion based on collected forms
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {projectProgress.map((proj, idx) => (
              <div key={proj.name + idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={proj.name}>
                    {proj.name}
                  </span>
                  <span className="font-bold text-slate-900">{proj.percentage}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${proj.percentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      proj.percentage > 75
                        ? 'bg-emerald-500'
                        : proj.percentage > 35
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{proj.completed} collected</span>
                  <span>Target: {proj.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity Highlight */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">Active Field Workforce</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              100% Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
