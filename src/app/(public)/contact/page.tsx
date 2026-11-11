import { brandConfig } from '@/config/brand.config';
import { Card } from '@/components/ui/card';

export default function PublicContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Contact {brandConfig.agencyName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Reach out to our travel specialists via phone, WhatsApp, or visit our office for a personalized tour quotation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-bold uppercase text-sky-600">
            Phone & WhatsApp
          </h3>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {brandConfig.contact.phone}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {brandConfig.contact.officeHours}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold uppercase text-sky-600">
            Email Desk
          </h3>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {brandConfig.contact.email}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Official quotation and corporate group inquiries
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold uppercase text-sky-600">
            Office Location
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {brandConfig.contact.address}
          </p>
        </Card>
      </div>
    </div>
  );
}
