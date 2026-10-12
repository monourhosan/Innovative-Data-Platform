'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  FileSpreadsheet,
  Users,
  UserCheck,
  Activity,
  Database,
  BarChart3,
  Download,
  Code2,
  Settings,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Survey Forms', href: '/forms', icon: FileSpreadsheet, badge: 'XLSForm' },
  { name: 'Supervisors', href: '/supervisors', icon: UserCheck },
  { name: 'Team Members', href: '/team-members', icon: Users },
  { name: 'Live Monitoring', href: '/monitoring', icon: Activity, badge: 'GIS' },
  { name: 'Data Records', href: '/data-records', icon: Database },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Export Data', href: '/export', icon: Download },
  { name: 'API Docs', href: '/api-docs', icon: Code2, badge: 'Android' },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold text-lg">
            IDP
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-tight text-sm">
              Innovative Data
            </span>
            <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
              Admin Platform
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Management & Control
          </div>

          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-800 text-blue-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Project Creator Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-200">Saif</span>
                <span className="text-[10px] text-slate-400">System Architect</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
          </div>
        </div>
      </aside>
    </>
  );
}
