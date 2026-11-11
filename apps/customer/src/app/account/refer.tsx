import { Ionicons } from '@expo/vector-icons'
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native'
import { Txt } from '@/components/Txt'
import { PrimaryButton } from '@/components/ui'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme } from '@/theme/tokens'

const CODE = 'ASHISH500'
const STEPS = [
  { icon: 'share-social-outline', title: 'Share your code', sub: 'Send it to friends on WhatsApp or anywhere.' },
  { icon: 'person-add-outline', title: 'They sign up & order', sub: 'Your friend gets ₹100 off their first order.' },
  { icon: 'cash-outline', title: 'You earn ₹500', sub: 'Credited after their first order is delivered.' },
] as const

export default function Refer() {
  const t = useTheme()
  function share() {
    haptics.press()
    Share.share({ message: `Get ₹100 off your first DishPop order with my code ${CODE}. Download DishPop!` }).catch(() => {})
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: space.lg }}>
      <View style={[styles.hero, { backgroundColor: t.brand }]}>
        <Txt style={[type.display, { color: '#fff' }]}>Earn ₹500</Txt>
        <Txt style={[type.body, { color: 'rgba(255,255,255,0.8)' }]}>for every friend who orders</Txt>
      </View>

      <View style={[styles.codeCard, { borderColor: t.border }]}>
        <View>
          <Txt style={[type.small, { color: t.textMuted }]}>YOUR CODE</Txt>
          <Txt style={[type.h1, { color: t.text, letterSpacing: 2 }]}>{CODE}</Txt>
        </View>
        <Pressable onPress={share} style={[styles.shareBtn, { backgroundColor: t.brand }]}>
          <Ionicons name="share-social" size={16} color="#fff" />
          <Txt style={[type.small, { color: '#fff', fontWeight: '700' }]}>Share</Txt>
        </Pressable>
      </View>

      <Txt style={[type.small, { color: t.textMuted, fontWeight: '700', letterSpacing: 0.5, marginTop: space.xl, marginBottom: space.md }]}>HOW IT WORKS</Txt>
      {STEPS.map((s) => (
        <View key={s.title} style={styles.step}>
          <View style={[styles.stepIcon, { backgroundColor: t.surface }]}>
            <Ionicons name={s.icon} size={20} color={t.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={[type.h3, { color: t.text }]}>{s.title}</Txt>
            <Txt style={[type.small, { color: t.textMuted }]}>{s.sub}</Txt>
          </View>
        </View>
      ))}

      <View style={{ marginTop: space.xl }}>
        <PrimaryButton label="Invite friends" onPress={share} icon="share-social" />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: space.xl, alignItems: 'flex-start' },
  codeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.lg, padding: space.lg, marginTop: space.lg },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  stepIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
})
