import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  requestOtp as apiRequestOtp,
  verifyOtp as apiVerifyOtp,
  type AuthUser,
} from '@/lib/authService'

const STORAGE_KEY = 'dishpop.user'

interface AuthState {
  user: AuthUser | null
  ready: boolean // session restored from storage yet?
  requestOtp: (phone: string) => Promise<{ devOtp: string }>
  verifyOtp: (phone: string, code: string) => Promise<void>
  setName: (name: string) => void
  signOut: () => void
}

const Ctx = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  // Restore session on launch.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => raw && setUser(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  function persist(u: AuthUser | null) {
    setUser(u)
    if (u) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u)).catch(() => {})
    else AsyncStorage.removeItem(STORAGE_KEY).catch(() => {})
  }

  return (
    <Ctx.Provider
      value={{
        user,
        ready,
        requestOtp: apiRequestOtp,
        verifyOtp: async (phone, code) => {
          const u = await apiVerifyOtp(phone, code)
          persist(u)
        },
        setName: (name) => user && persist({ ...user, name }),
        signOut: () => persist(null),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth(): AuthState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}
