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

  const mapSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=13&size=450x210&maptype=hybrid&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;

  return (
    <Image
      width={450}
      height={210}
      style={{ border: 0 }}
      src={mapSrc}
      alt="Map showing location"
      unoptimized // Required for dynamic URLs
    />
  );
};

export default GoogleMaps;
