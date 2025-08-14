import React from "react";
import Image from "next/image";

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

  return (
    <div className="p-4">
      <Image
        width={640}
        height={640}
        className="w-full h-auto max-w-[600px]  rounded-lg shadow-lg"
        src={mapSrc}
        alt="Map showing location"
        unoptimized // Required for dynamic URLs
      />
    </div>
  );
};

export default GoogleMaps;
