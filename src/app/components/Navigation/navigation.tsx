'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useGlideMeasurementMode } from '@/contexts/GlideMeasurementModeContext';
import HamburgerMenu from './HamburgerMenu';
import { getLuftromUrl, getThermalKk7Url, getWindyUrl } from './externalMapLinks';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Hovedstarter', description: ' - Med filter på vær' },
  { href: '/locations/all', label: 'Alle starter' },
  { href: '/favourites', label: 'Favoritter' },
  { href: '/about', label: 'Om' },
  { href: '/contact', label: 'Kontakt' },
  {
    href: 'https://www.windy.com',
    label: 'Windy',
    description: ' - Sjekk høydevind',
    external: true,
    resolveHref: getWindyUrl,
  },
  {
    href: 'https://luftrom.info/viewer',
    label: 'Luftrom.info',
    description: ' - Sjekk før du flyr!!',
    external: true,
    resolveHref: getLuftromUrl,
  },
  {
    href: 'https://thermal.kk7.ch',
    label: 'Thermal.kk7',
    description: ' - Takk! <3',
    external: true,
    resolveHref: getThermalKk7Url,
  },
  { href: '/contribute', label: 'Bidra! 💪', description: ' - Legg til ny start' },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const {
    disarmMeasurement,
    isMeasurementActive,
    isMeasurementArmed,
    requestMeasurementClear,
    toggleMeasurementArmed,
  } = useGlideMeasurementMode();
  const isMobile = useIsMobile();
  const [isFlying, setIsFlying] = useState(false);
  const isMapPage = pathname === '/' || pathname === '/locations/all';
  const isMeasurementToolSelected = isMeasurementArmed || isMeasurementActive;

  useEffect(() => {
    if (!isMapPage) {
      disarmMeasurement();
    }
  }, [disarmMeasurement, isMapPage]);

  return (
    <nav className='px-4 bg-[var(--nav-bg)] text-[var(--nav-text)] shadow-[var(--shadow-md)]'>
      <div className='flex items-center justify-between py-3 max-w-4xl mx-auto'>
        <div className='flex items-center'>
          <div
            className={`mr-6 flex items-center cursor-pointer group`}
            onClick={() => {
              setIsFlying(true);
              setTimeout(() => setIsFlying(false), 400);
              router.push('/');
            }}
          >
            <Image
              key={theme}
              src={theme === 'light' ? '/windlord-semi-dark.png' : '/windlord-dark.png'}
              alt='WindLord Logo'
              width={64}
              height={64}
              priority
              className={`transition-transform group-hover:scale-115 select-none ${isFlying ? 'animate-fly' : ''}`}
            />
            <h1 className='ml-3 text-2xl font-bold text-[var(--nav-text)] select-none'>WindLord</h1>
          </div>
        </div>
        <div className='flex items-center space-x-4'>
          <button
            onClick={toggleTheme}
            className={`cursor-pointer p-2 rounded-md transition-all duration-200 text-[var(--nav-text)]/80 ${!isMobile ? 'hover:bg-[var(--nav-text)]/10' : ''}`}
            aria-label={`Bytt til ${theme === 'light' ? 'dark' : 'light'} modus`}
          >
            {theme === 'light' ? (
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                />
              </svg>
            ) : (
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                />
              </svg>
            )}
          </button>
          {isMapPage && (
            <button
              aria-label={
                isMeasurementActive
                  ? 'Fjern aktiv måling'
                  : isMeasurementArmed
                    ? 'Avbryt måleverktøy'
                    : 'Aktiver måleverktøy'
              }
              aria-pressed={isMeasurementToolSelected}
              className={`cursor-pointer rounded-md p-2 transition-all duration-200 ${
                isMeasurementToolSelected
                  ? 'bg-[var(--nav-text)]/20 text-[var(--nav-text)]'
                  : `text-[var(--nav-text)]/80 ${!isMobile ? 'hover:bg-[var(--nav-text)]/10' : ''}`
              }`}
              title={
                isMeasurementActive
                  ? 'Fjern aktiv måling'
                  : isMeasurementArmed
                    ? 'Avbryt måleverktøy'
                    : 'Aktiver måleverktøy'
              }
              type='button'
              onClick={isMeasurementActive ? requestMeasurementClear : toggleMeasurementArmed}
            >
              <svg aria-hidden='true' className='size-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='m14 3 7 7L10 21l-7-7L14 3Z' />
                <path strokeLinecap='round' strokeWidth={2} d='m12 7 3 3m-6 0 3 3m-6 0 3 3' />
              </svg>
            </button>
          )}
          <HamburgerMenu links={links} />
        </div>
      </div>
    </nav>
  );
}
