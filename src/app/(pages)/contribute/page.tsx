'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContributePage() {
  const [startId, setStartId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!startId.trim()) {
      setError('Vennligst skriv inn en flightlog ID');
      return;
    }

    if (!/^\d+$/.test(startId.trim())) {
      setError('Flightlog ID må være et tall (f.eks. 1347)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contribute/synchronize/${startId.trim()}`);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Kunne ikke synkronisere med Flightlog');
        return;
      }

      // Success - redirect to the location page
      router.push(`/locations/${startId.trim()}`);
    } catch (error) {
      console.error('Error syncing with Flightlog:', error);
      setError('Det skjedde en feil ved synkronisering med Flightlog. Prøv igjen senere.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-[var(--background)] text-[var(--foreground)] min-h-screen p-4 sm:p-6 md:p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl sm:text-4xl font-bold mb-6'>Legg til start</h1>

        <div className='bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-[var(--shadow-md)]'>
          <p className='text-base sm:text-lg mb-6'>Legg til en ny paragliding-start fra flightlog.org til WindLord. Skriv inn flightlog ID-en for stedet du vil legge til.</p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label htmlFor='startId' className='block text-sm font-medium mb-2'>
                Flightlog ID
              </label>
              <input
                type='text'
                id='startId'
                value={startId}
                onChange={e => setStartId(e.target.value)}
                placeholder='f.eks. 1347'
                disabled={isLoading}
                className='w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50'
              />
              <p className='text-sm text-[var(--muted)] mt-1'>Du finner flightlog ID-en i URL-en på flightlog.org siden for stedet</p>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[var(--accent)] text-white py-2 px-4 rounded-md hover:bg-[var(--accent)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                  Synkroniserer...
                </div>
              ) : (
                'Legg til start'
              )}
            </button>
          </form>

          {error && (
            <div className='mt-4 p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-md'>
              <p className='text-sm text-[var(--error)]'>{error}</p>
            </div>
          )}
        </div>

        <div className='mt-8 bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-[var(--shadow-md)]'>
          <h2 className='text-xl font-semibold mb-3'>Hvordan finner jeg flightlog ID?</h2>
          <ol className='list-decimal list-inside space-y-2 text-sm'>
            <li>Gå til flightlog.org og finn stedet du vil legge til</li>
            <li>Se på URL-en i nettleseren</li>
            <li>ID-en er tallet etter &quot;start_id=&quot; i URL-en</li>
            <li>F.eks. hvis URL-en er &quot;fl.html?l=2&a=22&country_id=160&start_id=1347&quot;, så er ID-en 1347</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
