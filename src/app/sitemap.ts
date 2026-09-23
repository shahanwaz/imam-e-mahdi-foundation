import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Core public static pages
  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/donate', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/programs', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/causes', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/projects', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/transparency', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/impact', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/vision-mission', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/leadership', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/governance', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/events', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/reports', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/stories', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/news', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/gallery', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/videos', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/volunteer', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/careers', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/faq', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/accessibility', priority: 0.5, changeFrequency: 'yearly' as const },
  ];

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
