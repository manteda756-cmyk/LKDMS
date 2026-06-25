'use client';
import AdminLayout from '@/components/Admin/AdminLayout';
import FileForm from '@/components/Admin/FileForm';

export default function EditFilePage({ params }) {
  return (
    <AdminLayout>
      <FileForm fileId={params.id} />
    </AdminLayout>
  );
}
