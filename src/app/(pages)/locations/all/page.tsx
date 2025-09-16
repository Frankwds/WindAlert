'use client';

import { GoogleMaps } from '@/app/components/GoogleMaps';
import { useFullscreen } from '@/lib/hooks/useFullscreen';

export default function AllStartsPage() {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <main className="flex-1 w-full h-full">
      <GoogleMaps variant="all" isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
    </main>
  );
}
