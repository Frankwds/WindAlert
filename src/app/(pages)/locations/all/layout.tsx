import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Alle paragliding-starter | WindLord',
  description:
    'Utforsk alle paragliding-starter i Norge i kartet. Finn steder, værdata og detaljer for hver start.',
  alternates: {
    canonical: '/locations/all',
  },
};

export default function AllLocationsLayout({ children }: { children: ReactNode }) {
  return children;
}
