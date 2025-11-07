import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import type { Metadata } from 'next';

export async function generateLocationMetadata(flightlogId: string): Promise<Metadata> {
  const location = await ParaglidingLocationService.getByFlightlogId(flightlogId);

  if (!location) {
    return {
      title: 'Location Not Found - WindLord',
      description: 'The requested paragliding location could not be found.',
    };
  }

  const title = `${location.name} - Paragliding Vær | WindLord`;
  const description = location.description
    ? `${location.description.substring(0, 150)}...`
    : `Se værmelding og flyvær for ${location.name}. Oppdatert værmelding med vind, temperatur og atmosfæriske forhold.`;

  return {
    title,
    description,
    keywords: `paragliding, ${location.name}, værmelding, vind, flyvær, WindLord, Norge`,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'no_NO',
      url: `https://windlord.no/locations/${flightlogId}`,
      images: [
        {
          url: '/windlord.png',
          width: 1200,
          height: 630,
          alt: `WindLord - ${location.name} Paragliding Vær`,
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
