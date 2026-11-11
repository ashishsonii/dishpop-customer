import { Ionicons } from '@expo/vector-icons'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Txt } from '@/components/Txt'
import { radius, space, type, useTheme } from '@/theme/tokens'

export default function Credits() {
  const t = useTheme()
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: space.lg }}>
      <View style={[styles.balance, { backgroundColor: t.brand }]}>
        <Txt style={[type.small, { color: 'rgba(255,255,255,0.7)' }]}>AVAILABLE BALANCE</Txt>
        <Txt style={[type.display, { color: '#fff', marginTop: 4 }]}>₹150</Txt>
        <Txt style={[type.small, { color: 'rgba(255,255,255,0.7)', marginTop: 2 }]}>1 credit = ₹1 · auto-applied at checkout</Txt>
      </View>

      <Txt style={[type.small, { color: t.textMuted, fontWeight: '700', letterSpacing: 0.5, marginTop: space.xl, marginBottom: space.sm }]}>HOW CREDITS WORK</Txt>
      {[
        ['gift-outline', 'Earn from referrals', 'Get ₹500 when a friend orders.'],
        ['refresh-outline', 'Earn from refunds', 'Refunds can come back as credits.'],
        ['pricetag-outline', 'Use at checkout', 'Toggle “Apply credits” in your cart.'],
      ].map(([icon, title, sub]) => (
        <View key={title} style={[styles.row, { borderBottomColor: t.border }]}>
          <Ionicons name={icon as never} size={20} color={t.text} style={{ width: 30 }} />
          <View style={{ flex: 1 }}>
            <Txt style={[type.body, { color: t.text, fontWeight: '600' }]}>{title}</Txt>
            <Txt style={[type.small, { color: t.textMuted }]}>{sub}</Txt>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  balance: { borderRadius: radius.lg, padding: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg, borderBottomWidth: StyleSheet.hairlineWidth },
})
