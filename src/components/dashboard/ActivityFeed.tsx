import { SystemActivity } from '@/lib/types';
import {
  UserPlus,
  FileCheck,
  FolderPlus,
  UploadCloud,
  FileDown,
  Clock,
} from 'lucide-react';

interface ActivityFeedProps {
  activities: SystemActivity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: SystemActivity['type']) => {
    switch (type) {
      case 'supervisor_created':
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case 'submission_received':
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'project_created':
        return <FolderPlus className="w-4 h-4 text-blue-600" />;
      case 'form_uploaded':
        return <UploadCloud className="w-4 h-4 text-amber-600" />;
      default:
        return <FileDown className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBg = (type: SystemActivity['type']) => {
    switch (type) {
      case 'supervisor_created':
        return 'bg-purple-50 border-purple-100';
      case 'submission_received':
        return 'bg-emerald-50 border-emerald-100';
      case 'project_created':
        return 'bg-blue-50 border-blue-100';
      case 'form_uploaded':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Live Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time system events, team actions & submissions</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Feed
        </span>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {activities.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No recent activities recorded.</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="py-3.5 flex items-start gap-3.5 group">
              <div
                className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-xl border ${getBg(
                  act.type
                )} shrink-0`}
              >
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">{act.title}</p>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.description}</p>
                <span className="inline-block mt-1 text-[10px] font-medium text-slate-400">
                  By {act.actor_name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
