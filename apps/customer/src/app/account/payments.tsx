import { Ionicons } from '@expo/vector-icons'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Txt } from '@/components/Txt'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme } from '@/theme/tokens'

const METHODS: { icon: keyof typeof Ionicons.glyphMap; label: string; sub: string }[] = [
  { icon: 'phone-portrait-outline', label: 'UPI', sub: 'GPay, PhonePe, Paytm & more' },
  { icon: 'card-outline', label: 'Credit / debit card', sub: 'Visa, Mastercard, RuPay' },
  { icon: 'cash-outline', label: 'Cash on delivery', sub: 'Pay the rider on arrival' },
]

export default function Payments() {
  const t = useTheme()
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: space.lg }}>
      <Txt style={[type.body, { color: t.textMuted, marginBottom: space.md }]}>
        No saved methods yet. You can pick any of these at checkout.
      </Txt>
      {METHODS.map((m) => (
        <View key={m.label} style={[styles.row, { borderColor: t.border }]}>
          <Ionicons name={m.icon} size={22} color={t.text} />
          <View style={{ flex: 1 }}>
            <Txt style={[type.h3, { color: t.text }]}>{m.label}</Txt>
            <Txt style={[type.small, { color: t.textMuted }]}>{m.sub}</Txt>
          </View>
        </View>
      ))}
      <Pressable onPress={haptics.tap} style={[styles.add, { borderColor: t.brand }]}>
        <Ionicons name="add" size={18} color={t.brand} />
        <Txt style={[type.h3, { color: t.brand }]}>Add a payment method</Txt>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, padding: space.lg, marginBottom: space.md },
  add: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.lg, paddingVertical: space.lg, marginTop: space.sm },
})
