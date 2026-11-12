'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { publicContentConfig } from '@/config/public-content.config';
import { Button } from '@/components/ui/button';

const QUICK_SECTORS = [
  {
    icon: '🏖️',
    title: 'Holiday Tours & Visa',
    subtitle: 'Family trips, honeymoon & tourist visas',
    href: '/packages?category=TOUR',
    color: 'hover:border-sky-400 hover:bg-sky-500/10',
  },
  {
    icon: '🕋',
    title: 'Hajj & Umrah',
    subtitle: 'Haram-side hotels & guided Umrah groups',
    href: '/packages?category=HAJJ_UMRAH',
    color: 'hover:border-emerald-400 hover:bg-emerald-500/10',
  },
  {
    icon: '🎓',
    title: 'Student Visa',
    subtitle: 'University admission, SOP & offer letters',
    href: '/visa-services?category=STUDENT_VISA',
    color: 'hover:border-purple-400 hover:bg-purple-500/10',
  },
  {
    icon: '💼',
    title: 'Work Permit & Job Visa',
    subtitle: 'Verified overseas jobs, medical & BMET',
    href: '/visa-services?category=WORK_PERMIT',
    color: 'hover:border-amber-400 hover:bg-amber-500/10',
  },
];

export function HeroSection() {
  const { hero, stats } = publicContentConfig;
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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Hero Copy & CTAs */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 px-3.5 py-1 text-xs font-semibold text-sky-300">
              ✓ {hero.badge}
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
              Your Trusted Partner for Tours, Hajj, Student Visas & Work Permits
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              {hero.subtitle}
            </p>
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
                  className="border-slate-600 bg-slate-800/80 text-white hover:bg-slate-800"
                >
                  🌍 Browse Visa Countries
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                >
                  ✓ Free Eligibility Check
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Quick Action Box (Track File + Choose Service) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur">
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Already Applied With Us?
                </span>
                <h2 className="mt-0.5 text-lg font-bold text-white">
                  🔍 Track Your Live Application Status
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your Tracking ID (e.g. <code className="text-sky-300 font-mono">WP-102938</code> or{' '}
                  <code className="text-sky-300 font-mono">SV-820383</code>)
                </p>
              </div>

              <form onSubmit={handleQuickTrack} className="flex gap-2">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Enter Tracking Code (e.g. SV-820383)"
                  className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-mono uppercase text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
                />
                <Button type="submit" variant="secondary" size="sm" className="h-10 px-4">
                  Track →
                </Button>
              </form>

              <div className="mt-5 pt-5 border-t border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Or Choose What You Need Today:
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_SECTORS.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={`rounded-xl border border-slate-700/80 bg-slate-800/60 p-3 transition ${item.color}`}
                    >
                      <p className="text-xs font-bold text-white">
                        {item.icon} {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">
                        {item.subtitle}
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
              <p className="text-2xl sm:text-3xl font-extrabold text-sky-400">
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
