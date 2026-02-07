import { aboutMetadata } from './metadata';

export const metadata = aboutMetadata;

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
    <div className='bg-[var(--background)] text-[var(--foreground)] min-h-screen p-4 sm:p-6 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <section className='mb-12'>
          <h2 className='text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4'>
            🦅 WindLord (Gwaihir)
          </h2>
          <p className='text-base sm:text-lg'>
            Se alle paragliding starter fra {flightlogLink} rett i kartet, med værmelding fra {yrLink} og heatmap
            fra {kk7Link}.
          </p>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4'>
            🤝 Kontakt
          </h2>
          <p className='text-base sm:text-lg'>
            Funnet en feil eller har en savner en vindmåler? Gjerne åpne en issue på {githubLink}, eller kontakt meg
            via e-post på Frank.William.Daniels [æ] gmail°com.
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
