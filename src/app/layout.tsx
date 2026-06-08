import React from 'react';
import { Analytics } from '@vercel/analytics/next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import ConditionalMain from './ConditionalMain';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/** JSON-LD must be a real script tag; `metadata.other['application/ld+json']` becomes a meta tag and crawlers ignore it as structured data. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://windlord.no/#organization',
      name: 'WindLord',
      url: 'https://windlord.no',
      logo: 'https://windlord.no/windlord.png',
      sameAs: ['https://github.com/Frankwds/WindAlert'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://windlord.no/#website',
      url: 'https://windlord.no',
      name: 'WindLord',
      description:
        'Den beste appen for å finne paragliding starter i Norge. Se hvor du kan fly basert på været.',
      publisher: { '@id': 'https://windlord.no/#organization' },
    },
    {
      '@type': 'WebApplication',
      name: 'WindLord',
      description:
        'Et gratis, åpen kildekode-kartverktøy for paraglidere. Finn og filtrer startsteder i Norge ved hjelp av sanntids værmeldinger og data fra vindstasjoner.',
      url: 'https://windlord.no',
      applicationCategory: 'SportsApplication',
      operatingSystem: 'Any (Web browser)',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      provider: { '@id': 'https://windlord.no/#organization' },
    },
  ],
} as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://windlord.no'),
  title: 'WindLord – Paragliding vær og starter i Norge',
  description:
    'Den beste appen for å finne paragliding-starter i Norge. Sanntids værmelding, vind og kart — se hvor du kan fly.',
  keywords:
    'paragliding, værmelding, Norge, flyvær, WindLord, Gwaihir, paragliding starter, vindmelding, værstasjoner, Finn hvor du kan fly, Paragliding starter, filtrer på vindretning, lovende vær, vindretning, værmelding, værstasjoner',
  authors: [{ name: 'Frank Daniels' }],
  creator: 'Frank Daniels',
  publisher: 'WindLord',
  openGraph: {
    type: 'website',
    locale: 'no_NO',
    url: 'https://windlord.no',
    siteName: 'WindLord',
    title: 'WindLord - Paragliding Vær App',
    description: 'Den beste appen for å finne paragliding starter i Norge. Se hvor du kan fly basert på været.',
    images: [
      {
        url: '/windlord.png',
        width: 1200,
        height: 630,
        alt: 'WindLord - Paragliding Vær App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@windlord',
    creator: '@windlord',
    title: 'WindLord - Paragliding Vær App',
    description: 'Den beste appen for paragliding værmelding i Norge.',
    images: ['/windlord.png'],
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='no' className='h-full'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-[var(--background)] text-[var(--foreground)]`}
      >
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <ThemeProvider>
            <ConditionalMain>{children}</ConditionalMain>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
