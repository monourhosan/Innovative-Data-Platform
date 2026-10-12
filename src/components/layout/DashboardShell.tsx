'use client';

import { useState, Suspense } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Suspense fallback={<div className="hidden lg:block fixed top-0 bottom-0 left-0 w-64 bg-slate-900" />}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        </Suspense>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
