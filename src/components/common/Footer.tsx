import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';
import { Logo } from '@/components/shared/Logo';

export function Footer() {
  const cleanWhatsapp = brandConfig.contact.whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="bg-white inline-block px-3 py-1.5 rounded-lg mb-3">
              <Logo href="/" />
            </div>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {brandConfig.tagline}
            </p>
            <p className="text-xs text-slate-500 mt-4">
              {brandConfig.legalName}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Travel & Visa Services
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/packages?category=TOUR" className="hover:text-white transition">
                  🏖️ Holiday & Group Tours
                </Link>
              </li>
              <li>
                <Link href="/packages?category=HAJJ_UMRAH" className="hover:text-white transition">
                  🕋 Hajj & Umrah Packages
                </Link>
              </li>
              <li>
                <Link href="/visa-services?category=STUDENT_VISA" className="hover:text-white transition">
                  🎓 Study Abroad & Student Visa
                </Link>
              </li>
              <li>
                <Link href="/visa-services?category=WORK_PERMIT" className="hover:text-white transition">
                  💼 Work Permit & Job Visa
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Applicant Self-Service
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/track-status" className="hover:text-white transition font-medium text-sky-300">
                  🔍 Live File Status Tracker
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  ✓ Free Eligibility Assessment
                </Link>
              </li>
              <li>
                <Link href="/visa-services" className="hover:text-white transition">
                  🌍 Country Visa Checklists
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition text-slate-400">
                  Staff Operations Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Direct Office Support
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <a
                  href={`tel:${brandConfig.contact.phone.replace(/\s+/g, '')}`}
                  className="hover:text-white transition"
                >
                  📞 {brandConfig.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition"
                >
                  💬 WhatsApp Consultation ↗
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brandConfig.contact.email}`}
                  className="hover:text-white transition"
                >
                  ✉️ {brandConfig.contact.email}
                </a>
              </li>
              <li className="text-xs leading-relaxed">📍 {brandConfig.contact.address}</li>
              <li className="text-xs">🕒 {brandConfig.contact.officeHours}</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {brandConfig.establishedYear} {brandConfig.legalName}. All rights reserved.</p>
          <p>Transparent Consultancy • Zero Hidden Charges • 24/7 Online File Tracking</p>
        </div>
      </div>
    </footer>
  );
}
