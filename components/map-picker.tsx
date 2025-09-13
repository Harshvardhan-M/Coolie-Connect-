"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

type LatLng = { lat: number; lng: number }

// Simple map component using OpenStreetMap tiles
function InteractiveMap({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
  mode,
}: {
  pickup: LatLng | null
  dropoff: LatLng | null
  onPickupChange: (p: LatLng) => void
  onDropoffChange: (p: LatLng) => void
  mode: "pickup" | "dropoff"
}) {
  const [center, setCenter] = useState<LatLng>({ lat: 19.076, lng: 72.8777 }) // Mumbai Central
  const [zoom, setZoom] = useState(12)

  // Update center when pickup or dropoff is set
  useEffect(() => {
    if (mode === "pickup" && pickup) {
      setCenter(pickup)
      setZoom(15)
    } else if (mode === "dropoff" && dropoff) {
      setCenter(dropoff)
      setZoom(15)
    }
  }, [pickup, dropoff, mode])

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to lat/lng (simplified calculation)
    const mapWidth = rect.width
    const mapHeight = rect.height

    // Calculate lat/lng based on current center and zoom
    const latRange = 360 / Math.pow(2, zoom)
    const lngRange = 360 / Math.pow(2, zoom)

    const lat = center.lat + (0.5 - y / mapHeight) * latRange
    const lng = center.lng + (x / mapWidth - 0.5) * lngRange

    const newPoint = { lat, lng }

    if (mode === "pickup") {
      onPickupChange(newPoint)
    } else {
      onDropoffChange(newPoint)
    }
  }

  return (
    <div className="relative h-full w-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Map background with grid pattern */}
      <div
        className="absolute inset-0 cursor-crosshair"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundColor: "#f0f9ff",
        }}
        onClick={handleMapClick}
      >
        {/* Pickup marker */}
        {pickup && (
          <div
            className="absolute w-6 h-6 -ml-3 -mt-6 z-10"
            style={{
              left: `${50 + ((pickup.lng - center.lng) / (360 / Math.pow(2, zoom))) * 100}%`,
              top: `${50 - ((pickup.lat - center.lat) / (360 / Math.pow(2, zoom))) * 100}%`,
            }}
          >
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Pickup
            </div>
          </div>
        )}

        {/* Dropoff marker */}
        {dropoff && (
          <div
            className="absolute w-6 h-6 -ml-3 -mt-6 z-10"
            style={{
              left: `${50 + ((dropoff.lng - center.lng) / (360 / Math.pow(2, zoom))) * 100}%`,
              top: `${50 - ((dropoff.lat - center.lat) / (360 / Math.pow(2, zoom))) * 100}%`,
            }}
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Drop-off
            </div>
          </div>
        )}

        {/* Route line */}
        {pickup && dropoff && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={`${50 + ((pickup.lng - center.lng) / (360 / Math.pow(2, zoom))) * 100}%`}
              y1={`${50 - ((pickup.lat - center.lat) / (360 / Math.pow(2, zoom))) * 100}%`}
              x2={`${50 + ((dropoff.lng - center.lng) / (360 / Math.pow(2, zoom))) * 100}%`}
              y2={`${50 - ((dropoff.lat - center.lat) / (360 / Math.pow(2, zoom))) * 100}%`}
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="5,5"
              opacity="0.7"
            />
          </svg>
        )}

        {/* Center crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-4 border-2 border-gray-400 rounded-full bg-white/80"></div>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-8 h-8 p-0"
          onClick={() => setZoom(Math.min(18, zoom + 1))}
        >
          +
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-8 h-8 p-0"
          onClick={() => setZoom(Math.max(8, zoom - 1))}
        >
          -
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm">
        <p className="font-medium text-gray-900">
          {mode === "pickup" ? "Click to set pickup location" : "Click to set drop-off location"}
        </p>
        <p className="text-gray-600 text-xs mt-1">Use zoom controls to get precise location</p>
      </div>
    </div>
  )
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

  const handleQuickLocation = (lat: number, lng: number) => {
    const point = { lat, lng }
    if (mode === "pickup") {
      onPickupChange(point)
    } else {
      onDropoffChange(point)
    }
  }

  return (
    <div className="relative h-full w-full">
      {/* Mode selector */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("pickup")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mode === "pickup" ? "bg-red-500 text-white shadow-lg" : "bg-white/90 text-gray-700 border border-gray-200"
          }`}
        >
          Set Pickup
        </button>
        <button
          type="button"
          onClick={() => setMode("dropoff")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mode === "dropoff" ? "bg-blue-500 text-white shadow-lg" : "bg-white/90 text-gray-700 border border-gray-200"
          }`}
        >
          Set Drop-off
        </button>
      </div>

      {/* Quick locations */}
      <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-3">
        <h3 className="font-medium text-sm mb-2">Quick Locations</h3>
        <div className="grid grid-cols-1 gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-7 bg-transparent"
            onClick={() => handleQuickLocation(19.076, 72.8777)}
          >
            Mumbai Central
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-7 bg-transparent"
            onClick={() => handleQuickLocation(28.6139, 77.209)}
          >
            Delhi Station
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-7 bg-transparent"
            onClick={() => handleQuickLocation(13.0827, 80.2707)}
          >
            Chennai Central
          </Button>
        </div>
      </div>

      {/* Interactive map */}
      <InteractiveMap
        pickup={pickup}
        dropoff={dropoff}
        onPickupChange={onPickupChange}
        onDropoffChange={onDropoffChange}
        mode={mode}
      />

      {/* Location display */}
      {(pickup || dropoff) && (
        <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
          {pickup && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">
                Pickup: {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
              </span>
            </div>
          )}
          {dropoff && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">
                Drop-off: {dropoff.lat.toFixed(4)}, {dropoff.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
