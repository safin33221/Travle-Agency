import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/dashboard',
        '/login',
        '/office-portal',
        '/my-profile',
        '/api',
      ],
    },
  };
}
