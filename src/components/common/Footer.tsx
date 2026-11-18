'use client';

import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  MessageSquare,
  Palmtree,
  Phone,
  Plane,
  Search,
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { useBrand } from '@/components/providers/BrandProvider';
import { Logo } from '@/components/shared/Logo';

export function Footer() {
  const brand = useBrand();
  const cleanWhatsapp = brand.whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="border-t border-stone-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="inline-block mb-3 max-w-full">
              <Logo href="/" inverted />
            </div>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {brandConfig.tagline}
            </p>
            <p className="text-xs text-slate-500 mt-4">
              {brand.legalName}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Travel & Visa Services
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/packages?category=TOUR" className="inline-flex items-center gap-2 hover:text-white transition">
                  <Palmtree className="h-4 w-4 text-teal-400 shrink-0" />
                  Holiday & Group Tours
                </Link>
              </li>
              <li>
                <Link href="/packages?category=HAJJ_UMRAH" className="inline-flex items-center gap-2 hover:text-white transition">
                  <Landmark className="h-4 w-4 text-teal-400 shrink-0" />
                  Hajj & Umrah Packages
                </Link>
              </li>
              <li>
                <Link href="/visa-services?category=STUDENT_VISA" className="inline-flex items-center gap-2 hover:text-white transition">
                  <GraduationCap className="h-4 w-4 text-teal-400 shrink-0" />
                  Study Abroad & Student Visa
                </Link>
              </li>
              <li>
                <Link href="/visa-services?category=WORK_PERMIT" className="inline-flex items-center gap-2 hover:text-white transition">
                  <Briefcase className="h-4 w-4 text-teal-400 shrink-0" />
                  Work Permit & Job Visa
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
                <Link href="/track-status" className="inline-flex items-center gap-2 hover:text-white transition font-medium text-teal-300">
                  <Search className="h-4 w-4 shrink-0" />
                  Live File Status Tracker
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center gap-2 hover:text-white transition">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                  Free Eligibility Assessment
                </Link>
              </li>
              <li>
                <Link href="/visa-services" className="inline-flex items-center gap-2 hover:text-white transition">
                  <Globe className="h-4 w-4 text-teal-400 shrink-0" />
                  Country Visa Checklists
                </Link>
              </li>
              <li>
                <Link href="/packages" className="inline-flex items-center gap-2 hover:text-white transition">
                  <Plane className="h-4 w-4 text-teal-400 shrink-0" />
                  All Verified Packages
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
                  href={`tel:${brand.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 hover:text-white transition"
                >
                  <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                  {brand.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-teal-300 transition"
                >
                  <MessageSquare className="h-4 w-4 text-teal-400 shrink-0" />
                  WhatsApp Consultation ↗
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="inline-flex items-center gap-2 hover:text-white transition"
                >
                  <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                  {brand.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed">
                <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{brand.address}</span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                <span>{brand.officeHours}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {brandConfig.establishedYear} {brand.legalName}. All rights reserved.</p>
          <p>Transparent Consultancy • Zero Hidden Charges • 24/7 Online File Tracking</p>
        </div>
      </div>
    </footer>
  );
}
