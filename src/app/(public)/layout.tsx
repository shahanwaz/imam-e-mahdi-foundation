import React from 'react';
import { PublicNavbar } from '@/components/public/layout/PublicNavbar';
import { PublicFooter } from '@/components/public/layout/PublicFooter';

export default function PublicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#17201C] selection:bg-[#EEF5F1] selection:text-[#063B2E]">
      <PublicNavbar />
      <main className="flex-1 w-full">{children}</main>
      <PublicFooter />
    </div>
  );
}
