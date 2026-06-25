'use client';
import PublicLayout from '@/components/Layout/PublicLayout';
import DepartmentList from '@/components/Departments/DepartmentList';

export default function DepartmentsPage() {
  return (
    <PublicLayout>
      <DepartmentList />
    </PublicLayout>
  );
}
