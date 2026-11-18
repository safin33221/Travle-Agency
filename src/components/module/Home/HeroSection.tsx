'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CheckCircle2,
  Globe,
  GraduationCap,
  Landmark,
  Palmtree,
  Search,
} from 'lucide-react';
import { publicContentConfig } from '@/config/public-content.config';
import { useBrand } from '@/components/providers/BrandProvider';
import { Button } from '@/components/ui/button';

const QUICK_SECTORS = [
  {
    Icon: Palmtree,
    title: 'Holiday Tours',
    href: '/packages?category=TOUR',
  },
  {
    Icon: Landmark,
    title: 'Hajj & Umrah',
    href: '/packages?category=HAJJ_UMRAH',
  },
  {
    Icon: GraduationCap,
    title: 'Student Visa',
    href: '/visa-services?category=STUDENT_VISA',
  },
  {
    Icon: Briefcase,
    title: 'Work Permit & Job Visa',
    href: '/visa-services?category=WORK_PERMIT',
  },
];

export function HeroSection() {
  const { stats } = publicContentConfig;
  const brand = useBrand();
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = trackingCode.trim().toUpperCase();
    if (!cleaned) {
      router.push('/track-status');
      return;
    }
    router.push(`/track-status?code=${encodeURIComponent(cleaned)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Hero Copy & CTAs */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 px-3.5 py-1 text-xs font-semibold text-teal-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />
              Trusted Travel Partner • {brand.agencyName}
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
              Your Trusted Partner for Tours, Hajj, Student Visas & Work Permits
            </h1>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/packages">
                <Button variant="secondary" size="lg">
                  Explore All Packages →
                </Button>
              </Link>
              <Link href="/visa-services">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 bg-slate-800/70 text-white hover:bg-slate-800 hover:border-teal-400/60"
                >
                  <Globe className="h-4 w-4 text-teal-300" />
                  Browse Visa Countries
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-teal-400/40 bg-teal-500/10 text-teal-100 hover:bg-teal-500/20"
                >
                  <CheckCircle2 className="h-4 w-4 text-teal-300" />
                  Free Eligibility Check
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Quick Action Box (Track File + Choose Service) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur">
              <div className="mb-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Search className="h-4 w-4 text-teal-300" />
                  Track Your Live File Status
                </h2>
              </div>

              <form onSubmit={handleQuickTrack} className="flex gap-2">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Enter Tracking Code (e.g. SV-820383)"
                  className="h-10 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-mono uppercase text-white placeholder:text-slate-400 focus:border-teal-400 focus:outline-none"
                />
                <Button type="submit" variant="secondary" size="sm" className="h-10 px-4">
                  Track →
                </Button>
              </form>

              <div className="mt-5 pt-5 border-t border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Browse By Category
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_SECTORS.map(({ Icon, title, href }) => (
                    <Link
                      key={title}
                      href={href}
                      className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-3 transition hover:border-teal-400/70 hover:bg-teal-500/10"
                    >
                      <Icon className="h-4 w-4 text-teal-300 shrink-0" />
                      <p className="text-xs font-semibold text-white">
                        {title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-slate-800/90 pt-8 sm:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-300 tabular-nums">
                {stat.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
