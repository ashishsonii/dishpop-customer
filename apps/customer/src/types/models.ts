// DishPop core data model.
//
// Shaped around our business: customer-facing virtual BRANDS, prepared by
// partner KITCHENS, available per micro-ZONE. A customer only ever sees a
// brand/item if it is active in their zone AND a kitchen is mapped to make it.
//
// Money is stored as integer paise everywhere (never floats), to avoid
// rounding drift. ₹199.00 is 19900.

export type Paise = number

export type VegClass = 'veg' | 'non-veg' | 'egg'

// ---------------------------------------------------------------------------
// Zone: a micro delivery area, defined by a geofence polygon (pincodes are a
// fallback only). Everything the customer sees is filtered by their zone.
// ---------------------------------------------------------------------------
export interface Zone {
  id: string
  name: string
  // GeoJSON-style ring: [[lng, lat], ...]. First/last point should match.
  boundary: [number, number][]
  pincodes: string[] // fallback matching when GPS is unavailable
  deliveryFee: Paise
  packagingFee: Paise
  freeDeliveryThreshold: Paise | null // null = no free-delivery offer
  minOrderValue: Paise
  etaMinutes: number
  openHour: number // 0-23, local
  closeHour: number // 0-23, local; may be < openHour for late-night zones
  isPaused: boolean
}

// ---------------------------------------------------------------------------
// Brand: the identity the customer sees and orders from. Lives across zones.
// ---------------------------------------------------------------------------
export interface Brand {
  id: string
  name: string
  tagline: string
  cuisine: string
  logoColor: string // brand accent, used in UI
  bannerUrl: string
  logoUrl: string
  rating: number
}

// ---------------------------------------------------------------------------
// Master menu item: the recipe/identity, zone-independent. Price does NOT
// live here — price is per-zone (see ZoneOffering).
// ---------------------------------------------------------------------------
export interface BrandItem {
  id: string
  brandId: string
  name: string
  description: string
  imageUrl: string
  veg: VegClass
  category: string // e.g. "Thalis", "Rolls", "Beverages"
  prepMinutes: number
  tags: ItemTag[]
  addonGroups: AddonGroup[]
}

export type ItemTag = 'bestseller' | 'new' | 'spicy' | 'popular'

export interface AddonGroup {
  id: string
  name: string // "Choose your drink"
  min: number // required selections
  max: number // 1 = radio, >1 = checkboxes
  options: AddonOption[]
}

export interface AddonOption {
  id: string
  name: string
  price: Paise
}

// ---------------------------------------------------------------------------
// ZoneOffering: the join that makes a brand item buyable in a zone. Price,
// discount, and availability are all here, per-zone. No offering => not sold.
// ---------------------------------------------------------------------------
export interface ZoneOffering {
  zoneId: string
  itemId: string
  price: Paise
  mrp: Paise // strike-through; mrp === price means no discount shown
  available: boolean // live out-of-stock toggle (kitchen/admin)
  kitchenId: string // which partner makes it in this zone
}

// ---------------------------------------------------------------------------
// Kitchen: the partner that actually cooks. Its real identity must be
// disclosed to the customer (FSSAI etc.) even though the brand leads.
// ---------------------------------------------------------------------------
export interface Kitchen {
  id: string
  legalName: string
  fssaiLicenseNo: string
  district: string // address shown to customer: district only
  zoneIds: string[]
}

// ---------------------------------------------------------------------------
// Cart: lives on the client. A line captures the chosen item + addons at the
// price seen, so later price edits never change an in-progress cart.
// ---------------------------------------------------------------------------
export interface CartLine {
  lineId: string // unique per configured line (item + addon combo)
  itemId: string
  brandId: string
  name: string
  veg: VegClass
  unitPrice: Paise // base item price in this zone at add time
  mrp?: Paise // strike-through price, for showing savings
  addons: { optionId: string; name: string; price: Paise }[]
  qty: number
}

export interface CartTotals {
  itemTotal: Paise
  mrpTotal: Paise // sum of MRPs — itemTotal gives the item-level discount
  packagingFee: Paise // charged (0 when waived)
  packagingFeeBase: Paise // original, for strike-through display
  deliveryFee: Paise // charged (0 when waived)
  deliveryFeeBase: Paise // original, for strike-through display
  feesWaived: boolean
  discount: Paise // coupon
  credits: Paise // wallet credits applied
  tip: Paise
  tax: Paise
  savings: Paise // total saved vs. MRP + coupon + waived fees
  payable: Paise
}
