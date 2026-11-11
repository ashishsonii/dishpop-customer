import React, { createContext, useContext, useMemo, useState } from 'react'
import type { CartLine, CartTotals, Paise, Zone } from '@/types/models'

// GST on restaurant food, as a simple percentage of item total. The exact
// mechanism (who remits, 5% vs other) is a legal decision for the backend;
// the display rate lives here for now.
const GST_RATE = 0.05

// Coupons. Swap for backend-driven offers later. min = min item total (paise).
interface CouponDef {
  label: string
  min: Paise
  calc: (itemTotal: Paise) => Paise
}
export const COUPONS: Record<string, CouponDef> = {
  FIRST50: { label: '50% off your first 3 orders, up to ₹150', min: 9900, calc: (it) => Math.min(Math.round(it * 0.5), 15000) },
  DISH25: { label: '25% off, up to ₹120', min: 9900, calc: (it) => Math.min(Math.round(it * 0.25), 12000) },
  GET100: { label: 'Flat ₹100 off over ₹299', min: 29900, calc: () => 10000 },
}

export interface ApplyResult {
  ok: boolean
  message: string
  discount?: Paise
}

interface CartState {
  lines: CartLine[]
  brandId: string | null // cart is single-brand at a time, like most food apps
  addLine: (line: Omit<CartLine, 'lineId'>) => void
  setQty: (lineId: string, qty: number) => void
  clear: () => void
  count: number
  totals: (zone: Zone | null) => CartTotals
  // Convenience for simple (no add-on) items added straight from a grid.
  simpleQty: (itemId: string) => number
  incSimple: (itemId: string) => void
  decSimple: (itemId: string) => void
  // Coupons
  coupon: string | null
  applyCoupon: (code: string) => ApplyResult
  removeCoupon: () => void
  // Credits & tip
  useCredits: boolean
  setUseCredits: (v: boolean) => void
  tip: Paise
  setTip: (v: Paise) => void
}

export const CREDIT_BALANCE: number = 15000 // ₹150 in paise

// Launch promo: waive delivery + packaging fees. Configurable — move to
// admin/zone settings later; not a permanent hardcoded promise.
export const LAUNCH_FREE_FEES = true

const Ctx = createContext<CartState | undefined>(undefined)

// A line's signature = item + its chosen addons, so identical configs stack.
function signature(itemId: string, addonIds: string[]): string {
  return `${itemId}::${[...addonIds].sort().join(',')}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [brandId, setBrandId] = useState<string | null>(null)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [useCredits, setUseCredits] = useState(false)
  const [tip, setTip] = useState<Paise>(0)

  function itemTotalOf(ls: CartLine[]): Paise {
    return ls.reduce((sum, l) => {
      const addons = l.addons.reduce((a, x) => a + x.price, 0)
      return sum + (l.unitPrice + addons) * l.qty
    }, 0)
  }

  function mrpTotalOf(ls: CartLine[]): Paise {
    return ls.reduce((sum, l) => {
      const addons = l.addons.reduce((a, x) => a + x.price, 0)
      return sum + ((l.mrp ?? l.unitPrice) + addons) * l.qty
    }, 0)
  }

  function applyCoupon(codeRaw: string): ApplyResult {
    const code = codeRaw.trim().toUpperCase()
    const def = COUPONS[code]
    if (!def) return { ok: false, message: 'Invalid coupon code' }
    const it = itemTotalOf(lines)
    if (it < def.min) {
      const more = def.min - it
      return { ok: false, message: `Add ₹${Math.ceil(more / 100)} more to use this coupon` }
    }
    setCoupon(code)
    return { ok: true, message: 'Coupon applied', discount: def.calc(it) }
  }

  function removeCoupon() {
    setCoupon(null)
  }

  function addLine(line: Omit<CartLine, 'lineId'>) {
    setLines((prev) => {
      // Switching brands replaces the cart (kept simple for MVP).
      const base = brandId && brandId !== line.brandId ? [] : prev
      const sig = signature(line.itemId, line.addons.map((a) => a.optionId))
      const existing = base.find(
        (l) => signature(l.itemId, l.addons.map((a) => a.optionId)) === sig,
      )
      if (existing) {
        return base.map((l) =>
          l.lineId === existing.lineId ? { ...l, qty: l.qty + line.qty } : l,
        )
      }
      return [...base, { ...line, lineId: sig }]
    })
    setBrandId(line.brandId)
  }

  function setQty(lineId: string, qty: number) {
    setLines((prev) => {
      const next =
        qty <= 0
          ? prev.filter((l) => l.lineId !== lineId)
          : prev.map((l) => (l.lineId === lineId ? { ...l, qty } : l))
      if (next.length === 0) setBrandId(null)
      return next
    })
  }

  function clear() {
    setLines([])
    setBrandId(null)
    setCoupon(null)
    setUseCredits(false)
    setTip(0)
  }

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines])

  // A simple item's line id is its signature with no add-ons.
  const simpleId = (itemId: string) => signature(itemId, [])
  function simpleQty(itemId: string): number {
    return lines.find((l) => l.lineId === simpleId(itemId))?.qty ?? 0
  }
  function incSimple(itemId: string) {
    setQty(simpleId(itemId), simpleQty(itemId) + 1)
  }
  function decSimple(itemId: string) {
    setQty(simpleId(itemId), simpleQty(itemId) - 1)
  }

  function totals(zone: Zone | null): CartTotals {
    const itemTotal = itemTotalOf(lines)
    const mrpTotal = mrpTotalOf(lines)

    // Original fees, then the launch promo waives them to zero.
    const packagingFeeBase = lines.length ? (zone?.packagingFee ?? 0) : 0
    const freeThreshold = zone?.freeDeliveryThreshold ?? null
    const deliveryFeeBase =
      !zone || itemTotal === 0
        ? 0
        : freeThreshold !== null && itemTotal >= freeThreshold
          ? 0
          : zone.deliveryFee
    const feesWaived = LAUNCH_FREE_FEES && lines.length > 0
    const packagingFee = feesWaived ? 0 : packagingFeeBase
    const deliveryFee = feesWaived ? 0 : deliveryFeeBase

    // Apply the coupon only while it's still valid for the current total.
    const def = coupon ? COUPONS[coupon] : null
    const discount = def && itemTotal >= def.min ? def.calc(itemTotal) : 0
    const tax = Math.round(itemTotal * GST_RATE)

    const beforeCredits = itemTotal + packagingFee + deliveryFee + tax - discount + tip
    const credits = useCredits ? Math.min(CREDIT_BALANCE, Math.max(beforeCredits - 100, 0)) : 0
    const payable = beforeCredits - credits
    const waivedFees = packagingFeeBase - packagingFee + (deliveryFeeBase - deliveryFee)
    const savings = mrpTotal - itemTotal + discount + credits + waivedFees
    return {
      itemTotal,
      mrpTotal,
      packagingFee,
      packagingFeeBase,
      deliveryFee,
      deliveryFeeBase,
      feesWaived,
      discount,
      credits,
      tip,
      tax,
      savings,
      payable,
    }
  }

  return (
    <Ctx.Provider
      value={{
        lines,
        brandId,
        addLine,
        setQty,
        clear,
        count,
        totals,
        simpleQty,
        incSimple,
        decSimple,
        coupon,
        applyCoupon,
        removeCoupon,
        useCredits,
        setUseCredits,
        tip,
        setTip,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useCart(): CartState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCart must be used within CartProvider')
  return v
}
