'use client';
import { Suspense } from 'react';
import PublicLayout from '@/components/Layout/PublicLayout';
import FileIndex from '@/components/Files/FileIndex';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function FilesPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<LoadingSpinner text="በመጫን ላይ..." />}>
        <FileIndex />
      </Suspense>
    </PublicLayout>
  );
}
