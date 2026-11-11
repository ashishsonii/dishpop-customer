import * as Location from 'expo-location'
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Zone } from '@/types/models'
import { getZones } from '@/data/catalog'
import { resolveZoneByPoint } from '@/lib/zone'

type LocStatus = 'loading' | 'ready' | 'denied' | 'unserviceable'

// Reliable reverse geocode: OpenStreetMap first, on-device fallback, then
// coordinates. Returns a short "locality, city" label.
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { 'User-Agent': 'DishPop/0.1 (food delivery app)', Accept: 'application/json' } },
    )
    if (res.ok) {
      const a = (await res.json())?.address ?? {}
      const local = a.neighbourhood || a.suburb || a.village || a.town || a.city_district || a.hamlet
      const city = a.city || a.town || a.county || a.state_district
      const label = [local, city].filter(Boolean).slice(0, 2).join(', ')
      if (label) return label
    }
  } catch {
    // fall through to on-device
  }
  try {
    const [p] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
    if (p) {
      const label = [p.name ?? p.street, p.district ?? p.subregion ?? p.city]
        .filter(Boolean)
        .slice(0, 2)
        .join(', ')
      if (label) return label
    }
  } catch {
    // fall through to coordinates
  }
  return `Current location (${lat.toFixed(3)}, ${lng.toFixed(3)})`
}

interface ZoneState {
  zone: Zone | null
  setZone: (z: Zone) => void
  availableZones: Zone[]
  address: string | null // human-readable, from reverse geocode
  status: LocStatus
  refreshLocation: () => void
}

const Ctx = createContext<ZoneState | undefined>(undefined)

// Build a small geofence box (~1km) around a point, so a resolved GPS fix
// falls inside a served zone during this single-zone launch phase.
function boxAround(lng: number, lat: number): [number, number][] {
  const d = 0.009
  return [
    [lng - d, lat - d],
    [lng + d, lat - d],
    [lng + d, lat + d],
    [lng - d, lat + d],
    [lng - d, lat - d],
  ]
}

export function ZoneProvider({ children }: { children: React.ReactNode }) {
  const availableZones = getZones()
  const [zone, setZone] = useState<Zone | null>(availableZones[0] ?? null)
  const [address, setAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<LocStatus>('loading')

  async function locate() {
    setStatus('loading')
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync()
      if (perm !== 'granted') {
        setStatus('denied')
        return
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const { longitude, latitude } = pos.coords

      // Reverse geocode for a friendly label. Try an online geocoder first
      // (reliable), then fall back to the on-device one, then coordinates.
      setAddress(await reverseGeocode(latitude, longitude))

      // Resolve to a real serviceable zone; during single-zone launch, adopt
      // the launch zone and recentre it on the user so service works live.
      const matched = resolveZoneByPoint([longitude, latitude], availableZones)
      if (matched) {
        setZone(matched)
        setStatus('ready')
      } else if (availableZones[0]) {
        setZone({ ...availableZones[0], boundary: boxAround(longitude, latitude) })
        setStatus('ready')
      } else {
        setStatus('unserviceable')
      }
    } catch {
      // Any failure: keep the default zone so the app stays usable.
      setStatus(availableZones[0] ? 'ready' : 'unserviceable')
    }
  }

  useEffect(() => {
    locate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Ctx.Provider
      value={{ zone, setZone, availableZones, address, status, refreshLocation: locate }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useZone(): ZoneState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useZone must be used within ZoneProvider')
  return v
}
