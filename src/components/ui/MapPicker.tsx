'use client'

import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from './badge'
import { MapPin, CheckCircle2 } from 'lucide-react'

// Fix pour les icônes par défaut de Leaflet avec Next.js
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as any)._getIconUrl
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

interface MapPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationChange: (latitude: number, longitude: number) => void
  center?: [number, number]
  zoom?: number
  height?: string
  active?: boolean
}

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationChange(lat, lng)
    },
  })
  return null
}

export function MapPicker({
  latitude,
  longitude,
  onLocationChange,
  center = [48.8566, 2.3522], // Paris par défaut (peut être changé selon votre région)
  zoom = 13,
  height = '400px',
  active = true,
}: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [mapInstanceKey] = useState(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as Crypto).randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!isMounted) return
    const el = containerRef.current?.querySelector('.leaflet-container') as any
    if (el && el._leaflet_id) {
      delete el._leaflet_id
    }
  }, [isMounted])

  useEffect(() => {
    if (!active) return
    const id = window.setTimeout(() => {
      mapRef.current?.invalidateSize()
    }, 0)
    return () => window.clearTimeout(id)
  }, [active])

  useEffect(() => {
    const wrapperEl = containerRef.current
    return () => {
      const map = mapRef.current
      const mapContainer = map?.getContainer?.() as any
      if (mapContainer && mapContainer._leaflet_id) {
        delete mapContainer._leaflet_id
      }
      if (map) {
        try {
          map.off()
          map.remove()
        } finally {
          mapRef.current = null
        }
      }
      const el = wrapperEl?.querySelector('.leaflet-container') as any
      if (el && el._leaflet_id) {
        delete el._leaflet_id
      }

      if (wrapperEl) {
        wrapperEl.innerHTML = ''
      }
    }
  }, [])

  // Position du marqueur
  const markerPosition: [number, number] | null = 
    latitude !== null && longitude !== null ? [latitude, longitude] : null

  // Centre de la carte (utilise la position du marqueur si disponible, sinon le centre par défaut)
  const mapCenter: [number, number] = markerPosition || center

  // Ne rien rendre côté serveur pour éviter l'erreur d'hydratation
  if (!isMounted) {
    return (
      <div 
        className="w-full rounded-lg border border-border/50 bg-secondary/20 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Message d'aide et badge de statut */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Cliquez sur la carte pour définir l'emplacement du travail
        </p>
        {markerPosition && (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Emplacement défini
          </Badge>
        )}
      </div>

      {/* Carte Leaflet */}
      <div 
        ref={containerRef}
        className="w-full rounded-lg border border-border/50 overflow-hidden shadow-sm"
      >
        {isMounted && (
          <div key={mapInstanceKey} style={{ height, width: '100%' }}>
            <MapContainer
              key={mapInstanceKey}
              ref={mapRef}
              center={mapCenter}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markerPosition && (
                <Marker
                  position={markerPosition}
                  icon={new Icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })}
                />
              )}
              <MapClickHandler onLocationChange={onLocationChange} />
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  )
}
