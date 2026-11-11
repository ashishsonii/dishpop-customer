import React, { createContext, useContext, useRef, useState } from 'react'
import type { Paise } from '@/types/models'

// The live journey a customer sees. Mirrors the kitchen→rider flow in the spec.
export const ORDER_STAGES = [
  { key: 'confirmed', label: 'Order confirmed', sub: 'Sent to the kitchen', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing your food', sub: 'The kitchen is cooking', icon: 'restaurant' },
  { key: 'packed', label: 'Food packed', sub: 'Sealed and ready', icon: 'bag-check' },
  { key: 'pickup', label: 'Rider picked up', sub: 'On the way to you', icon: 'bicycle' },
  { key: 'nearby', label: 'Rider nearby', sub: 'Almost at your door', icon: 'navigate' },
  { key: 'delivered', label: 'Delivered', sub: 'Enjoy your meal', icon: 'home' },
] as const

export interface PlacedOrder {
  id: string
  brandName: string
  items: { name: string; qty: number }[]
  payable: Paise
  address: string
  paymentMethod: string
  stage: number // index into ORDER_STAGES
  placedAt: number
  etaMinutes: number
  rider: { name: string; phone: string }
}

interface OrdersState {
  orders: PlacedOrder[]
  getOrder: (id: string) => PlacedOrder | undefined
  place: (o: Omit<PlacedOrder, 'id' | 'stage' | 'placedAt' | 'rider'>) => string
}

const Ctx = createContext<OrdersState | undefined>(undefined)

const RIDERS = [
  { name: 'Imran', phone: '+91 90000 11111' },
  { name: 'Suresh', phone: '+91 90000 22222' },
  { name: 'Anil', phone: '+91 90000 33333' },
]

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<PlacedOrder[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  function bump(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id && o.stage < ORDER_STAGES.length - 1 ? { ...o, stage: o.stage + 1 } : o)),
    )
  }

  // Demo pacing: advance a stage every few seconds until delivered. A real
  // build drives these from backend/partner/rider status events instead.
  function schedule(id: string, stage: number) {
    if (stage >= ORDER_STAGES.length - 1) return
    timers.current[id] = setTimeout(() => {
      bump(id)
      schedule(id, stage + 1)
    }, 6000)
  }

  function place(o: Omit<PlacedOrder, 'id' | 'stage' | 'placedAt' | 'rider'>): string {
    const id = `DP${Date.now().toString().slice(-7)}`
    const order: PlacedOrder = {
      ...o,
      id,
      stage: 0,
      placedAt: Date.now(),
      rider: RIDERS[Math.floor(Math.random() * RIDERS.length)],
    }
    setOrders((prev) => [order, ...prev])
    schedule(id, 0)
    return id
  }

  function getOrder(id: string) {
    return orders.find((o) => o.id === id)
  }

  return <Ctx.Provider value={{ orders, getOrder, place }}>{children}</Ctx.Provider>
}

export function useOrders(): OrdersState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useOrders must be used within OrdersProvider')
  return v
}
