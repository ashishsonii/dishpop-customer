import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Txt } from '@/components/Txt'
import { COUPONS } from '@/context/CartContext'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme } from '@/theme/tokens'

export default function Offers() {
  const t = useTheme()
  const codes = Object.entries(COUPONS)

  async function copy(code: string) {
    haptics.success()
    await Clipboard.setStringAsync(code).catch(() => {})
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: space.lg }}>
      <Txt style={[type.body, { color: t.textMuted, marginBottom: space.md }]}>
        Apply any code in your cart before checkout.
      </Txt>
      {codes.map(([code, def]) => (
        <View key={code} style={[styles.card, { borderColor: t.border }]}>
          <View style={[styles.tag, { backgroundColor: t.surface }]}>
            <Ionicons name="pricetag" size={18} color={t.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={[type.h3, { color: t.text, letterSpacing: 1 }]}>{code}</Txt>
            <Txt style={[type.small, { color: t.textMuted }]}>{def.label}</Txt>
          </View>
          <Pressable onPress={() => copy(code)} hitSlop={8}>
            <Txt style={[type.small, { color: t.brand, fontWeight: '700' }]}>COPY</Txt>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.lg, padding: space.lg, marginBottom: space.md },
  tag: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
})
