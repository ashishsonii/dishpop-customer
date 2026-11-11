import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
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
import { isValidPhone } from '@/lib/authService'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme } from '@/theme/tokens'

export default function PhoneScreen() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { requestOtp } = useAuth()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const valid = isValidPhone(phone)

  async function onContinue() {
    if (!valid || loading) return
    setLoading(true)
    setError(null)
    try {
      const { devOtp } = await requestOtp(phone)
      haptics.tap()
      router.push({ pathname: '/auth/verify', params: { phone, devOtp } })
    } catch (e) {
      haptics.warn()
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.bg }}
    >
      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={t.text} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Txt style={[type.display, { color: t.text }]}>Enter your{'\n'}phone number</Txt>
        <Txt style={[type.body, { color: t.textMuted, marginTop: space.sm }]}>
          We'll text a one-time password to verify it's you.
        </Txt>

        <View style={[styles.inputRow, { borderColor: error ? t.nonVeg : t.border, backgroundColor: t.surface }]}>
          <Txt style={[type.h3, { color: t.text }]}>+91</Txt>
          <View style={[styles.sep, { backgroundColor: t.border }]} />
          <TextInput
            value={phone}
            onChangeText={(v) => {
              setPhone(v.replace(/\D/g, '').slice(0, 10))
              setError(null)
            }}
            placeholder="98765 43210"
            placeholderTextColor={t.textFaint}
            keyboardType="number-pad"
            autoFocus
            maxLength={10}
            style={[styles.input, { color: t.text }]}
          />
        </View>
        {error && (
          <Txt style={[type.small, { color: t.nonVeg, marginTop: space.sm }]}>{error}</Txt>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Txt style={[type.tiny, { color: t.textFaint, textAlign: 'center', marginBottom: space.md }]}>
          By continuing you agree to DishPop's Terms & Privacy Policy.
        </Txt>
        <PrimaryButton label="Continue" onPress={onContinue} disabled={!valid} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  body: { flex: 1, paddingHorizontal: space.lg, paddingTop: space.xl },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    height: 56,
    marginTop: space.xxl,
  },
  sep: { width: StyleSheet.hairlineWidth, height: 24 },
  input: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 16, letterSpacing: 1 },
  footer: { paddingHorizontal: space.lg, paddingTop: space.md },
})
