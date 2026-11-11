import type { Paise } from '../types/models'

// Format integer paise as ₹ string. 19900 -> "₹199", 19950 -> "₹199.50".
export function rupees(p: Paise): string {
  const whole = Math.trunc(p / 100)
  const frac = Math.abs(p % 100)
  const n = whole.toLocaleString('en-IN')
  return frac === 0 ? `₹${n}` : `₹${n}.${String(frac).padStart(2, '0')}`
}
