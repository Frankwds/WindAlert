import { MetadataRoute } from 'next';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';

// Cache sitemap for 24 hours using Next.js built-in caching
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://windlord.no';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/locations/all`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
  ];

  // Get all active locations for sitemap
  let locationPages: MetadataRoute.Sitemap = [];
  try {
    const locations = await ParaglidingLocationService.getAllActiveLocations();
    locationPages = locations.map(location => ({
      url: `${baseUrl}/locations/${location.flightlog_id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Error fetching locations for sitemap:', error);
    // Fallback to empty array if there's an error
    locationPages = [];
  }

  return [...staticPages, ...locationPages];
}
