import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/tack', '/b/'],
    },
    sitemap: 'https://smova.se/sitemap.xml',
  };
}
