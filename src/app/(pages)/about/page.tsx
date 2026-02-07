import { aboutMetadata } from './metadata';

export const metadata = aboutMetadata;

export default function AboutPage() {
  return (
    <div className='bg-[var(--background)] text-[var(--foreground)] min-h-screen p-4 sm:p-6 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <section className='mb-12'>
          <h2 className='text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4'>🦅 WindLord (Gwaihir)</h2>
          <p className='text-base sm:text-lg'>
            
          </p>
        </section>




        <section className='mb-12'>
          <h2 className='text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4'>🤝 Bidrag</h2>
          <p className='text-base sm:text-lg'>
            Funnet en feil eller har en funksjonsforespørsel? Gjerne åpne en issue på{' '}
            <a
              href='https://github.com/Frankwds/WindAlert'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--accent)] hover:underline'
            >
              GitHub
            </a>
            , kontakt meg via e-post (frank.william.daniels@gmail.com) eller send inn en pull request. Alle bidrag er velkommen!
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
