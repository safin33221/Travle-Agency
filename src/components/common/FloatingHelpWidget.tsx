'use client';

import Link from 'next/link';
import { MessageSquare, Search } from 'lucide-react';
import { useBrand } from '@/components/providers/BrandProvider';

export function FloatingHelpWidget() {
  const brand = useBrand();
  const cleanWhatsapp = brand.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      <Link
        href="/track-status"
        className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-white/95 backdrop-blur px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-lg hover:border-teal-600 hover:bg-teal-50 transition"
      >
        <Search className="h-3.5 w-3.5 text-teal-700" />
        <span>Track File</span>
      </Link>
      <a
        href={`https://wa.me/${cleanWhatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-teal-800 transition"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">WhatsApp Help</span>
        <span className="sm:hidden">Chat</span>
      </a>
    </div>
  );
}
