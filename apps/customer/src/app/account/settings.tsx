import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native'
import { Txt } from '@/components/Txt'
import { haptics } from '@/lib/haptics'
import { space, type, useTheme } from '@/theme/tokens'

export default function Settings() {
  const t = useTheme()
  const router = useRouter()
  const [notif, setNotif] = useState(true)
  const [veg, setVeg] = useState(false)

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: space.lg }}>
      <Section label="Profile" t={t}>
        <LinkRow icon="person-outline" label="Profile details" sub="Name, email & more" onPress={() => router.push('/account/profile')} t={t} />
        <LinkRow icon="location-outline" label="Saved addresses" sub="Manage delivery addresses" onPress={haptics.tap} t={t} />
      </Section>

      <Section label="Preferences" t={t}>
        <ToggleRow icon="notifications-outline" label="Order notifications" value={notif} onToggle={() => { haptics.tap(); setNotif((v) => !v) }} t={t} />
        <ToggleRow icon="leaf-outline" label="Veg mode" value={veg} onToggle={() => { haptics.tap(); setVeg((v) => !v) }} t={t} />
      </Section>
    </ScrollView>
  )
}

function Section({ label, children, t }: { label: string; children: React.ReactNode; t: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ marginBottom: space.lg }}>
      <Txt style={[type.small, { color: t.textMuted, fontWeight: '700', letterSpacing: 0.5, marginBottom: space.xs }]}>{label}</Txt>
      {children}
    </View>
  )
}

function LinkRow({ icon, label, sub, onPress, t }: { icon: keyof typeof Ionicons.glyphMap; label: string; sub: string; onPress: () => void; t: ReturnType<typeof useTheme> }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: t.border }]}>
      <Ionicons name={icon} size={21} color={t.text} style={{ width: 30 }} />
      <View style={{ flex: 1 }}>
        <Txt style={[type.body, { color: t.text, fontWeight: '600' }]}>{label}</Txt>
        <Txt style={[type.small, { color: t.textMuted }]}>{sub}</Txt>
      </View>
      <Ionicons name="chevron-forward" size={17} color={t.textFaint} />
    </Pressable>
  )
}

function ToggleRow({ icon, label, value, onToggle, t }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: boolean; onToggle: () => void; t: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.row, { borderBottomColor: t.border }]}>
      <Ionicons name={icon} size={21} color={t.text} style={{ width: 30 }} />
      <Txt style={[type.body, { color: t.text, flex: 1, fontWeight: '600' }]}>{label}</Txt>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: t.border, true: t.brand }} thumbColor="#fff" />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg, borderBottomWidth: StyleSheet.hairlineWidth },
})
