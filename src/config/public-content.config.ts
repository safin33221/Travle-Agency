import { brandConfig } from './brand.config';

export const publicContentConfig = {
  hero: {
    badge: `Trusted Travel Partner • ${brandConfig.agencyName}`,
    title: 'Explore the World with Verified Tour Packages & Personal Care',
    subtitle:
      'Whether you are planning a family holiday to Cox’s Bazar, a tea-garden retreat in Sylhet, or an international getaway, our travel specialists craft transparent quotations tailored to your budget.',
    primaryCta: {
      label: 'Browse Tour Packages',
      href: '/packages',
    },
    secondaryCta: {
      label: 'Request Custom Quote',
      href: '/contact',
    },
  },
  stats: [
    { label: 'Verified Tour Packages', value: '50+' },
    { label: 'Happy Travelers Guided', value: '4,800+' },
    { label: 'Transparent Pricing', value: '100%' },
    { label: 'Dedicated Travel Support', value: '24/7' },
  ],
  features: [
    {
      title: '100% Transparent Quotations',
      description:
        'Every quotation clearly lists inclusions, exclusions, validity dates, and itemized pricing with zero hidden charges.',
    },
    {
      title: 'Tailored Group & Family Itineraries',
      description:
        'Flexible travel dates and customized hotel/transport arrangements designed around your family or corporate group.',
    },
    {
      title: 'Fast Bangla & English Consultation',
      description:
        'Get rapid, accurate responses and official branded PDF quotations directly from our travel specialists.',
    },
  ],
};
