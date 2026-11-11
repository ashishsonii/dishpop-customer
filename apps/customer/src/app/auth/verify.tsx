import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { type ComponentRef, useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { PrimaryButton } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme } from '@/theme/tokens'

const LEN = 6

export default function VerifyScreen() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { verifyOtp } = useAuth()
  const { phone, devOtp } = useLocalSearchParams<{ phone: string; devOtp?: string }>()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(30)
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null)

  // Resend countdown.
  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  async function submit(value: string) {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      await verifyOtp(phone, value)
      haptics.success()
      router.dismissAll() // back to wherever sign-in started
    } catch (e) {
      haptics.warn()
      setError(e instanceof Error ? e.message : 'Verification failed')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  function onChange(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, LEN)
    setCode(digits)
    setError(null)
    if (digits.length === LEN) submit(digits) // auto-submit
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.bg }}
    >
      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={t.text} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Txt style={[type.display, { color: t.text }]}>Verify your{'\n'}number</Txt>
        <Txt style={[type.body, { color: t.textMuted, marginTop: space.sm }]}>
          Enter the 6-digit code sent to +91 {phone}.{' '}
          <Txt style={[type.body, { color: t.brand, fontWeight: '700' }]} onPress={() => router.back()}>
            Edit
          </Txt>
        </Txt>

        {/* OTP boxes (one hidden input drives six cells) */}
        <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: LEN }).map((_, i) => {
            const filled = i < code.length
            const active = i === code.length
            return (
              <View
                key={i}
                style={[
                  styles.box,
                  { borderColor: error ? t.nonVeg : active ? t.brand : t.border, backgroundColor: t.surface },
                ]}
              >
                <Txt style={[type.h1, { color: t.text }]}>{filled ? code[i] : ''}</Txt>
              </View>
            )
          })}
        </Pressable>
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={onChange}
          keyboardType="number-pad"
          autoFocus
          maxLength={LEN}
          style={styles.hiddenInput}
        />

        {error && <Txt style={[type.small, { color: t.nonVeg, marginTop: space.md }]}>{error}</Txt>}

        {devOtp && (
          <View style={[styles.devHint, { backgroundColor: t.goldSoft }]}>
            <Ionicons name="construct" size={13} color={t.gold} />
            <Txt style={[type.tiny, { color: t.gold }]}>Dev mode · use code {devOtp}</Txt>
          </View>
        )}

        <View style={styles.resend}>
          {seconds > 0 ? (
            <Txt style={[type.small, { color: t.textMuted }]}>Resend code in 0:{String(seconds).padStart(2, '0')}</Txt>
          ) : (
            <Txt
              style={[type.small, { color: t.brand, fontWeight: '700' }]}
              onPress={() => {
                haptics.tap()
                setSeconds(30)
              }}
            >
              Resend code
            </Txt>
          )}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <PrimaryButton label="Verify" onPress={() => submit(code)} disabled={code.length !== LEN} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  body: { flex: 1, paddingHorizontal: space.lg, paddingTop: space.xl },
  boxes: { flexDirection: 'row', gap: space.sm, marginTop: space.xxl },
  box: {
    flex: 1,
    aspectRatio: 0.85,
    maxWidth: 52,
    borderWidth: 1.5,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  devHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: space.lg,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 5,
  },
  resend: { marginTop: space.xl },
  footer: { paddingHorizontal: space.lg, paddingTop: space.md },
})
