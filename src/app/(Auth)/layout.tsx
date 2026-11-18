import type { Metadata } from 'next';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import { BrandProvider } from '@/components/providers/BrandProvider';
import { Logo } from '@/components/shared/Logo';

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getLiveBrandInfo();
  return {
    title: `Staff Sign In | ${brand.agencyName}`,
  };
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getLiveBrandInfo();

  return (
    <BrandProvider brand={brand}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12">
        <div className="mb-8">
          <Logo href="/" />
        </div>
        {children}
      </div>
    </BrandProvider>
  );
}
