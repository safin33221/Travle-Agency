import Link from 'next/link';
import { publicContentConfig } from '@/config/public-content.config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pick a Service or Check Eligibility',
    href: '/contact',
  },
  {
    step: '02',
    title: 'Receive Tracking ID & Official Quote',
    href: '/packages',
  },
  {
    step: '03',
    title: 'Track Documents & Visa Live 24/7',
    href: '/track-status',
  },
];

export function FeaturesSection() {
  return (
    <>
      {/* How It Works */}
      <section className="py-12 bg-white border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How It Works
            </h2>
            <Link href="/contact">
              <Button variant="secondary" size="sm">
                Start Free Assessment →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <Link key={item.step} href={item.href}>
                <Card className="p-5 border-stone-200/90 hover:border-teal-400 transition flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white font-extrabold text-sm">
                    {item.step}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Plan With Us */}
      <section className="py-14 bg-[#FAF9F6] border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-8">
            Why Choose Us
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {publicContentConfig.features.map((feat, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs mb-3">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
