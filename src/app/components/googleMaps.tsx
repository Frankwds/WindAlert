import React from 'react';

interface GoogleMapsProps {
  latitude: number;
  longitude: number;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ latitude, longitude }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <p>Google Maps API key is missing.</p>;
  }

  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${latitude},${longitude}&zoom=18&maptype=satellite`;

  return (
    <iframe
      width="450"
      height="210"
      style={{ border: 0 }}
      src={mapSrc}
      allowFullScreen
    ></iframe>
  );
};

export default GoogleMaps;
