import type { Metadata } from 'next';
import { getCachedLocationByFlightlogId } from './locationPageCache';
import {
  buildLocationDescription,
  buildLocationKeywords,
  buildLocationOgAlt,
  buildLocationTitle,
} from './locationSeo';

export async function generateLocationMetadata(flightlogId: string): Promise<Metadata> {
  const location = await getCachedLocationByFlightlogId(flightlogId);

  if (!location) {
    return {
      title: 'Fant ikke sted – WindLord',
      description: 'Paragliding-starteren finnes ikke eller er ikke lenger aktiv.',
      robots: { index: false, follow: true },
    };
  }

  const title = buildLocationTitle(location, flightlogId);
  const description = buildLocationDescription(location, flightlogId);
  const keywords = buildLocationKeywords(location);
  const ogAlt = buildLocationOgAlt(location);
  const pageUrl = `https://windlord.no/locations/${flightlogId}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/locations/${flightlogId}`,
    },
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'no_NO',
      url: pageUrl,
      siteName: 'WindLord',
      images: [
        {
          url: '/windlord.png',
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/windlord.png'],
    },
  };
}
