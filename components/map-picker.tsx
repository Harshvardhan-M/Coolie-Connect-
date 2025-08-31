"use client"

import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Polyline, Marker, useMap, useMapEvents } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import L from "leaflet"

type LatLng = { lat: number; lng: number }

function ClickHandler({
  setPickup,
  setDropoff,
  mode,
}: {
  setPickup: (p: LatLng) => void
  setDropoff: (p: LatLng) => void
  mode: "pickup" | "dropoff"
}) {
  useMapEvents({
    click(e) {
      const point = { lat: e.latlng.lat, lng: e.latlng.lng }
      if (mode === "pickup") setPickup(point)
      else setDropoff(point)
    },
  })
  return null
}

function FitToBounds({ pickup, dropoff }: { pickup: LatLng | null; dropoff: LatLng | null }) {
  const map = useMap()
  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds(L.latLng(pickup.lat, pickup.lng), L.latLng(dropoff.lat, dropoff.lng))
      map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 15 })
    } else if (pickup) {
      map.flyTo([pickup.lat, pickup.lng], Math.max(map.getZoom(), 15))
    } else if (dropoff) {
      map.flyTo([dropoff.lat, dropoff.lng], Math.max(map.getZoom(), 15))
    }
  }, [pickup, dropoff, map])
  return null
}

function createPin(color: string, label?: string) {
  const html = `
    <div class="pin" style="--pin-bg:${color}">
      ${label ? `<span class="pin-label">${label}</span>` : ""}
    </div>
  `
  return L.divIcon({
    html,
    className: "pin-wrapper",
    iconSize: [28, 38],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

export default function MapPicker({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
}: {
  pickup: LatLng | null
  dropoff: LatLng | null
  onPickupChange: (p: LatLng) => void
  onDropoffChange: (p: LatLng) => void
}) {
  const [mode, setMode] = useState<"pickup" | "dropoff">("pickup")

  const center = useMemo<LatLngExpression>(() => {
    if (pickup) return [pickup.lat, pickup.lng]
    if (dropoff) return [dropoff.lat, dropoff.lng]
    return [19.076, 72.8777] // Mumbai default
  }, [pickup, dropoff])

  const pickupIcon = useMemo(() => createPin("#ef4444", "P"), [])
  const dropoffIcon = useMemo(() => createPin("#2563eb", "D"), [])

  return (
    <div className="relative h-full w-full">
      <div className="absolute z-10 left-2 top-2 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("pickup")}
          className={`rounded-md px-3 py-1.5 text-sm ${mode === "pickup" ? "bg-primary text-white" : "bg-background text-foreground border"}`}
          aria-pressed={mode === "pickup"}
        >
          Set Pickup
        </button>
        <button
          type="button"
          onClick={() => setMode("dropoff")}
          className={`rounded-md px-3 py-1.5 text-sm ${mode === "dropoff" ? "bg-primary text-white" : "bg-background text-foreground border"}`}
          aria-pressed={mode === "dropoff"}
        >
          Set Drop-off
        </button>
      </div>

      <MapContainer center={center} zoom={12} className="z-0" style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToBounds pickup={pickup} dropoff={dropoff} />
        <ClickHandler setPickup={onPickupChange} setDropoff={onDropoffChange} mode={mode} />

        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} />}
        {pickup && dropoff && (
          <Polyline
            positions={[
              [pickup.lat, pickup.lng],
              [dropoff.lat, dropoff.lng],
            ]}
            color="#15803d"
          />
        )}
      </MapContainer>
    </div>
  )
}
