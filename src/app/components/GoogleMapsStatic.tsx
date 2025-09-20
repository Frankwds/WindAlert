import React from "react";
import Image from "next/image";

interface GoogleMapsProps {
  latitude: number;
  longitude: number;
  landing?: {
    lat: number;
    long: number;
  };
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ latitude, longitude, landing }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <p>Google Maps API key is missing.</p>;
  }

  // Build markers string - main location (red) + landing (green) if available
  let markers = `markers=color:red%7Clabel:S%7C${latitude},${longitude}`;
  if (landing) {
    markers += `&markers=color:green%7Clabel:L%7C${landing.lat},${landing.long}`;
  }

  const mapSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=13&size=640x640&maptype=hybrid&${markers}&key=${apiKey}`;
  const mapSrcTerrain = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=13&size=640x640&maptype=terrain&${markers}&key=${apiKey}`;
  // Google Maps URL with coordinates, zoom level 10, and satellite view
  const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}&z=12&t=k`;

  return (
    <div className="p-4 flex flex-col items-center">
      <h4 className="text-lg font-bold mb-2 text-[var(--foreground)]">Google Maps</h4>
      <div className="flex gap-4 flex-wrap justify-center">
        <Image
          width={640}
          height={640}
          className="w-full h-auto max-w-[400px] rounded-lg shadow-[var(--shadow-lg)]"
          src={mapSrc}
          alt="Map showing location"
          unoptimized // Required for dynamic URLs
          priority
        />
        <Image
          width={640}
          height={640}
          className="w-full h-auto max-w-[400px] rounded-lg shadow-[var(--shadow-lg)]"
          src={mapSrcTerrain}
          alt="Map showing location"
          unoptimized // Required for dynamic URLs
          priority
        />
      </div>
    </div>

  );
};

export default GoogleMaps;
