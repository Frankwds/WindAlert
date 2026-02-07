import Image from 'next/image';
import { aboutMetadata } from './metadata';
import TinyWindCompass from '@/app/components/GoogleMaps/TinyWindCompass';

export const metadata = aboutMetadata;

// Eye icon from FilterControl
const EyeIcon = () => (
  <svg width='28' height='28' viewBox='0 0 100 100' fill='none' className='text-[var(--foreground)]'>
    <path
      d='M50 20C30 20 10 50 10 50C10 50 30 80 50 80C70 80 90 50 90 50C90 50 70 20 50 20ZM50 70C38.9543 70 30 61.0457 30 50C30 38.9543 38.9543 30 50 30C61.0457 30 70 38.9543 70 50C70 61.0457 61.0457 70 50 70Z'
      fill='currentColor'
    />
    <circle cx='50' cy='50' r='15' fill='currentColor' strokeWidth='20' />
    <circle cx='55' cy='47' r='6' fill='var(--background)' strokeWidth='20' />
  </svg>
);

// Filter icon
const FilterIcon = () => (
  <svg width='28' height='28' viewBox='0 0 24 24' fill='none' className='text-[var(--foreground)]'>
    <path
      d='M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V19l-4 2v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z'
      fill='currentColor'
    />
  </svg>
);

