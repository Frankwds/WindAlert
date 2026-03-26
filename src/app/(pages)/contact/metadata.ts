import type { Metadata } from 'next';

export const contactMetadata: Metadata = {
  title: 'Kontakt - WindLord',
  description:
    'Kontakt WindLord for forslag til forbedringer, feilrapportering eller andre henvendelser. Vi hjelper deg med å finne hvor du kan fly.',
  alternates: {
    canonical: '/contact',
  },
  keywords: 'kontakt, WindLord, paragliding, værmelding, support, feilrapport',
  openGraph: {
    title: 'Kontakt WindLord',
    description: 'Kontakt WindLord for forslag til forbedringer eller feilrapportering.',
    type: 'website',
    locale: 'no_NO',
  },
  twitter: {
    card: 'summary',
    title: 'Kontakt WindLord',
    description: 'Kontakt WindLord for forslag til forbedringer eller feilrapportering.',
  },
};
