// Mock OTP auth service. One place that fakes the SMS backend, so swapping in
// a real provider (MSG91/Twilio) later means changing only this file.
//
// Dev behaviour: any 10-digit number "works"; the OTP is always DEV_OTP and is
// returned so the UI can show a hint. Replace both calls with real API calls.

export const DEV_OTP = '123456'

export interface AuthUser {
  phone: string // 10-digit, no country code
  name: string | null
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone) // Indian mobile numbers
}

export async function requestOtp(phone: string): Promise<{ devOtp: string }> {
  if (!isValidPhone(phone)) throw new Error('Enter a valid 10-digit mobile number')
  await delay(700) // simulate network / SMS send
  return { devOtp: DEV_OTP }
}

export async function verifyOtp(phone: string, code: string): Promise<AuthUser> {
  await delay(600)
  if (code !== DEV_OTP) throw new Error('Incorrect OTP. Try again.')
  return { phone, name: null }
}
