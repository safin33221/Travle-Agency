import { Logo } from '@/components/shared/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="mb-8">
        <Logo href="/" />
      </div>
      {children}
    </div>
  );
}
