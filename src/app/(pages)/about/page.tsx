import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            🦅 Gwaihir
          </h2>
          <p className="text-base sm:text-lg">
            WindLord (Gwaihir) gir en oversikt over alle starter som egner seg for været de neste par dagene.
            <br />
            Hver start har info fra flightlog, samt detaljert bakke -og atmosfærisk værmelding.
            <br /><br />
            Værmeldingen som brukes for å filtrere starter i kartet blir (for nå) hentet 07:00 og 12:00 hver dag,
            slik at &quot;lovende vær&quot; kan regnes ut på forhånd, for hvert sted.
            <br />
            Værmeldingen på hver enkelt side hentes på nytt hver gang du besøker siden.
            <br /><br />
            Yr brukes så lenge de har time-for-time værdata tilgjengelig. Den settes da sammen med atmosfærisk værdata fra ECMWF, som jeg mener skal være den beste..
            <br />
            Deretter brukes kun ECMWF for de resterende timene WindLord viser.
          </p>
        </section>



        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            📊 Datakilder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg shadow-[var(--shadow-md)] bg-[var(--background)] border border-[var(--border)]">
              <h3 className="text-xl font-bold mb-2 text-[var(--accent)]">Vær-APIer</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>YR.no (Meteorologisk institutt):</strong> Primær værdata for validering og sammenligning.</li>
                <li><strong>Open-Meteo API:</strong> Sekundær værdata-kilde for detaljerte atmosfæriske forhold.</li>
                <li><strong>Windy.com:</strong> Interaktiv kart som burde brukes for å se høydevind i større områder.</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg shadow-[var(--shadow-md)] bg-[var(--background)] border border-[var(--border)]">
              <h3 className="text-xl font-bold mb-2 text-[var(--accent)]">Lokasjonsdata</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>FlightLog.org:</strong> Paragliding-starter og stedsinformasjon. </li>
                <li><strong>Holfuy.com:</strong> Værstasjoner.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            🤝 Bidrag
          </h2>
          <p className="text-base sm:text-lg">
            Funnet en feil eller har en funksjonsforespørsel? Gjerne åpne en issue på <a href="https://github.com/Frankwds/WindAlert" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">GitHub</a>, kontakt meg via e-post eller send inn en pull request. Alle bidrag er velkommen!
          </p>
        </section>

        <footer className="text-center text-[var(--muted)] text-sm">
          <p>Dette prosjektet er lisensiert under MIT-lisensen.</p>
          <p className="mt-4">
            <strong>Merk:</strong> Værforhold kan endre seg raskt og dette verktøyet bør brukes som et supplement, ikke som erstatning for riktig vurdering av værforhold og pilotvurdering.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;