export default function AboutPage() {
  const linkStyle = 'text-[var(--accent)] hover:underline';

  const flightlogLink = (
    <a href='https://flightlog.org' target='_blank' rel='noopener noreferrer' className={linkStyle}>
      flightlog
    </a>
  );

  const yrLink = (
    <a href='https://yr.no' target='_blank' rel='noopener noreferrer' className={linkStyle}>
      yr
    </a>
  );

  const kk7Link = (
    <a href='https://thermal.kk7.ch' target='_blank' rel='noopener noreferrer' className={linkStyle}>
      kk7
    </a>
  );

  const githubLink = (
    <a href='https://github.com/Frankwds/WindAlert' target='_blank' rel='noopener noreferrer' className={linkStyle}>
      GitHub
    </a>
  );

  return (
    <div className='bg-[var(--background)] text-white min-h-screen p-4 sm:p-6 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Main Section - WindLord */}
        <section className='mb-14'>
          <h2 className='text-3xl sm:text-4xl font-bold border-b-2 border-[var(--border)] pb-3 mb-6'>
            🦅 WindLord (Gwaihir)
          </h2>
          <p className='text-lg sm:text-xl leading-relaxed'>
            Se alle paragliding starter fra {flightlogLink} med værmelding fra {yrLink} i kart med heatmap fra {kk7Link} og vindmålere.
          </p>
        </section>

        {/* Filtrer Section */}
        <section className='mb-10'>
          <h3 className='text-xl sm:text-2xl font-semibold border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-3'>
            <FilterIcon />
            Filtrer
          </h3>
          <div className='space-y-3 ml-1'>
            {/* Sun / Weather */}
            <div className='flex items-start gap-3'>
              <span className='text-xl flex-shrink-0'>☀️</span>
              <p className='text-sm sm:text-base'>
                Vis kun starter der yr melder riktig vindretning og mindre enn 12m/s vind.
              </p>
            </div>

            {/* Wind Compass */}
            <div className='flex items-start gap-3'>
              <div className='w-5 h-5 flex items-center justify-center flex-shrink-0'>
                <TinyWindCompass allowedDirections={['n', 'ne', 'nw']} />
              </div>
              <p className='text-sm sm:text-base'>
                Vis kun starter med valgte vindretninger.
              </p>
            </div>
          </div>
        </section>

        {/* Vis Section */}
        <section className='mb-10'>
          <h3 className='text-xl sm:text-2xl font-semibold border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-3'>
            <EyeIcon />
            Vis
          </h3>
          <div className='space-y-3 ml-1'>
            {/* Paragliding */}
            <div className='flex items-start gap-3'>
              <Image src='/paraglider.png' alt='Paragliding' width={20} height={20} className='w-5 h-5 mt-0.5 flex-shrink-0' />
              <p className='text-sm sm:text-base'>
                Paragliding-startplasser fra flightlog.org og værmelding fra yr.no.
              </p>
            </div>

            {/* Weather Stations */}
            <div className='flex items-start gap-3'>
              <svg width='20' height='20' viewBox='0 0 24 24' className='mt-0.5 flex-shrink-0'>
                <path
                  d='M12 2 L4 20 L11 16 L13 16 L20 20 L12 2 Z'
                  fill='var(--wind-moderate)'
                  stroke='black'
                  strokeWidth='0.8'
                  strokeLinecap='round'
                />
              </svg>
              <p className='text-sm sm:text-base'>
                Værstasjoner viser sanntids vind fra ulike kilder.
              </p>
            </div>

            {/* Landings */}
            <div className='flex items-start gap-3'>
              <svg width='20' height='20' viewBox='-8 -8 440 528' className='mt-0.5 flex-shrink-0'>
                <path
                  fill='green'
                  stroke='white'
                  strokeWidth='8'
                  d='M424.269,212.061c0,58.586-23.759,111.638-62.128,150.007L213.684,510.451L212.134,512L62.275,362.141c-7.231-7.157-13.872-14.905-19.996-23.095C15.716,303.703,0,259.726,0,212.061c0-51.06,18.077-97.914,48.182-134.512c8.78-10.773,18.668-20.586,29.366-29.367C114.147,18.077,161.074,0,212.134,0c40.655,0,78.582,11.437,110.826,31.211c28.555,17.487,52.609,41.541,70.097,70.097C412.831,133.552,424.269,171.478,424.269,212.061z'
                />
                <path
                  fill='white'
                  d='M339.392,212.081c0,70.284-56.968,127.258-127.259,127.258c-70.277,0-127.258-56.974-127.258-127.258S141.856,84.822,212.133,84.822C282.424,84.822,339.392,141.797,339.392,212.081z'
                />
                <text x='212' y='270' textAnchor='middle' fill='black' fontSize='200' fontWeight='bold' fontFamily='Arial, sans-serif'>
                  L
                </text>
              </svg>
              <p className='text-sm sm:text-base'>
                Landingsplasser registrert som velkomne bidrag fra ulike brukere i windlord.
              </p>
            </div>

            {/* Skyways / KK7 */}
            <div className='flex items-start gap-3'>
              <Image src='/thermalkk7.webp' alt='Skyways' width={20} height={20} className='w-5 h-5 mt-0.5 flex-shrink-0' />
              <p className='text-sm sm:text-base'>
                Heatmap (skyways) fra thermal.kk7.ch. Basert på data fra 3.4 millioner turer, alle over 10km!
              </p>
            </div>

            {/* Thermals */}
            <div className='flex items-start gap-3'>
              <Image src='/cumulonimbus.png' alt='Thermals' width={20} height={20} className='w-5 h-5 mt-0.5 flex-shrink-0' />
              <p className='text-sm sm:text-base'>
                Termikkprediksjon basert på samme datasett som Skyways.
              </p>
            </div>
          </div>
        </section>

        {/* Kontakt Section */}
        <section className='mb-10'>
          <h3 className='text-xl sm:text-2xl font-semibold border-b border-[var(--border)] pb-2 mb-4'>
            🤝 Kontakt
          </h3>
          <p className='text-sm sm:text-base'>
            Funnet en feil eller har en annen henvendelse? Ta kontakt via epost på frank.william.daniels [æ] gmail°com eller åpne en issue på {githubLink}.
          </p>
        </section>

        <footer className='text-center text-[var(--muted)] text-sm'>
          <p>Dette prosjektet er lisensiert under MIT-lisensen.</p>
          <p className='mt-4'>
            <strong>Merk:</strong> Værforhold kan endre seg raskt og dette verktøyet bør brukes som et supplement, ikke
            som erstatning for riktig vurdering av værforhold og pilotvurdering.
          </p>
        </footer>
      </div>
    </div>
  );
}
