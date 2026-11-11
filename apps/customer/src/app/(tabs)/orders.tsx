import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { ORDER_STAGES, useOrders, type PlacedOrder } from '@/context/OrdersContext'
import { haptics } from '@/lib/haptics'
import { rupees } from '@/lib/money'
import { radius, shadow, space, type, useTheme } from '@/theme/tokens'

export default function Orders() {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { orders } = useOrders()

  const active = orders.filter((o) => o.stage < ORDER_STAGES.length - 1)
  const past = orders.filter((o) => o.stage === ORDER_STAGES.length - 1)

  if (orders.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + space.lg }}>
        <Txt style={[type.h1, { color: t.text, paddingHorizontal: space.lg }]}>Orders</Txt>
        <View style={styles.empty}>
          <View style={[styles.iconCircle, { backgroundColor: t.brandSoft }]}>
            <Ionicons name="receipt-outline" size={34} color={t.brand} />
          </View>
          <Txt style={[type.h2, { color: t.text, marginTop: space.lg }]}>No orders yet</Txt>
          <Txt style={[type.body, { color: t.textMuted, textAlign: 'center', marginTop: space.xs }]}>
            Your active and past orders will show up here.
          </Txt>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            style={({ pressed }) => [styles.cta, { borderColor: t.brand }, pressed && { backgroundColor: t.brandSoft }]}
          >
            <Txt style={[type.h3, { color: t.brand }]}>Browse brands</Txt>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Txt style={[type.h1, { color: t.text, paddingHorizontal: space.lg }]}>Orders</Txt>

      {active.length > 0 && <SectionLabel t={t}>ACTIVE</SectionLabel>}
      {active.map((o) => (
        <OrderCard key={o.id} order={o} t={t} onPress={() => { haptics.tap(); router.push(`/order/${o.id}`) }} />
      ))}

      {past.length > 0 && <SectionLabel t={t}>PAST</SectionLabel>}
      {past.map((o) => (
        <OrderCard key={o.id} order={o} t={t} onPress={() => { haptics.tap(); router.push(`/order/${o.id}`) }} />
      ))}
    </ScrollView>
  )
}

function SectionLabel({ children, t }: { children: string; t: ReturnType<typeof useTheme> }) {
  return (
    <Txt style={[type.small, { color: t.textMuted, fontWeight: '700', letterSpacing: 0.8, paddingHorizontal: space.lg, marginTop: space.lg, marginBottom: space.sm }]}>
      {children}
    </Txt>
  )
}

function OrderCard({ order, t, onPress }: { order: PlacedOrder; t: ReturnType<typeof useTheme>; onPress: () => void }) {
  const stage = ORDER_STAGES[order.stage]
  const delivered = order.stage === ORDER_STAGES.length - 1
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0)
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: t.card, borderColor: t.border }, shadow.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Txt style={[type.h3, { color: t.text }]}>{order.brandName}</Txt>
          <Txt style={[type.small, { color: t.textMuted }]} numberOfLines={1}>
            {order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
          </Txt>
        </View>
        <Txt style={[type.h3, { color: t.text }]}>{rupees(order.payable)}</Txt>
      </View>
      <View style={[styles.statusRow, { borderTopColor: t.border }]}>
        <View style={styles.statusLeft}>
          <Ionicons
            name={delivered ? 'checkmark-circle' : (stage.icon as any)}
            size={15}
            color={delivered ? t.success : t.brand}
          />
          <Txt style={[type.small, { color: delivered ? t.success : t.brand, fontWeight: '600' }]}>
            {stage.label}
          </Txt>
        </View>
        {!delivered && (
          <View style={styles.track}>
            <Txt style={[type.small, { color: t.brand, fontWeight: '700' }]}>Track</Txt>
            <Ionicons name="chevron-forward" size={14} color={t.brand} />
          </View>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, paddingBottom: 80 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  cta: { marginTop: space.xl, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: space.xl, paddingVertical: space.md },
  card: {
    marginHorizontal: space.lg,
    marginBottom: space.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.lg,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  track: { flexDirection: 'row', alignItems: 'center', gap: 2 },
})
