import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";

function LocationMarker({ setLatLng, initialLatLng }) {
  const [position, setPosition] = useState(initialLatLng || null);

  useEffect(() => {
    if (initialLatLng) {
      setPosition(initialLatLng);
      setLatLng(initialLatLng);
    }
  }, [initialLatLng, setLatLng]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLatLng(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ setLatLng, initialLatLng = null }) {
  const center = initialLatLng
    ? [initialLatLng.lat, initialLatLng.lng]
    : [-7.5666, 110.8166];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "300px", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setLatLng={setLatLng} initialLatLng={initialLatLng} />
    </MapContainer>
  );
}