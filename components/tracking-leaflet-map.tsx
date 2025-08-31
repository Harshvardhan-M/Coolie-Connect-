"use client"

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect } from "react"
import { useMap } from "react-leaflet"

type LatLng = { lat: number; lng: number }

function FitBoundsOnce({ bounds }: { bounds: LatLng[] | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      const b = L.latLngBounds(bounds.map((p) => L.latLng(p.lat, p.lng)))
      map.fitBounds(b, { padding: [32, 32] })
    }
    // run once on mount for provided bounds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function pinIcon(color: "red" | "blue" | "green") {
  const fill = color === "red" ? "#EF4444" : color === "blue" ? "#3B82F6" : "#10B981"
  const html = `
  <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 0C5.92 0 1 4.92 1 11c0 6.94 9.1 20.03 10.06 21.34a1 1 0 0 0 1.88 0C13.9 31.03 23 17.94 23 11 23 4.92 18.08 0 12 0z" fill="${fill}"/>
    <circle cx="12" cy="11" r="4.5" fill="white"/>
  </svg>`
  return L.divIcon({
    html,
    className: "",
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  })
}

export default function TrackingLeafletMap({
  pickup,
  dropoff,
  mover,
  bounds,
}: {
  pickup: LatLng | null
  dropoff: LatLng | null
  mover: LatLng | null
  bounds: LatLng[] | null
}) {
  const center = pickup ?? mover ?? dropoff ?? { lat: 28.6139, lng: 77.209 } // fallback: Delhi

  return (
    <div className="w-full h-[60vh] rounded-lg overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        className="w-full h-full z-0"
        attributionControl={true}
        zoomControl={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bounds ? <FitBoundsOnce bounds={bounds} /> : null}

        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pinIcon("red")} />}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={pinIcon("blue")} />}
        {mover && <Marker position={[mover.lat, mover.lng]} icon={pinIcon("green")} />}
        {pickup && mover && (
          <Polyline
            positions={[
              [mover.lat, mover.lng],
              [pickup.lat, pickup.lng],
            ]}
            color="#10B981"
            weight={4}
            opacity={0.7}
          />
        )}
        {pickup && dropoff && (
          <Polyline
            positions={[
              [pickup.lat, pickup.lng],
              [dropoff.lat, dropoff.lng],
            ]}
            color="#3B82F6"
            weight={3}
            opacity={0.5}
            dashArray="6 6"
          />
        )}
      </MapContainer>
    </div>
  )
}
