import React from "react";
import Image from "next/image";
import ExternalLinkIcon from "./ExternalLinkIcon";

interface GoogleMapsProps {
  latitude: number;
  longitude: number;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ latitude, longitude }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <p>Google Maps API key is missing.</p>;
  }

  const mapSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=13&size=640x640&maptype=hybrid&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;

  // Google Maps URL with coordinates, zoom level 10, and satellite view
  const googleMapsUrl = `https://www.google.com/maps?ll=${latitude},${longitude}&t=k&z=12`;

  return (
    <div className="p-4">
      <div className="mb-4">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl font-bold mb-2 text-[var(--foreground)] hover:text-[var(--accent)] hover:underline transition-colors duration-200 cursor-pointer inline-flex items-center gap-2"
        >
          Location on Google Maps
          <ExternalLinkIcon size={24} className="inline-block" />
        </a>
      </div>
      <Image
        width={640}
        height={640}
        className="w-full h-auto max-w-[600px] rounded-lg shadow-[var(--shadow-lg)]"
        src={mapSrc}
        alt="Map showing location"
        unoptimized // Required for dynamic URLs
      />
    </div>
  );
};

export default GoogleMaps;
