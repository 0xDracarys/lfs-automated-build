'use client';

import AdminDashboard from '@/components/admin-dashboard';
import AdminRoute from '@/components/auth/AdminRoute';

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
