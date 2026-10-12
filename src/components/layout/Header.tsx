'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  adminName?: string;
  adminRole?: string;
}

export default function Header({
  onMenuToggle,
  adminName = 'Saif (Admin)',
  adminRole = 'System Administrator',
}: HeaderProps) {
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200/80 shadow-2xs lg:px-6">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 text-slate-600 rounded-lg lg:hidden hover:bg-slate-100 focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, forms, records..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Badges & Profile */}
      <div className="flex items-center gap-3">
        {/* Sync Status Badge */}
        <button
          onClick={handleManualSync}
          title="Click to trigger sync"
          className="hidden md:flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Active</span>
        </button>

        {/* System Online Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Kobo-Compatible Core</span>
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 text-left rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              S
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {adminName}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                {adminRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in-50 zoom-in-95"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800">{adminName}</p>
                <p className="text-[11px] text-slate-500">admin@innovativedata.org</p>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Administrator Role
                </div>
              </div>

              <a
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Account & Settings</span>
              </a>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
