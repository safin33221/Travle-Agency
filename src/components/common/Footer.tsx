import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';
import { Logo } from '@/components/shared/Logo';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="bg-white inline-block px-3 py-1.5 rounded-lg mb-3">
              <Logo href="/" />
            </div>
            <p className="text-sm text-slate-400 max-w-sm mt-2">
              {brandConfig.tagline}
            </p>
            <p className="text-xs text-slate-500 mt-4">
              {brandConfig.legalName}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/packages" className="hover:text-white">
                  Verified Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Request Custom Quotation
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Staff Operations Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact & Support
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Phone: {brandConfig.contact.phone}</li>
              <li>Email: {brandConfig.contact.email}</li>
              <li>Address: {brandConfig.contact.address}</li>
              <li>Hours: {brandConfig.contact.officeHours}</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {brandConfig.establishedYear} {brandConfig.legalName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
