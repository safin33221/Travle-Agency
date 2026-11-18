import { brandConfig } from '@/config/brand.config';
import { AgencySettings } from '@/types/api';

export interface LiveBrandInfo {
  agencyName: string;
  legalName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  officeHours: string;
  website?: string;
  logoUrl?: string;
  defaultCurrency: string;
  taxRate: number;
  quotationValidityDays: number;
  logoPrimary: string;
  logoAccent: string;
  initials: string;
}

const IGNORED_INITIAL_WORDS = new Set(['the', 'and', 'of', 'for', '&', 'a', 'an']);

function deriveLogoParts(agencyName: string): {
  logoPrimary: string;
  logoAccent: string;
  initials: string;
} {
  const clean = agencyName.trim();
  if (!clean) {
    return {
      logoPrimary: brandConfig.logo.primaryText,
      logoAccent: brandConfig.logo.accentText,
      initials: `${brandConfig.logo.primaryText.charAt(0)}${brandConfig.logo.accentText.charAt(0)}`.toUpperCase(),
    };
  }

  // Keep exact brand split if using the default agency name
  if (clean.toLowerCase().startsWith('travelpilot')) {
    const rest = clean.slice('travelpilot'.length).trim();
    return {
      logoPrimary: 'Travel',
      logoAccent: rest ? `Pilot ${rest}` : 'Pilot',
      initials: 'TP',
    };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  const meaningful = words.filter(
    (w) => !IGNORED_INITIAL_WORDS.has(w.toLowerCase()),
  );
  const initialSource = meaningful.length >= 2 ? meaningful : words;
  const initials =
    initialSource.length >= 2
      ? `${initialSource[0].charAt(0)}${initialSource[1].charAt(0)}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  if (words.length === 1) {
    return {
      logoPrimary: words[0],
      logoAccent: '',
      initials,
    };
  }

  const splitAt = Math.ceil(words.length / 2);
  return {
    logoPrimary: `${words.slice(0, splitAt).join(' ')} `,
    logoAccent: words.slice(splitAt).join(' '),
    initials,
  };
}

export function buildLiveBrandInfo(
  settings?: Partial<AgencySettings> | null,
): LiveBrandInfo {
  const agencyName = settings?.agencyName?.trim() || brandConfig.agencyName;
  const legalName =
    settings?.legalName?.trim() ||
    settings?.agencyName?.trim() ||
    brandConfig.legalName;
  const email = settings?.email?.trim() || brandConfig.contact.email;
  const phone = settings?.phone?.trim() || brandConfig.contact.phone;
  const whatsappDigits = phone.replace(/[^0-9]/g, '');
  const whatsapp =
    whatsappDigits.length >= 7
      ? `+${whatsappDigits}`
      : brandConfig.contact.whatsapp;
  const address = settings?.address?.trim() || brandConfig.contact.address;
  const defaultCurrency =
    settings?.defaultCurrency?.trim() || brandConfig.defaults.currency;

  const { logoPrimary, logoAccent, initials } = deriveLogoParts(agencyName);

  return {
    agencyName,
    legalName,
    email,
    phone,
    whatsapp,
    address,
    officeHours: brandConfig.contact.officeHours,
    website: settings?.website || undefined,
    logoUrl: settings?.logoUrl || brandConfig.logo.imageUrl,
    defaultCurrency,
    taxRate: Number(settings?.taxRate ?? 0),
    quotationValidityDays: Number(settings?.quotationValidityDays ?? 7),
    logoPrimary,
    logoAccent,
    initials,
  };
}

export const DEFAULT_LIVE_BRAND: LiveBrandInfo = buildLiveBrandInfo(null);
