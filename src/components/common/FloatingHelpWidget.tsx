import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';

export function FloatingHelpWidget() {
  const cleanWhatsapp = brandConfig.contact.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      <Link
        href="/track-status"
        className="flex items-center gap-1.5 rounded-full border border-sky-300 bg-white/95 backdrop-blur px-3.5 py-2 text-xs font-bold text-sky-800 shadow-lg hover:bg-sky-50 transition"
      >
        <span>🔍</span>
        <span>Track File</span>
      </Link>
      <a
        href={`https://wa.me/${cleanWhatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
      >
        <span>💬</span>
        <span className="hidden sm:inline">WhatsApp Help</span>
        <span className="sm:hidden">Chat</span>
      </a>
    </div>
  );
}
