"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface CreditMapProps {
  position: [number, number]
  onMarkerDrag: (lat: number, lng: number) => void
}

export interface CreditMapRef {
  flyTo: (lat: number, lng: number) => void
}

export const CreditMap = forwardRef<CreditMapRef, CreditMapProps>(
  ({ position, onMarkerDrag }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null)

    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number) => {
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 14, { duration: 1 })
        }
      },
    }))

    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return

      // --- 1. RESTORED: Custom Nature Marker Icon ---
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #2d5a27, #4a8c3f);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(45, 90, 39, 0.4);
          ">
            <div style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              transform: rotate(45deg);
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      // Initialize map
      mapRef.current = L.map(mapContainerRef.current, {
        center: position,
        zoom: 10,
        zoomControl: false, // We add this manually below for styling
      })

      // Add OpenStreetMap tiles
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(mapRef.current)

      // Add zoom control to bottom right
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(mapRef.current)

      // Add draggable marker with CUSTOM ICON
      markerRef.current = L.marker(position, {
        draggable: true,
        icon: customIcon,
      }).addTo(mapRef.current)

      // Handle marker drag
      markerRef.current.on("dragend", () => {
        const newPos = markerRef.current?.getLatLng()
        if (newPos) {
          onMarkerDrag(newPos.lat, newPos.lng)
        }
      })

      // --- 2. RESTORED: Custom CSS for Map Controls ---
      const style = document.createElement("style")
      style.textContent = `
        .leaflet-control-zoom a {
          background: #ffffff !important;
          color: #2d3a2e !important;
          border: 1px solid #e5e2dc !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f5f1eb !important;
        }
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.9) !important;
          color: #6b7c6c !important;
        }
        .leaflet-control-attribution a {
          color: #2d5a27 !important;
        }
      `
      document.head.appendChild(style)

      return () => {
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
        document.head.removeChild(style)
      }
    }, [])

    // Update marker position when prop changes
    useEffect(() => {
      if (markerRef.current) {
        markerRef.current.setLatLng(position)
      }
    }, [position])

    return (
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-2xl"
        style={{ background: "#f0efe9" }}
      />
    )
  }
)

CreditMap.displayName = "CreditMap"