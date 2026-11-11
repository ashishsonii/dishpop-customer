// Mock data for one launch zone, two virtual brands sharing one kitchen.
// Stands in for the backend until the API is wired. Prices in paise.
import type {
  Brand,
  BrandItem,
  Kitchen,
  Zone,
  ZoneOffering,
} from '../types/models'

export const zones: Zone[] = [
  {
    id: 'z-koramangala',
    name: 'Koramangala 4th Block',
    // Rough square around Koramangala, Bengaluru. [lng, lat].
    boundary: [
      [77.615, 12.927],
      [77.635, 12.927],
      [77.635, 12.945],
      [77.615, 12.945],
      [77.615, 12.927],
    ],
    pincodes: ['560034', '560095'],
    deliveryFee: 2900,
    packagingFee: 1500,
    freeDeliveryThreshold: 29900,
    minOrderValue: 9900,
    etaMinutes: 32,
    // Launch zone runs all day for now; real hours come from the admin panel.
    openHour: 0,
    closeHour: 24,
    isPaused: false,
  },
]

export const kitchens: Kitchen[] = [
  {
    id: 'k-spicehub',
    legalName: 'Spice Hub Foods Pvt Ltd',
    fssaiLicenseNo: '11223344556677',
    district: 'Koramangala, Bengaluru',
    zoneIds: ['z-koramangala'],
  },
]

export const brands: Brand[] = [
  {
    id: 'b-box30',
    name: 'Box 30',
    tagline: 'Hearty Indian meals in 30',
    cuisine: 'North Indian • Thalis • Rice Bowls',
    logoColor: '#E8552A',
    bannerUrl: 'https://picsum.photos/seed/box30banner/800/400',
    logoUrl: 'https://picsum.photos/seed/box30logo/200/200',
    rating: 4.3,
  },
  {
    id: 'b-mojopop',
    name: 'Mojo Pop',
    tagline: 'Snacks, burgers & late-night bites',
    cuisine: 'Burgers • Fries • Beverages',
    logoColor: '#2A6DE8',
    bannerUrl: 'https://picsum.photos/seed/mojopopbanner/800/400',
    logoUrl: 'https://picsum.photos/seed/mojopoplogo/200/200',
    rating: 4.1,
  },
]

export const items: BrandItem[] = [
  {
    id: 'i-paneer-thali',
    brandId: 'b-box30',
    name: 'Paneer Butter Masala Thali',
    description: 'Paneer butter masala, dal, 3 rotis, rice, salad, sweet.',
    imageUrl: 'https://picsum.photos/seed/paneerthali/300/300',
    veg: 'veg',
    category: 'Thalis',
    prepMinutes: 18,
    tags: ['bestseller'],
    addonGroups: [
      {
        id: 'ag-extra',
        name: 'Add extras',
        min: 0,
        max: 3,
        options: [
          { id: 'o-roti', name: 'Extra roti', price: 1500 },
          { id: 'o-gulab', name: 'Gulab jamun (2)', price: 4000 },
        ],
      },
    ],
  },
  {
    id: 'i-chicken-bowl',
    brandId: 'b-box30',
    name: 'Chicken Biryani Bowl',
    description: 'Hyderabadi-style chicken biryani with raita.',
    imageUrl: 'https://picsum.photos/seed/chickenbowl/300/300',
    veg: 'non-veg',
    category: 'Rice Bowls',
    prepMinutes: 20,
    tags: ['popular', 'spicy'],
    addonGroups: [],
  },
  {
    id: 'i-classic-burger',
    brandId: 'b-mojopop',
    name: 'Classic Chicken Burger',
    description: 'Crispy chicken patty, lettuce, house sauce.',
    imageUrl: 'https://picsum.photos/seed/burger/300/300',
    veg: 'non-veg',
    category: 'Burgers',
    prepMinutes: 12,
    tags: ['bestseller'],
    addonGroups: [
      {
        id: 'ag-drink',
        name: 'Choose a drink',
        min: 1,
        max: 1,
        options: [
          { id: 'o-coke', name: 'Cola (300ml)', price: 4000 },
          { id: 'o-lime', name: 'Fresh lime soda', price: 5000 },
        ],
      },
    ],
  },
  {
    id: 'i-fries',
    brandId: 'b-mojopop',
    name: 'Peri Peri Fries',
    description: 'Crinkle-cut fries tossed in peri peri.',
    imageUrl: 'https://picsum.photos/seed/fries/300/300',
    veg: 'veg',
    category: 'Sides',
    prepMinutes: 8,
    tags: ['new'],
    addonGroups: [],
  },
]

export const offerings: ZoneOffering[] = [
  { zoneId: 'z-koramangala', itemId: 'i-paneer-thali', price: 19900, mrp: 24900, available: true, kitchenId: 'k-spicehub' },
  { zoneId: 'z-koramangala', itemId: 'i-chicken-bowl', price: 22900, mrp: 22900, available: true, kitchenId: 'k-spicehub' },
  { zoneId: 'z-koramangala', itemId: 'i-classic-burger', price: 16900, mrp: 19900, available: true, kitchenId: 'k-spicehub' },
  { zoneId: 'z-koramangala', itemId: 'i-fries', price: 9900, mrp: 9900, available: false, kitchenId: 'k-spicehub' },
]
