import { useEffect } from "react";
import { Fragment } from "react";
import { MapContainer, TileLayer, Marker, Circle, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createPriceIcon } from "../../utils/mapPriceIcon";

const SOLO_CENTER = [-7.5755, 110.8243];

function FitBounds({ results }) {
  const map = useMap();
  useEffect(() => {
    const pts = results.filter((r) => r.latitude && r.longitude);
    if (!pts.length) return;
    if (pts.length === 1) {
      map.setView([pts[0].latitude, pts[0].longitude], 14, { animate: true });
      return;
    }
    map.fitBounds(
      L.latLngBounds(pts.map((r) => [r.latitude, r.longitude])),
      { padding: [56, 56], animate: true, maxZoom: 15 },
    );
  }, [results, map]);
  return null;
}

function PanToActive({ results, activePinId }) {
  const map = useMap();
  useEffect(() => {
    if (!activePinId) return;
    const item = results.find((r) => r.id === activePinId);
    if (item?.latitude && item?.longitude) {
      map.panTo([item.latitude, item.longitude], { animate: true, duration: 0.35 });
    }
  }, [activePinId, results, map]);
  return null;
}

export default function SearchSplitMap({
  results = [],
  activePinId = null,
  onPinClick,
  className = "",
}) {
  const withCoords = results.filter((r) => r.latitude && r.longitude);

  return (
    <div className={`search-split-map ${className}`.trim()} style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={SOLO_CENTER}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <ZoomControl position="topright" />
        <FitBounds results={withCoords} />
        <PanToActive results={withCoords} activePinId={activePinId} />
        {withCoords.map((item) => {
          const active = activePinId === item.id;
          return (
            <Fragment key={item.id}>
              <Circle
                center={[item.latitude, item.longitude]}
                radius={item.radiusM || 150}
                pathOptions={{
                  color: "#4F46E5",
                  fillColor: "#4F46E5",
                  fillOpacity: active ? 0.18 : 0.08,
                  weight: active ? 2 : 1,
                }}
              />
              <Marker
                position={[item.latitude, item.longitude]}
                icon={createPriceIcon(item.price, active, { pointer: false })}
                eventHandlers={{
                  click: () => onPinClick?.(item.id),
                }}
              />
            </Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
