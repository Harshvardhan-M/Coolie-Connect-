"use client"

import { useMemo, useEffect } from "react"
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import L from "leaflet"

type LatLng = { lat: number; lng: number }

function InvalidateSizeOnce() {
  const map = useMap()
  useEffect(() => {
    // Delay to ensure container has final layout before measuring
    const id = setTimeout(() => {
      try {
        map.invalidateSize()
      } catch {}
    }, 0)
    return () => clearTimeout(id)
  }, [map])
  return null
}

export default function TrackingMap({
  center,
  pickup,
  dropoff,
  currentPos,
}: {
  center: LatLngExpression
  pickup: LatLng
  dropoff?: LatLng | null
  currentPos: LatLng
}) {
  const moverIcon = useMemo(
    () =>
      L.divIcon({
        className: "pin-wrapper",
        iconSize: [28, 38],
        iconAnchor: [14, 36],
        html: `<div class="pin" style="--pin-bg:#16a34a"><span class="pin-label">C</span></div>`,
      }),
    [],
  )
  const pickupIcon = useMemo(
    () =>
      L.divIcon({
        className: "pin-wrapper",
        iconSize: [28, 38],
        iconAnchor: [14, 36],
        html: `<div class="pin" style="--pin-bg:#ef4444"><span class="pin-label">P</span></div>`,
      }),
    [],
  )
  const dropoffIcon = useMemo(
    () =>
      L.divIcon({
        className: "pin-wrapper",
        iconSize: [28, 38],
        iconAnchor: [14, 36],
        html: `<div class="pin" style="--pin-bg:#2563eb"><span class="pin-label">D</span></div>`,
      }),
    [],
  )

  return (
    <MapContainer
      center={center}
      zoom={15}
      className="z-0"
      style={{ height: "100%", minHeight: "420px", width: "100%" }}
    >
      <InvalidateSizeOnce />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
      {dropoff ? <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} /> : null}
      <Polyline
        positions={[
          [currentPos.lat, currentPos.lng],
          [pickup.lat, pickup.lng],
        ]}
        color="#15803d"
      />
      <Marker position={[currentPos.lat, currentPos.lng]} icon={moverIcon} />
    </MapContainer>
  )
}
