import AdminDashboard from '@/components/admin-dashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata = {
  title: 'Admin Dashboard | LFS Learning Platform',
  description: 'Monitor learning platform statistics and analytics',
};

export default function AdminPage() {
  // TODO: Add admin role check before rendering
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
