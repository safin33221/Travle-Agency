import Link from 'next/link';
import { publicContentConfig } from '@/config/public-content.config';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const { hero, stats } = publicContentConfig;

  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-sky-500/15 border border-sky-400/30 px-3.5 py-1 text-xs font-semibold text-sky-300">
            {hero.badge}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={hero.primaryCta.href}>
              <Button variant="secondary" size="lg">
                {hero.primaryCta.label}
              </Button>
            </Link>
            <Link href={hero.secondaryCta.href}>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 bg-slate-800/70 text-white hover:bg-slate-800"
              >
                {hero.secondaryCta.label}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 border-t border-slate-800 pt-10 sm:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <p className="text-3xl font-extrabold text-sky-400">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
