'use client';

import { GoogleMaps } from './components/GoogleMaps';
import { useFullscreen } from '@/lib/hooks/useFullscreen';

export default function Home() {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <main className="flex-1 w-full h-full ">
      <GoogleMaps variant="main" isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
    </main>
  );
}
