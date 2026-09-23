'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { GlobalSearchModal } from './GlobalSearchModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bg text-slate-900 flex flex-col antialiased">
      {/* Global Cmd+K Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Navigation Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isSuperAdmin={true}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-950">IMAM E MAHDI FOUNDATION</span>
            <span>&bull;</span>
            <span>Digital Operating System (IMF-DOS)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Enterprise ERP v2.0</span>
            <span>&bull;</span>
            <span className="font-mono">Security Encrypted</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
