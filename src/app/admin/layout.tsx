import SiteShell from '@/components/site-shell';
import AdminSidebar from '@/components/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell adminMode>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64">
          {children}
        </div>
      </div>
    </SiteShell>
  );
}
