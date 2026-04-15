import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BusData, USER_LOCATION } from "@/lib/busEngine";

// Fix leaflet default icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function createBusIcon(color: string) {
  return L.divIcon({
    className: "custom-bus-icon",
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4); font-size: 14px;
    ">🚌</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const userIcon = L.divIcon({
  className: "custom-user-icon",
  html: `<div style="
    width: 20px; height: 20px; border-radius: 50%;
    background: #3b82f6; border: 3px solid white;
    box-shadow: 0 0 12px rgba(59,130,246,0.6);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function AnimatedMarker({ bus }: { bus: BusData }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([bus.lat, bus.lng]);
    }
  }, [bus.lat, bus.lng]);

  return (
    <Marker
      ref={markerRef}
      position={[bus.lat, bus.lng]}
      icon={createBusIcon(bus.color)}
    >
      <Popup>
        <div className="text-center font-display">
          <strong>{bus.name}</strong><br />
          ETA: {Math.ceil(bus.eta)} min<br />
          Occupancy: {bus.occupancy}%
        </div>
      </Popup>
    </Marker>
  );
}

interface Props {
  buses: BusData[];
}

export default function BusMap({ buses }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-border h-[240px]">
      <MapContainer
        center={[USER_LOCATION.lat, USER_LOCATION.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={[USER_LOCATION.lat, USER_LOCATION.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
        {buses.map((bus) => (
          <AnimatedMarker key={bus.id} bus={bus} />
        ))}
      </MapContainer>
    </div>
  );
}
