import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { brandConfig } from '@/config/brand.config';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo href="/" />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Home
          </Link>
          <Link href="/packages" className="hover:text-sky-600 transition-colors">
            Tour Packages
          </Link>
          <Link href="/contact" className="hover:text-sky-600 transition-colors">
            Contact & Quote
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
            Hotline: {brandConfig.contact.phone}
          </span>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Staff Portal
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
