'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface ReportDownloadButtonProps {
  title: string;
  fileSize: string;
  fileUrl?: string;
}

export function ReportDownloadButton({ title, fileSize, fileUrl }: ReportDownloadButtonProps) {
  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      // Direct notification / simulated statutory document download
      const content = `IMAM E MAHDI FOUNDATION - STATUTORY AUDIT DOSSIER\nTitle: ${title}\nAudit Status: Certified & Signed\nGenerated for Public Record.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-gold-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
    >
      <Download className="w-4 h-4" />
      <span>Download ({fileSize})</span>
    </button>
  );
}
