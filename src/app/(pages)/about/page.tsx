import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            🎯 Formål
          </h2>
          <p className="text-base sm:text-lg">
            Målet er et verktøy for å vurdere forhold uten å måtte åpne flere faner med yr, windy og mer.
            <br />
            I tillegg til å gjøre det enkelt å finne steder med lovende værforhold.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            ✨ Hovedfunksjoner
          </h2>
          <ul className="list-disc list-inside space-y-2 text-base sm:text-lg">
            <li><strong>Google Maps:</strong> Kart med værstasjoner og paragliding starter.</li>
            <li><strong>Lovende værmelding:</strong> Vis bare starter med lovende værmelding for valgt tid og dag.</li>
            <li><strong>Vindretning:</strong> Vis bare starter egnet for valgt vindretning.</li>
            <li><strong>Oversikt:</strong> Trykk på en start og få opp beskrivelse, yr, windy på samme side.</li>
            <li><strong>Kombinert værdata:</strong> Tjenesten bruker Yr.no sin data for værmelding på bakken, kombinert med open meteo sin atmosfæriske data.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            📊 Datakilder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg shadow-[var(--shadow-md)] bg-[var(--background)] border border-[var(--border)]">
              <h3 className="text-xl font-bold mb-2 text-[var(--accent)]">Vær-APIer</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Open-Meteo API:</strong> Primær værdata-kilde for detaljerte atmosfæriske forhold.</li>
                <li><strong>YR.no (Meteorologisk institutt):</strong> Sekundær værdata for validering og sammenligning.</li>
                <li><strong>Windy.com:</strong> Interaktiv værvisualisering med flere værmodeller.</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg shadow-[var(--shadow-md)] bg-[var(--background)] border border-[var(--border)]">
              <h3 className="text-xl font-bold mb-2 text-[var(--accent)]">Lokasjonsdata</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Paragliding starter (FlightLog.org):</strong> Paragliding-avgangssteder og stedsinformasjon.</li>
                <li><strong>Værstasjoner (Holfuy.com):</strong> Bakkenivå værobservasjoner.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            🤝 Bidrag
          </h2>
          <p className="text-base sm:text-lg">
            Funnet en feil eller har en funksjonsforespørsel? Gjerne åpne en issue på github, kontakt meg via e-post eller send inn en pull request. Alle bidrag er velkommen!
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
