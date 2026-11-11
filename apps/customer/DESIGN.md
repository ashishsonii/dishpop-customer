# DishPop — Design Study

Design language studied from leading Indian food apps (EatClub, Swiggy, Zomato)
and applied with **DishPop's own identity**. We match the *craft and structure*,
not any competitor's brand colours or assets.

## 1. Type — Poppins

| Role | Size / LH | Weight | Use |
|------|-----------|--------|-----|
| Hero number | 22 / 28 | 700 | "Delivery in 17–27 mins" |
| Screen title | 22 / 28 | 700 | Brand name, screen headers |
| Section header | 12 / 16 | 700, +0.8 tracking, UPPERCASE, muted | "WHAT ARE YOU CRAVING?" |
| Card title | 16 / 22 | 700 | Brand/item names |
| Body | 14 / 20 | 500 | Descriptions |
| Caption | 12 / 16 | 500 | Muted meta |
| Price | 14 | 700 | ₹ amounts |

**Section-header pattern:** uppercase label + a thin hairline rule extending to
the right edge. This is the signature rhythm of the whole app.

## 2. Colour — appetizing red + warm gold

DishPop brand, not borrowed. Red drives action; gold flags offers/credits;
green is reserved for ratings and "free / veg" positives.

- Primary red `#E23744`, pressed `#C42333`, soft `#FFE9EB`
- Gold `#E8A33D`, soft `#FFF3DF`
- Rating/veg green `#0C8A43`
- Ink `#141217`, muted `#6B6775`, border `#E9E7EE`
- Full dark-mode token set in `theme/tokens.ts`.

## 3. Spacing & shape

- 4/8 rhythm. Screen gutter 16. Section gap 24–32.
- Cards: radius 16, soft shadow (`shadow.card`), 1px hairline border.
- Pills/chips: radius 999.
- Food imagery is always the hero — large, rounded, edge-to-edge in cards.

## 4. Component inventory (reusable)

- **Location bar** — pin icon + address + chevron, bold ETA, credits pill right.
- **Hero offer banner** — full-width rounded image/gradient with offer text.
- **Offer rail** — horizontal scroll of small photo cards.
- **Craving rail** — 2-row horizontal scroll of circular food images + labels.
- **Brand card** — big food photo, ETA badge, name, tagline, green rating pill,
  fee/disclosure line.
- **Menu row** — veg dot, name, price (+ strike MRP), tags, desc, photo with a
  floating ADD button that becomes a qty stepper.
- **Section header** — uppercase + rule.
- **Sticky cart bar** — count + payable, routes to cart.
- **Bottom tab bar** — Home, Search, Orders, Account (brand-coloured active).

## 5. Interaction

- Every tappable element: pressed feedback (opacity/scale/ripple) in 120–200ms,
  no layout shift. Touch targets ≥ 44pt.
- ADD → inline qty stepper (±) in place, no navigation.
- Vector icons only (Ionicons / Feather via `@expo/vector-icons`), never emoji.
- Safe-area respected for header, tab bar, and bottom CTA bars.

## 6. What we deliberately do NOT copy

Competitor palettes, logos, mascots, photography, promo copy ("3CHEERS",
"What's on your mind?"), or membership branding. Those are theirs. DishPop's
brands, colours, and copy are original.
