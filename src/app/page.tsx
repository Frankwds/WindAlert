'use client';

import GoogleMaps from './components/GoogleMaps/GoogleMaps'
import { useFullscreen } from '@/lib/hooks/useFullscreen';

export default function Home() {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <main className="flex-1 w-full h-full ">
      <GoogleMaps isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} variant="main" />
    </main>
  );
}
