import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--accent)] mb-2">
            WindLord
          </h1>
          <p className="text-lg text-[var(--muted)]">
            Your paragliding weather companion.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            Project Goal
          </h2>
          <p className="text-base sm:text-lg">
            Windlord helps you find the best places to fly based on the weather forecast for each specific location. You can also easily see all flying sites that are suitable for selected wind directions.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            Main Features
          </h2>
          <ul className="list-disc list-inside space-y-2 text-base sm:text-lg">
            <li><strong>Google Maps:</strong> Map with weather stations and paragliding take-offs.</li>
            <li><strong>Promising...:</strong> Show only take-offs with a promising weather forecast for the selected time and day.</li>
            <li><strong>Wind Direction:</strong> Show only take-offs suitable for the selected wind direction.</li>
            <li><strong>Overview:</strong> Click on a take-off to get Yr and Windy on the same page.</li>
            <li><strong>Combined Weather Data:</strong> The service uses Yr.no's data for ground-level weather forecasts, combined with Open Meteo's atmospheric data.</li>
            <li><strong>Customizable:</strong> (Coming soon) Customize what you define as promising.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            Data Sources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg shadow-[var(--shadow-md)] bg-[var(--background)] border border-[var(--border)]">
              <h3 className="text-xl font-bold mb-2 text-[var(--accent)]">Weather APIs</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Open-Meteo API:</strong> Primary weather data source.</li>
                <li><strong>YR.no (Meteorologisk institutt):</strong> Secondary weather data.</li>
                <li><strong>Windy.com:</strong> Interactive weather visualization.</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg shadow-[var(--shadow-md)] bg-[var(--background)] border border-[var(--border)]">
              <h3 className="text-xl font-bold mb-2 text-[var(--accent)]">Location Data</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>FlightLog.org:</strong> Paragliding take-off sites.</li>
                <li><strong>Weather Stations (Holfuy.com):</strong> Ground-level weather observations.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold border-b-2 border-[var(--border)] pb-2 mb-4">
            Contribution
          </h2>
          <p className="text-base sm:text-lg">
            Found a bug or have a feature request? Feel free to open an issue or submit a pull request. We welcome all contributions!
          </p>
        </section>

        <footer className="text-center text-[var(--muted)] text-sm">
          <p>This project is licensed under the MIT License.</p>
          <p className="mt-4">
            <strong>Disclaimer:</strong> Weather conditions can change rapidly. This tool should be used as a supplement, not a substitute for proper weather assessment and pilot judgment.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;
