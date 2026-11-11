import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { IconButton } from '@/components/ui'
import { ORDER_STAGES, useOrders } from '@/context/OrdersContext'
import { rupees } from '@/lib/money'
import { radius, shadow, space, type, useTheme } from '@/theme/tokens'

export default function OrderTracking() {
  const t = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { getOrder } = useOrders()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const order = getOrder(id)

  if (!order) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <Txt style={[type.body, { color: t.textMuted }]}>Order not found.</Txt>
      </View>
    )
  }

  const stage = ORDER_STAGES[order.stage]
  const delivered = order.stage === ORDER_STAGES.length - 1
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0)

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + space.sm, borderBottomColor: t.border }]}>
        <IconButton name="arrow-back" label="Back" onPress={() => router.replace('/(tabs)/orders')} />
        <View style={{ flex: 1 }}>
          <Txt style={[type.h3, { color: t.text }]}>Order #{order.id}</Txt>
          <Txt style={[type.small, { color: t.textMuted }]}>{order.brandName} · {itemCount} items</Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Live status hero */}
        <View style={[styles.hero, { backgroundColor: t.brand }]}>
          <Ionicons name={delivered ? 'checkmark-circle' : (stage.icon as any)} size={30} color="#fff" />
          <Txt style={[type.h2, { color: '#fff', marginTop: space.sm }]}>{stage.label}</Txt>
          <Txt style={[type.small, { color: 'rgba(255,255,255,0.75)', marginTop: 2 }]}>{stage.sub}</Txt>
          {!delivered && (
            <View style={styles.etaPill}>
              <Ionicons name="time" size={13} color="#fff" />
              <Txt style={[type.tiny, { color: '#fff' }]}>Arriving in ~{order.etaMinutes} min</Txt>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
          {ORDER_STAGES.map((s, i) => {
            const done = i < order.stage
            const active = i === order.stage
            const color = done || active ? t.brand : t.textFaint
            return (
              <View key={s.key} style={styles.step}>
                <View style={styles.rail}>
                  <View style={[styles.node, { borderColor: color, backgroundColor: done || active ? t.brand : t.card }]}>
                    {done ? (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    ) : active ? (
                      <View style={styles.pulse} />
                    ) : null}
                  </View>
                  {i < ORDER_STAGES.length - 1 && (
                    <View style={[styles.line, { backgroundColor: done ? t.brand : t.border }]} />
                  )}
                </View>
                <View style={{ flex: 1, paddingBottom: space.lg }}>
                  <Txt style={[type.body, { color: done || active ? t.text : t.textMuted, fontWeight: active ? '700' : '500' }]}>
                    {s.label}
                  </Txt>
                  <Txt style={[type.small, { color: t.textMuted }]}>{s.sub}</Txt>
                </View>
              </View>
            )
          })}
        </View>

        {/* Rider */}
        {order.stage >= 3 && !delivered && (
          <View style={[styles.rider, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
            <View style={[styles.avatar, { backgroundColor: t.brand }]}>
              <Txt style={[type.h3, { color: '#fff' }]}>{order.rider.name[0]}</Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={[type.h3, { color: t.text }]}>{order.rider.name}</Txt>
              <Txt style={[type.small, { color: t.textMuted }]}>Your delivery partner</Txt>
            </View>
            <Pressable
              onPress={() => Linking.openURL(`tel:${order.rider.phone.replace(/\s/g, '')}`)}
              style={[styles.callBtn, { borderColor: t.brand }]}
            >
              <Ionicons name="call" size={18} color={t.brand} />
            </Pressable>
          </View>
        )}

        {/* Summary */}
        <Txt style={[type.small, styles.secLabel, { color: t.textMuted }]}>ORDER SUMMARY</Txt>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border, padding: space.lg }, shadow.card]}>
          {order.items.map((it, i) => (
            <View key={i} style={styles.sumRow}>
              <Txt style={[type.body, { color: t.text }]}>{it.qty} × {it.name}</Txt>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <View style={styles.sumRow}>
            <Txt style={[type.h3, { color: t.text }]}>Total paid</Txt>
            <Txt style={[type.h3, { color: t.text }]}>{rupees(order.payable)}</Txt>
          </View>
          <Txt style={[type.small, { color: t.textMuted, marginTop: 2 }]}>
            {order.paymentMethod} · {order.address}
          </Txt>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hero: { borderRadius: radius.lg, padding: space.xl, alignItems: 'flex-start' },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: space.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 5,
  },
  card: {
    marginTop: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.lg,
  },
  step: { flexDirection: 'row', gap: space.md },
  rail: { alignItems: 'center', width: 24 },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  line: { width: 2, flex: 1, marginVertical: 2 },
  rider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.lg,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secLabel: { fontWeight: '700', letterSpacing: 0.8, marginTop: space.xl, marginBottom: space.xs, marginLeft: space.xs },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
})
