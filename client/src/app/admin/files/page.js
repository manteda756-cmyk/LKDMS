'use client';
import AdminLayout from '@/components/Admin/AdminLayout';
import AdminFileList from '@/components/Admin/AdminFileList';

export default function AdminFilesPage() {
  return (
    <AdminLayout>
      <AdminFileList />
    </AdminLayout>
  );
}
