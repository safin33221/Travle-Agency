/**
 * ============================================================================
 * CENTRALIZED WHITE-LABEL BRAND CONFIGURATION
 * ============================================================================
 * When cloning this project for a new Travel Agency client:
 * 1. Update this single file (`brand.config.ts`) for agency name, logo, colors,
 *    contact details, currency, and SEO metadata.
 * 2. Update `public-content.config.ts` and `src/app/(Public)` for landing page
 *    custom design.
 * 3. The entire `(Dashboard)` CRM, AI Copilot, Quotation Engine, and RBAC
 *    automatically adapt without changing a single dashboard file.
 * ============================================================================
 */

import { ServiceCategory } from '@/types/api';

export interface SectorMetaConfig {
  key: ServiceCategory;
  label: string;
  shortLabel: string;
  badgeColor: string;
  description: string;
}

export const SECTOR_CATALOG: Record<ServiceCategory, SectorMetaConfig> = {
  TOUR: {
    key: 'TOUR',
    label: 'Holiday Tours & Visa',
    shortLabel: 'Holiday Tour',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Domestic & international holiday packages, hotels, and tourist visas.',
  },
  HAJJ_UMRAH: {
    key: 'HAJJ_UMRAH',
    label: 'Hajj & Umrah Packages',
    shortLabel: 'Hajj & Umrah',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Nusuk-verified Hajj & Umrah packages with walking-distance Haram hotels.',
  },
  WORK_PERMIT: {
    key: 'WORK_PERMIT',
    label: 'Work Permit & Job Visa',
    shortLabel: 'Work Permit',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Verified overseas employment permits, GAMCA medical & BMET processing.',
  },
  STUDENT_VISA: {
    key: 'STUDENT_VISA',
    label: 'Study Abroad & Student Visa',
    shortLabel: 'Student Visa',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'University admission, SOP/CAS support, and student visa counseling.',
  },
};

export interface BrandConfig {
  agencyName: string;
  shortName: string;
  tagline: string;
  legalName: string;
  establishedYear: number;
  /**
   * Toggle which service verticals this agency sells!
   * Simply remove or reorder categories when cloning for a niche agency.
   */
  enabledCategories: ServiceCategory[];
  logo: {
    primaryText: string;
    accentText: string;
    imageUrl?: string;
    faviconUrl: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    officeHours: string;
    googleMapsUrl?: string;
  };
  socials: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  defaults: {
    currency: string;
    currencySymbol: string;
    locale: string;
  };
  theme: {
    primaryHex: string;
    accentHex: string;
  };
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    description: string;
    keywords: string[];
  };
}

export const brandConfig: BrandConfig = {
  agencyName: 'TravelPilot Holidays',
  shortName: 'TravelPilot',
  tagline: 'Curated Journeys, Transparent Pricing, Memorable Experiences',
  legalName: 'TravelPilot Tours & Travels Ltd.',
  establishedYear: 2026,
  enabledCategories: ['TOUR', 'HAJJ_UMRAH', 'WORK_PERMIT', 'STUDENT_VISA'],
  logo: {
    primaryText: 'Travel',
    accentText: 'Pilot',
    imageUrl: undefined,
    faviconUrl: '/favicon.ico',
  },
  contact: {
    phone: '+880 1700-000000',
    whatsapp: '+8801700000000',
    email: 'operations@travelpilot.internal',
    address: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
    officeHours: 'Saturday – Thursday: 10:00 AM – 8:00 PM',
  },
  socials: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
  },
  defaults: {
    currency: 'BDT',
    currencySymbol: '৳',
    locale: 'en-BD',
  },
  theme: {
    primaryHex: '#0f172a', // Slate 900
    accentHex: '#0284c7',  // Sky 600
  },
  seo: {
    titleTemplate: '%s | TravelPilot Holidays',
    defaultTitle: 'TravelPilot Holidays — Tour Packages & Travel Operations',
    description:
      'Discover verified domestic and international tour packages with transparent inclusions and tailored travel planning.',
    keywords: [
      'Bangladesh travel agency',
      'tour packages Dhaka',
      'Coxs Bazar tour',
      'Sundarbans package',
      'international holiday packages',
    ],
  },
};
