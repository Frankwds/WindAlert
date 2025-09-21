'use client';

import React, { useEffect, useState } from 'react';
import { ForecastCacheService } from '@/lib/supabase/forecastCache';

export default function AboutPage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState('ukjent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastUpdated = async () => {
      try {
        const lastUpdatedHour = await ForecastCacheService.getOldestForecastData();
        if (lastUpdatedHour && lastUpdatedHour.updated_at) {
          const formattedDate = new Date(lastUpdatedHour.updated_at).toLocaleDateString('no-NO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
          setLastUpdatedDate(formattedDate);
        }
      } catch (error) {
        console.error('Failed to fetch last updated date:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastUpdated();
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Om WindLord</h1>
          <p>Laster...</p>
        </div>
      </div>
    );
  }

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
            Værmeldinger hentes løpende, den eldste værmeldingen i bruk nå, ble oppdatert {lastUpdatedDate}.
            <br />
            Værmeldingen på siden til hver enkelt start hentes på nytt hver gang du besøker den.
            <br /><br />
            Yr brukes så lenge de har time-for-time data tilgjengelig. Den settes da sammen med atmosfærisk værdata fra ECMWF.
            <br />
            Deretter brukes kun ECMWF for de resterende timene WindLord viser.
            <br /><br />
            Værstasjonene oppdateres live straks ny data kommer inn, uten at du trenger å laste siden på nytt.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            📍 Hvor skal jeg fly?
          </h2>
          <p className="text-base sm:text-lg">
            Gwaihir gjør det enklere å finne nye steder å fly, spesielt hvis du er i et område du ikke kjenner så godt til.
          </p>
          <br />
          <h4 className="text-xl font-bold mb-2 ">I hovedstarter kan du:</h4>
          <ul className="list-disc list-outside space-y-2 text-base sm:text-lg ml-4 pl-2">
            <li>Se bare starter med lovende vær ifølge Yr.no</li>
            <li>Se bare starter med valgt vindretning</li>

            <li>Bruke Skyways fra thermal.kk7 for å se hvor folk har flydd før.</li>
          </ul>
          <br />
          <p className="text-base sm:text-lg">
            Alle starter er en egen side i menyen, du kan ikke skjule starter som ikke har lovende vær, men alt annet er tilgjengelig.
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
}
