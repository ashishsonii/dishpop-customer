import { Ionicons } from '@expo/vector-icons'
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Txt } from '@/components/Txt'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme } from '@/theme/tokens'

const FAQS = [
  ['Where is my order?', 'Track live status any time under Orders → tap your active order.'],
  ['How do refunds work?', 'Refunds go back to your original payment method, or as DishPop credits.'],
  ['Can I cancel an order?', 'You can cancel free of charge before the kitchen starts preparing.'],
  ['Who prepares the food?', 'FSSAI-licensed partner kitchens — details are on each brand page.'],
]

export default function Help() {
  const t = useTheme()
  const contacts: { icon: keyof typeof Ionicons.glyphMap; label: string; action: () => void }[] = [
    { icon: 'call-outline', label: 'Call support', action: () => Linking.openURL('tel:+911800000000') },
    { icon: 'mail-outline', label: 'Email us', action: () => Linking.openURL('mailto:help@dishpop.example') },
    { icon: 'chatbubble-ellipses-outline', label: 'Chat with us', action: () => {} },
  ]
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: space.lg }}>
      <View style={styles.contacts}>
        {contacts.map((c) => (
          <Pressable key={c.label} onPress={() => { haptics.tap(); c.action() }} style={[styles.contact, { borderColor: t.border }]}>
            <Ionicons name={c.icon} size={22} color={t.brand} />
            <Txt style={[type.small, { color: t.text, fontWeight: '600', textAlign: 'center' }]}>{c.label}</Txt>
          </Pressable>
        ))}
      </View>

      <Txt style={[type.small, { color: t.textMuted, fontWeight: '700', letterSpacing: 0.5, marginTop: space.xl, marginBottom: space.sm }]}>FAQS</Txt>
      {FAQS.map(([q, a]) => (
        <View key={q} style={[styles.faq, { borderBottomColor: t.border }]}>
          <Txt style={[type.h3, { color: t.text }]}>{q}</Txt>
          <Txt style={[type.small, { color: t.textMuted, marginTop: 3 }]}>{a}</Txt>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  contacts: { flexDirection: 'row', gap: space.md },
  contact: { flex: 1, alignItems: 'center', gap: space.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, paddingVertical: space.lg },
  faq: { paddingVertical: space.lg, borderBottomWidth: StyleSheet.hairlineWidth },
})
