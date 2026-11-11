import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { PrimaryButton } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme } from '@/theme/tokens'

export default function Profile() {
  const t = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, setName } = useAuth()
  const [name, setNameInput] = useState(user?.name ?? '')
  const [email, setEmail] = useState('')

  function save() {
    haptics.success()
    setName(name.trim())
    router.back()
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg }}>
        <Field label="Full name" t={t}>
          <TextInput value={name} onChangeText={setNameInput} placeholder="Your name" placeholderTextColor={t.textFaint} style={[styles.input, { color: t.text }]} />
        </Field>
        <Field label="Mobile number" t={t}>
          <Txt style={[type.body, { color: t.textMuted }]}>+91 {user?.phone ?? '—'}</Txt>
        </Field>
        <Field label="Email (optional)" t={t}>
          <TextInput value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={t.textFaint} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { color: t.text }]} />
        </Field>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md, borderTopColor: t.border }]}>
        <PrimaryButton label="Save profile" onPress={save} disabled={!name.trim()} />
      </View>
    </View>
  )
}

function Field({ label, children, t }: { label: string; children: React.ReactNode; t: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.field, { borderColor: t.border }]}>
      <Txt style={[type.small, { color: t.textMuted, marginBottom: 4 }]}>{label}</Txt>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  field: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: space.md, marginBottom: space.md },
  input: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, padding: 0 },
  footer: { padding: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
})
