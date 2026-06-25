'use client';
import PublicLayout from '@/components/Layout/PublicLayout';
import Dashboard from '@/components/Dashboard/Dashboard';

export default function HomePage() {
  return (
    <PublicLayout>
      <Dashboard />
    </PublicLayout>
  );
}
