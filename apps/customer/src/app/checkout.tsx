import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { PrimaryButton } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { useOrders } from '@/context/OrdersContext'
import { useZone } from '@/context/ZoneContext'
import { getBrand } from '@/data/catalog'
import { haptics } from '@/lib/haptics'
import { rupees } from '@/lib/money'
import { radius, shadow, space, type, useTheme } from '@/theme/tokens'

const METHOD_LABEL: Record<string, string> = {
  upi: 'UPI',
  card: 'Card',
  cod: 'Cash on delivery',
}

type PayMethod = 'upi' | 'card' | 'cod'
const METHODS: { id: PayMethod; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: 'phone-portrait-outline' },
  { id: 'card', label: 'Card', sub: 'Credit / debit', icon: 'card-outline' },
  { id: 'cod', label: 'Cash on delivery', sub: 'Pay the rider', icon: 'cash-outline' },
]

export default function Checkout() {
  const t = useTheme()
  const { lines, brandId, totals, clear } = useCart()
  const { zone, address } = useZone()
  const { place } = useOrders()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [method, setMethod] = useState<PayMethod>('upi')
  const [placing, setPlacing] = useState(false)
  const bill = totals(zone)

  function placeOrder() {
    setPlacing(true)
    // Snapshot the order before clearing the cart.
    const items = lines.map((l) => ({ name: l.name, qty: l.qty }))
    const brandName = (brandId && getBrand(brandId)?.name) || 'DishPop'
    const payable = bill.payable
    const addr = address ?? zone?.name ?? 'Your location'
    const eta = zone?.etaMinutes ?? 30
    setTimeout(() => {
      setPlacing(false)
      haptics.success()
      const id = place({
        brandName,
        items,
        payable,
        address: addr,
        paymentMethod: METHOD_LABEL[method],
        etaMinutes: eta,
      })
      clear()
      router.replace(`/order/${id}`)
    }, 900)
  }

  if (lines.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <Txt style={[type.body, { color: t.textMuted }]}>Nothing to check out.</Txt>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <Step n={1} label="Delivery address" t={t} />
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
          <View style={styles.addrHead}>
            <Ionicons name="home" size={16} color={t.brand} />
            <Txt style={[type.h3, { color: t.text }]}>Home</Txt>
          </View>
          <Txt style={[type.body, { color: t.textMuted, marginTop: 2 }]}>
            {address ?? zone?.name ?? 'No address set'}
          </Txt>
          <View style={styles.etaRow}>
            <Ionicons name="time-outline" size={14} color={t.success} />
            <Txt style={[type.small, { color: t.success }]}>Arriving in ~{zone?.etaMinutes ?? '–'} min</Txt>
          </View>
        </View>

        <Step n={2} label="Payment method" t={t} />
        {METHODS.map((m) => {
          const on = method === m.id
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                haptics.tap()
                setMethod(m.id)
              }}
              style={[styles.method, { borderColor: on ? t.brand : t.border, backgroundColor: on ? t.brandSoft : t.card }]}
            >
              <Ionicons name={m.icon} size={20} color={on ? t.brand : t.textMuted} />
              <View style={{ flex: 1 }}>
                <Txt style={[type.h3, { color: t.text }]}>{m.label}</Txt>
                <Txt style={[type.small, { color: t.textMuted }]}>{m.sub}</Txt>
              </View>
              <View style={[styles.radio, { borderColor: on ? t.brand : t.textFaint }]}>
                {on && <View style={[styles.radioDot, { backgroundColor: t.brand }]} />}
              </View>
            </Pressable>
          )
        })}

        <Step n={3} label="Summary" t={t} />
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
          <Sum label="Item total" value={rupees(bill.itemTotal)} t={t} />
          <Sum label="Taxes & fees" value={rupees(bill.packagingFee + bill.deliveryFee + bill.tax)} t={t} />
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <View style={styles.sumRow}>
            <Txt style={[type.h3, { color: t.text }]}>To pay</Txt>
            <Txt style={[type.h3, { color: t.text }]}>{rupees(bill.payable)}</Txt>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: t.bg, borderTopColor: t.border, paddingBottom: insets.bottom + space.md }]}>
        <PrimaryButton
          label={method === 'cod' ? 'Place order' : `Pay ${rupees(bill.payable)}`}
          onPress={placeOrder}
          loading={placing}
          icon={method === 'cod' ? 'checkmark-circle' : 'lock-closed'}
        />
      </View>
    </View>
  )
}

function Step({ n, label, t }: { n: number; label: string; t: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepNum, { backgroundColor: t.brand }]}>
        <Txt style={[type.tiny, { color: '#fff' }]}>{n}</Txt>
      </View>
      <Txt style={[type.h3, { color: t.text }]}>{label}</Txt>
    </View>
  )
}

function Sum({ label, value, t }: { label: string; value: string; t: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.sumRow}>
      <Txt style={[type.body, { color: t.textMuted }]}>{label}</Txt>
      <Txt style={[type.body, { color: t.text }]}>{value}</Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xl, marginBottom: space.md },
  stepNum: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  card: { padding: space.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  addrHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.sm },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: space.sm,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
  footer: { padding: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
})
