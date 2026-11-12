import Link from 'next/link';
import { publicContentConfig } from '@/config/public-content.config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pick a Service or Check Eligibility',
    desc: 'Browse verified packages/visa countries or complete our 1-minute Free Eligibility Form with zero registration.',
  },
  {
    step: '02',
    title: 'Get Tracking ID & Transparent Quote',
    desc: 'Immediately receive a unique File Tracking ID (like #SV-820383) and a clear cost + document checklist from our counselor.',
  },
  {
    step: '03',
    title: 'Track Every Step Online 24/7',
    desc: 'Check when your documents are verified, offer letter/medical is done, or visa is stamped—anytime on /track-status.',
  },
];

const FAQS = [
  {
    q: 'Do I need to create an account or log in to apply or track my visa?',
    a: 'No! General clients never need a password. Just submit an inquiry to receive your Tracking Code, and enter that code on Track My File anytime.',
  },
  {
    q: 'Are there any hidden charges beyond the quotation?',
    a: 'Never. Every official quotation clearly separates package/consultancy fees, inclusions, exclusions, and optional add-ons.',
  },
  {
    q: 'How do I know what documents I need for Student Visa or Work Permit?',
    a: 'Open any package or Visa Country service page to see the exact Mandatory vs. Supporting document checklist before even calling us.',
  },
  {
    q: 'Does the agency guarantee visa approval?',
    a: 'No ethical agency can guarantee embassy decisions. We guarantee 100% honest eligibility assessment, clean documentation, and transparent step-by-step tracking.',
  },
];

export function FeaturesSection() {
  return (
    <>
      {/* How It Works in 3 Simple Steps */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700">
              Simple & Transparent
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              How Your Journey Works in 3 Easy Steps
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Designed so any traveler, student, or worker can apply and follow progress effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <Card
                key={item.step}
                className="p-6 border-slate-200 hover:border-sky-300 transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white font-extrabold text-sm">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Plan With Us */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Why Plan Your Trip or Visa With Us?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Every itinerary, document checklist, and quotation is reviewed by our experienced operations desk.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {publicContentConfig.features.map((feat, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700 font-bold text-sm mb-4">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick FAQ & Call-to-Action Banner */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Common Questions From Travelers & Applicants
              </h2>
              <div className="space-y-3">
                {FAQS.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-slate-900 p-7 text-white shadow-lg space-y-4">
                <span className="inline-block rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300">
                  Free Expert Guidance
                </span>
                <h3 className="text-2xl font-extrabold leading-snug">
                  Unsure Which Country or Package Fits Your Budget?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Answer 4 simple questions on our Free Eligibility form and get an instant profile score plus a live Tracking Code.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/contact">
                    <Button variant="secondary">Start Free Assessment →</Button>
                  </Link>
                  <Link href="/track-status">
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                    >
                      🔍 Track Existing File
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
