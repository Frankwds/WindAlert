'use client';

import GoogleMapsAll from '@/app/components/GoogleMaps/GoogleMapsAll';
import { useFullscreen } from '@/lib/hooks/useFullscreen';

export default function AllStartsPage() {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <main className="flex-1 w-full h-full">
      <GoogleMapsAll isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
    </main>
  );
}
