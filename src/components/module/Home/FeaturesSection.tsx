import { publicContentConfig } from '@/config/public-content.config';
import { Card } from '@/components/ui/card';

export function FeaturesSection() {
  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why Plan Your Trip With Us?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Every itinerary and quotation is reviewed and verified by our experienced travel operations team.
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
  );
}
