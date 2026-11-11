# DishPop — Customer App

Virtual-brand food delivery, built zone-first. The customer sees our brands
(Box 30, Mojo Pop, …); partner kitchens cook; everything is filtered to the
customer's micro-zone.

Built with Expo (SDK 58) + expo-router + TypeScript. Original code; the
ordering flow is modelled on how a standard food app works, not copied from any
app's code.

## Run

```bash
npm install
npx expo start      # press i (iOS), a (Android), or w (web)
```

## Structure

```
src/
  app/                 # expo-router screens (file = route)
    _layout.tsx        # providers (Zone, Cart) + navigation stack
    index.tsx          # Home: location header + brands in your zone
    brand/[id].tsx     # Brand page: menu + FSSAI/kitchen disclosure
    item/[id].tsx      # Item detail modal: add-ons, then add to cart
    cart.tsx           # Cart: qty steppers + bill breakdown + min-order gate
    checkout.tsx       # Address → payment method → place order
  components/          # VegDot, Tag, PrimaryButton, sticky CartBar
  context/             # ZoneContext, CartContext (cart totals live here)
  data/                # mock.ts (one zone, 2 brands) + catalog.ts (access layer)
  lib/                 # money (paise), zone (point-in-polygon, hours)
  theme/               # design tokens (color, space, type)
  types/               # core data model
```

## Key design rules baked in

- **Money is integer paise** everywhere. Never floats. See `lib/money.ts`.
- **Three-layer availability** (`data/catalog.ts`): a customer sees an item only
  if the brand is active in the zone AND a zone offering exists AND it's in
  stock. This is the one place that rule lives.
- **Price is per-zone**, not on the master item. Carts capture the price seen,
  so later edits don't change an in-progress order.
- **Kitchen disclosure** (FSSAI, legal name, district) is built into the brand
  page — the brand leads, but the real kitchen is always shown.
- **Fees are config** (delivery, packaging, free-delivery threshold, min order),
  per zone in `data/mock.ts` → will come from admin/backend.

## Not yet wired (next steps)

- Backend API (replace `data/catalog.ts` mock calls with real queries).
- Real location → zone resolution (logic ready in `lib/zone.ts`).
- Payments (Razorpay/Cashfree) + the real place-order call in `checkout.tsx`.
- OTP login, order tracking, orders history, ratings, wallet, coupons.
