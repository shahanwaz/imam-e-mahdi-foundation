import React from 'react';
import { FounderDirectorDashboardClient } from '@/components/admin/dashboard/FounderDirectorDashboardClient';

export const metadata = {
  title: 'Founder & Director Command Center | IMAM MISSION',
  description: 'Executive overview, pending approvals, and real-time operational telemetry for the Director.',
};

export default function AdminDashboardPage() {
  return <FounderDirectorDashboardClient />;
}
