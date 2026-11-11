import type { Zone } from '../types/models'

// Point-in-polygon (ray casting). pt = [lng, lat].
export function pointInZone(pt: [number, number], zone: Zone): boolean {
  const [x, y] = pt
  const ring = zone.boundary
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

// Resolve a GPS point to a serviceable zone, else null.
export function resolveZoneByPoint(
  pt: [number, number],
  zones: Zone[],
): Zone | null {
  return zones.find((z) => pointInZone(pt, z)) ?? null
}

// Fallback: resolve by pincode when GPS is denied.
export function resolveZoneByPincode(pin: string, zones: Zone[]): Zone | null {
  return zones.find((z) => z.pincodes.includes(pin)) ?? null
}

// Is the zone currently taking orders? Handles late-night wrap (e.g. open 11,
// close 2 means 11:00 today to 02:00 next day).
export function isZoneOpen(zone: Zone, now = new Date()): boolean {
  if (zone.isPaused) return false
  const h = now.getHours()
  const { openHour: o, closeHour: c } = zone
  return o <= c ? h >= o && h < c : h >= o || h < c
}
