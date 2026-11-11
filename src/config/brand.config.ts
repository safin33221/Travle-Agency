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

export interface BrandConfig {
  agencyName: string;
  shortName: string;
  tagline: string;
  legalName: string;
  establishedYear: number;
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
