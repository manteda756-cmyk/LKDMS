'use client';
import PublicLayout from '@/components/Layout/PublicLayout';
import FileDetail from '@/components/Files/FileDetail';

export default function FileDetailPage({ params }) {
  return (
    <PublicLayout>
      <FileDetail id={params.id} />
    </PublicLayout>
  );
}
