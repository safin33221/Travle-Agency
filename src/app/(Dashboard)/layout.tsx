import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMe } from '@/services/auth/getMe';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import { BrandProvider } from '@/components/providers/BrandProvider';
import { DashboardSidebar } from '@/components/module/dashboard/DashboardSidebar';
import { DashboardNavbar } from '@/components/module/dashboard/DashboardNavbar';

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getLiveBrandInfo();
  return {
    title: {
      default: `CRM Workspace | ${brand.agencyName}`,
      template: `%s | ${brand.agencyName}`,
    },
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, brand] = await Promise.all([getMe(), getLiveBrandInfo()]);

  if (!user) {
    redirect('/');
  }

  return (
    <BrandProvider brand={brand}>
      <div className="min-h-screen bg-[#FAF9F6]">
        <DashboardSidebar role={user.role} />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <DashboardNavbar user={user} />
          <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </BrandProvider>
  );
}
