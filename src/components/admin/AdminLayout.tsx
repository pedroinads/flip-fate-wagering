import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-casino flex items-center justify-center">
        <div className="text-casino-gold">Verificando permissões...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-casino">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}