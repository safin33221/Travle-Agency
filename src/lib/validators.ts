const banglaToEnglishDigits: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const englishToBanglaDigits: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export function cleanBdPhoneInput(input: string): string {
  if (!input) return '';

  let cleaned = input
    .split('')
    .map((char) => banglaToEnglishDigits[char] ?? char)
    .join('');

  cleaned = cleaned.replace(/\D/g, '');

  if (cleaned.startsWith('8801') && cleaned.length >= 13) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('88') && cleaned.length >= 13) {
    cleaned = cleaned.slice(2);
  }

  return cleaned.slice(0, 11);
}

export const normalizeBdPhone = cleanBdPhoneInput;

export function isValidBdPhone(phone: string): boolean {
  const cleaned = cleanBdPhoneInput(phone);
  return /^01[3-9]\d{8}$/.test(cleaned);
}

export function toBanglaNumber(value: number | string): string {
  const str = String(value);
  return str
    .split('')
    .map((char) => englishToBanglaDigits[char] ?? char)
    .join('');
}

export function formatTaka(
  amount: number | string,
  useBanglaDigits = false,
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(num);

  if (useBanglaDigits) {
    return `৳ ${toBanglaNumber(formatted)}`;
  }

  return `৳ ${formatted}`;
}
