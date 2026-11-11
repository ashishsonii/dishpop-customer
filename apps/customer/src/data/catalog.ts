// Catalog access. This is the ONLY place the three-layer availability rule
// lives: a customer sees an item only if (brand active in zone) AND
// (a zone offering exists) AND (offering.available). Swap the mock imports
// for API calls later; screens never change.
import type { Brand, BrandItem, Kitchen, Zone } from '../types/models'
import { brands, items, kitchens, offerings, zones } from './mock'

export interface MenuItemView {
  item: BrandItem
  price: number
  mrp: number
  available: boolean
  kitchenId: string
}

export function getZones(): Zone[] {
  return zones
}

// Brands that have at least one available offering in this zone.
export function brandsInZone(zoneId: string): Brand[] {
  const liveBrandIds = new Set(
    offerings
      .filter((o) => o.zoneId === zoneId)
      .map((o) => items.find((i) => i.id === o.itemId)?.brandId)
      .filter(Boolean) as string[],
  )
  return brands.filter((b) => liveBrandIds.has(b.id))
}

// Full menu for a brand in a zone, grouped by category. Unavailable items are
// included but flagged, so the UI can grey them out rather than hide silently.
export function menuForBrandInZone(
  brandId: string,
  zoneId: string,
): { category: string; items: MenuItemView[] }[] {
  const views: MenuItemView[] = items
    .filter((i) => i.brandId === brandId)
    .map((item) => {
      const o = offerings.find(
        (x) => x.itemId === item.id && x.zoneId === zoneId,
      )
      if (!o) return null
      return {
        item,
        price: o.price,
        mrp: o.mrp,
        available: o.available,
        kitchenId: o.kitchenId,
      }
    })
    .filter(Boolean) as MenuItemView[]

  const byCat = new Map<string, MenuItemView[]>()
  for (const v of views) {
    const list = byCat.get(v.item.category) ?? []
    list.push(v)
    byCat.set(v.item.category, list)
  }
  return [...byCat.entries()].map(([category, items]) => ({ category, items }))
}

// Every available dish in a zone, across all brands — for the curated home
// grid. With a small launch menu this shows the whole catalog at once.
export function dishesInZone(zoneId: string): (MenuItemView & { brand: Brand })[] {
  return offerings
    .filter((o) => o.zoneId === zoneId)
    .map((o) => {
      const item = items.find((i) => i.id === o.itemId)
      const brand = item && brands.find((b) => b.id === item.brandId)
      if (!item || !brand) return null
      return {
        item,
        price: o.price,
        mrp: o.mrp,
        available: o.available,
        kitchenId: o.kitchenId,
        brand,
      }
    })
    .filter(Boolean) as (MenuItemView & { brand: Brand })[]
}

export function getBrand(brandId: string): Brand | undefined {
  return brands.find((b) => b.id === brandId)
}

// Kitchen that makes this brand's food in this zone — for FSSAI disclosure.
export function kitchenForBrandInZone(
  brandId: string,
  zoneId: string,
): Kitchen | undefined {
  const o = offerings.find((x) => {
    const it = items.find((i) => i.id === x.itemId)
    return it?.brandId === brandId && x.zoneId === zoneId
  })
  return o ? kitchens.find((k) => k.id === o.kitchenId) : undefined
}
