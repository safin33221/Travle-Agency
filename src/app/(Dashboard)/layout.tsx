import { redirect } from 'next/navigation';
import { getMe } from '@/services/auth/getMe';
import { DashboardSidebar } from '@/components/module/dashboard/DashboardSidebar';
import { DashboardNavbar } from '@/components/module/dashboard/DashboardNavbar';

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar role={user.role} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <DashboardNavbar user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
