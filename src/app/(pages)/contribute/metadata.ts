import { Metadata } from 'next';

export const contributeMetadata: Metadata = {
  title: 'Legg til start - WindLord',
  description:
    'Legg til nye paragliding-starter fra flightlog.org til WindLord. Skriv inn flightlog ID for å synkronisere stedsinformasjon.',
  keywords: ['paragliding', 'starter', 'flightlog', 'vær', 'windlord'],
  openGraph: {
    title: 'Legg til start - WindLord',
    description: 'Legg til nye paragliding-starter fra flightlog.org til WindLord.',
    type: 'website',
  },
};

export const metadata = contributeMetadata;
