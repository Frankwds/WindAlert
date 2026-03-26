import { generateLocationMetadata } from './metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getCachedLocationByFlightlogId } from './locationPageCache';
import { buildLocationJsonLd } from './locationSeo';

export const revalidate = 2592000;

export async function generateMetadata({ params }: { params: Promise<{ flightlog_id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return generateLocationMetadata(resolvedParams.flightlog_id);
}

export default async function LocationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ flightlog_id: string }>;
}) {
  const { flightlog_id } = await params;
  const location = await getCachedLocationByFlightlogId(flightlog_id);

  const jsonLd = location ? buildLocationJsonLd(location, flightlog_id) : null;

  return (
    <>
      {jsonLd ? (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {children}
    </>
  );
}
