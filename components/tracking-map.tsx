"use client"

import { useMemo } from "react"

type LatLng = { lat: number; lng: number }

export default function TrackingMap({
  center,
  pickup,
  dropoff,
  currentPos,
}: {
  center: [number, number]
  pickup: LatLng
  dropoff?: LatLng | null
  currentPos: LatLng
}) {
  // Calculate bounds to fit all points
  const bounds = useMemo(() => {
    const allPoints = [pickup, currentPos, ...(dropoff ? [dropoff] : [])]
    const lats = allPoints.map((p) => p.lat)
    const lngs = allPoints.map((p) => p.lng)

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Add padding
    const latPadding = (maxLat - minLat) * 0.3 || 0.01
    const lngPadding = (maxLng - minLng) * 0.3 || 0.01

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    }
  }, [pickup, dropoff, currentPos])

  const toPixel = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100
    return { x, y }
  }

  const pickupPixel = toPixel(pickup.lat, pickup.lng)
  const currentPixel = toPixel(currentPos.lat, currentPos.lng)
  const dropoffPixel = dropoff ? toPixel(dropoff.lat, dropoff.lng) : null

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Map background with grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundColor: "#f0f9ff",
        }}
      >
        {/* Route lines */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Line from coolie to pickup */}
          <line
            x1={`${currentPixel.x}%`}
            y1={`${currentPixel.y}%`}
            x2={`${pickupPixel.x}%`}
            y2={`${pickupPixel.y}%`}
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="8,4"
            className="animate-pulse"
          />

          {/* Line from pickup to dropoff (if exists) */}
          {dropoffPixel && (
            <line
              x1={`${pickupPixel.x}%`}
              y1={`${pickupPixel.y}%`}
              x2={`${dropoffPixel.x}%`}
              y2={`${dropoffPixel.y}%`}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          )}
        </svg>

        {/* Pickup marker */}
        <div
          className="absolute w-8 h-8 -ml-4 -mt-8 z-10"
          style={{
            left: `${pickupPixel.x}%`,
            top: `${pickupPixel.y}%`,
          }}
        >
          <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-medium">
            Pickup
          </div>
        </div>

        {/* Dropoff marker */}
        {dropoffPixel && (
          <div
            className="absolute w-8 h-8 -ml-4 -mt-8 z-10"
            style={{
              left: `${dropoffPixel.x}%`,
              top: `${dropoffPixel.y}%`,
            }}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-medium">
              Drop-off
            </div>
          </div>
        )}

        {/* Coolie marker with animation */}
        <div
          className="absolute w-12 h-12 -ml-6 -mt-12 z-20 transition-all duration-1000 ease-linear"
          style={{
            left: `${currentPixel.x}%`,
            top: `${currentPixel.y}%`,
          }}
        >
          {/* Pulsing background */}
          <div className="absolute inset-0 w-12 h-12 bg-green-500 rounded-full opacity-20 animate-ping"></div>

          {/* Main marker */}
          <div className="relative w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>

          {/* Label */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded font-medium whitespace-nowrap">
            Your Coolie
          </div>

          {/* Direction indicator (small arrow pointing toward pickup) */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-green-600"></div>
          </div>
        </div>
      </div>

      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Tracking</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border border-white"></div>
            <span className="font-medium">Your Coolie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border border-white"></div>
            <span>Pickup Location</span>
          </div>
          {dropoffPixel && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border border-white"></div>
              <span>Drop-off Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Distance indicator */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs text-center">
          <div className="font-medium text-green-600">En Route</div>
          <div className="text-gray-600 mt-1">Moving to pickup</div>
        </div>
      </div>
    </div>
  )
}
