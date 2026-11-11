import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { PrimaryButton, VegDot } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { useZone } from '@/context/ZoneContext'
import { dishesInZone, type MenuItemView } from '@/data/catalog'
import { dishImage } from '@/data/images'
import { haptics } from '@/lib/haptics'
import { rupees } from '@/lib/money'
import { radius, shadow, space, type, useTheme, type Theme } from '@/theme/tokens'
import type { Brand } from '@/types/models'

export default function Cart() {
  const t = useTheme()
  const { lines, setQty, totals, coupon, addLine, useCredits, setUseCredits, tip, setTip } = useCart()
  const { zone } = useZone()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const bill = totals(zone)

  // Suggestions: available dishes in the zone not already in the cart.
  const suggestions = useMemo(() => {
    if (!zone) return []
    const inCart = new Set(lines.map((l) => l.itemId))
    return dishesInZone(zone.id).filter((d) => d.available && !inCart.has(d.item.id)).slice(0, 6)
  }, [zone, lines])

  if (lines.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <View style={[styles.iconCircle, { backgroundColor: t.brandSoft }]}>
          <Ionicons name="bag-handle-outline" size={32} color={t.brand} />
        </View>
        <Txt style={[type.h2, { color: t.text, marginTop: space.lg }]}>Your cart is empty</Txt>
        <Txt style={[type.body, { color: t.textMuted, marginTop: space.xs }]}>
          Add items from a brand to get started.
        </Txt>
      </View>
    )
  }

  const belowMin = zone ? bill.itemTotal < zone.minOrderValue : false

  function addDish(d: MenuItemView & { brand: Brand }) {
    if (d.item.addonGroups.length > 0) {
      router.push(`/item/${d.item.id}`)
      return
    }
    haptics.tap()
    addLine({ itemId: d.item.id, brandId: d.brand.id, name: d.item.name, veg: d.item.veg, unitPrice: d.price, mrp: d.mrp, addons: [], qty: 1 })
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 170 }} showsVerticalScrollIndicator={false}>
        {/* Savings strip */}
        {bill.savings > 0 && (
          <View style={[styles.savings, { backgroundColor: t.successSoft }]}>
            <Ionicons name="pricetag" size={15} color={t.success} />
            <Txt style={[type.body, { color: t.success, fontWeight: '700' }]}>
              You're saving {rupees(bill.savings)} on this order
            </Txt>
          </View>
        )}

        {/* Free-fees promo banner — three columns */}
        {bill.feesWaived && (
          <View style={[styles.zeroBanner, { backgroundColor: t.brand }]}>
            {[
              { cap: 'DELIVERY', base: bill.deliveryFeeBase },
              { cap: 'PACKAGING', base: bill.packagingFeeBase },
              { cap: 'PLATFORM', base: 1000 },
            ].map((f, i) => (
              <View key={f.cap} style={styles.zcol}>
                {i > 0 && <View style={styles.zdiv} />}
                <Txt style={styles.zcap}>{f.cap}</Txt>
                <Txt style={styles.zbig}>₹0</Txt>
                {f.base > 0 && <Txt style={styles.zstruck}>{rupees(f.base)}</Txt>}
              </View>
            ))}
          </View>
        )}

        {/* Items */}
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
          {lines.map((l, i) => {
            const addonTotal = l.addons.reduce((s, a) => s + a.price, 0)
            return (
              <View key={l.lineId} style={[styles.line, i < lines.length - 1 && { borderBottomColor: t.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <VegDot veg={l.veg} />
                <View style={{ flex: 1, marginLeft: space.sm }}>
                  <Txt style={[type.h3, { color: t.text }]}>{l.name}</Txt>
                  {l.addons.map((a) => (
                    <Txt key={a.optionId} style={[type.tiny, { color: t.textMuted }]}>+ {a.name}</Txt>
                  ))}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 2 }}>
                    <Txt style={[type.body, { color: t.text, fontWeight: '700' }]}>
                      {rupees((l.unitPrice + addonTotal) * l.qty)}
                    </Txt>
                    {l.mrp && l.mrp > l.unitPrice && (
                      <Txt style={[type.small, { color: t.textFaint, textDecorationLine: 'line-through' }]}>
                        {rupees((l.mrp + addonTotal) * l.qty)}
                      </Txt>
                    )}
                  </View>
                </View>
                <View style={[styles.stepper, { borderColor: t.brand }]}>
                  <Pressable onPress={() => { haptics.tap(); setQty(l.lineId, l.qty - 1) }} hitSlop={6} style={styles.stepBtn}>
                    <Ionicons name="remove" size={16} color={t.brand} />
                  </Pressable>
                  <Txt style={[type.body, { color: t.brand, fontWeight: '700', minWidth: 18, textAlign: 'center' }]}>{l.qty}</Txt>
                  <Pressable onPress={() => { haptics.tap(); setQty(l.lineId, l.qty + 1) }} hitSlop={6} style={styles.stepBtn}>
                    <Ionicons name="add" size={16} color={t.brand} />
                  </Pressable>
                </View>
              </View>
            )
          })}
        </View>

        {/* Complete your meal */}
        {suggestions.length > 0 && (
          <View style={{ marginTop: space.xl }}>
            <Txt style={[type.h3, { color: t.text, marginBottom: space.md }]}>Complete your meal</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((d) => (
                <View key={d.item.id} style={[styles.sugg, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
                  <Image source={dishImage(d.item.id)} style={styles.suggImg} />
                  <View style={{ padding: space.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <VegDot veg={d.item.veg} size={12} />
                      <Txt style={[type.small, { color: t.text, fontWeight: '600', flex: 1 }]} numberOfLines={1}>{d.item.name}</Txt>
                    </View>
                    <View style={styles.suggBottom}>
                      <Txt style={[type.small, { color: t.text, fontWeight: '700' }]}>{rupees(d.price)}</Txt>
                      <Pressable onPress={() => addDish(d)} style={[styles.suggAdd, { borderColor: t.brand }]}>
                        <Ionicons name="add" size={16} color={t.brand} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Coupon */}
        <CouponBox t={t} />

        {/* Tip the rider */}
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border, marginTop: space.lg, padding: space.lg }, shadow.card]}>
          <Txt style={[type.h3, { color: t.text }]}>Tip your rider</Txt>
          <Txt style={[type.small, { color: t.textMuted, marginBottom: space.md }]}>100% of the tip goes to your delivery partner</Txt>
          <View style={styles.tipRow}>
            {[0, 1000, 2000, 5000].map((amt) => {
              const on = tip === amt
              return (
                <Pressable
                  key={amt}
                  onPress={() => { haptics.tap(); setTip(amt) }}
                  style={[styles.tipChip, { borderColor: on ? t.brand : t.border, backgroundColor: on ? t.brand : t.card }]}
                >
                  <Txt style={[type.small, { color: on ? '#fff' : t.text, fontWeight: '700' }]}>
                    {amt === 0 ? 'No tip' : rupees(amt)}
                  </Txt>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Apply credits */}
        <Pressable
          onPress={() => { haptics.tap(); setUseCredits(!useCredits) }}
          style={[styles.credits, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}
        >
          <Ionicons name="wallet-outline" size={20} color={t.text} />
          <View style={{ flex: 1 }}>
            <Txt style={[type.h3, { color: t.text }]}>Apply DishPop credits</Txt>
            <Txt style={[type.small, { color: t.textMuted }]}>₹150 available</Txt>
          </View>
          <View style={[styles.check, { borderColor: useCredits ? t.brand : t.textFaint, backgroundColor: useCredits ? t.brand : 'transparent' }]}>
            {useCredits && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        </Pressable>

        {/* Bill */}
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border, marginTop: space.lg, padding: space.lg }, shadow.card]}>
          <Txt style={[type.h3, { color: t.text, marginBottom: space.sm }]}>Bill details</Txt>
          <Row label="Item total" value={rupees(bill.itemTotal)} t={t} />
          <Row
            label="Delivery fee"
            value={bill.deliveryFee === 0 ? 'FREE' : rupees(bill.deliveryFee)}
            strike={bill.feesWaived && bill.deliveryFeeBase > 0 ? rupees(bill.deliveryFeeBase) : undefined}
            free={bill.deliveryFee === 0}
            t={t}
          />
          <Row
            label="Packaging fee"
            value={bill.packagingFee === 0 ? 'FREE' : rupees(bill.packagingFee)}
            strike={bill.feesWaived && bill.packagingFeeBase > 0 ? rupees(bill.packagingFeeBase) : undefined}
            free={bill.packagingFee === 0}
            t={t}
          />
          <Row label="GST" value={rupees(bill.tax)} t={t} />
          {bill.discount > 0 && <Row label={`Coupon (${coupon})`} value={`– ${rupees(bill.discount)}`} t={t} discount />}
          {bill.tip > 0 && <Row label="Rider tip" value={rupees(bill.tip)} t={t} />}
          {bill.credits > 0 && <Row label="DishPop credits" value={`– ${rupees(bill.credits)}`} t={t} discount />}
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <Row label="To pay" value={rupees(bill.payable)} t={t} bold />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: t.bg, borderTopColor: t.border, paddingBottom: insets.bottom + space.md }]}>
        {belowMin && zone && (
          <View style={styles.minWarn}>
            <Ionicons name="alert-circle" size={14} color={t.textMuted} />
            <Txt style={[type.small, { color: t.textMuted }]}>
              Add {rupees(zone.minOrderValue - bill.itemTotal)} more to reach the {rupees(zone.minOrderValue)} minimum.
            </Txt>
          </View>
        )}
        <PrimaryButton label={`Proceed to pay · ${rupees(bill.payable)}`} onPress={() => router.push('/checkout')} disabled={belowMin} />
      </View>
    </View>
  )
}

// Coupon apply with a celebratory discount animation.
function CouponBox({ t }: { t: Theme }) {
  const { coupon, applyCoupon, removeCoupon, totals } = useCart()
  const { zone } = useZone()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const saved = totals(zone).discount

  // Savings strip animation.
  const pop = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (coupon && saved > 0) {
      pop.setValue(0)
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start()
    }
  }, [coupon, saved, pop])

  function onApply(c: string) {
    const res = applyCoupon(c)
    if (res.ok) {
      haptics.success()
      setOpen(false)
      setCode('')
      setError(null)
    } else {
      haptics.warn()
      setError(res.message)
    }
  }

  if (coupon && saved > 0) {
    return (
      <Animated.View
        style={[
          styles.couponApplied,
          { borderColor: t.success, backgroundColor: t.successSoft, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] },
        ]}
      >
        <Ionicons name="pricetag" size={18} color={t.success} />
        <View style={{ flex: 1 }}>
          <Txt style={[type.h3, { color: t.success }]}>'{coupon}' applied</Txt>
          <Txt style={[type.small, { color: t.success }]}>You saved {rupees(saved)} on this order</Txt>
        </View>
        <Pressable onPress={() => { haptics.tap(); removeCoupon() }} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={t.success} />
        </Pressable>
      </Animated.View>
    )
  }

  return (
    <View style={[styles.coupon, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
      <Pressable onPress={() => { haptics.tap(); setOpen((o) => !o) }} style={styles.couponHead}>
        <Ionicons name="pricetags-outline" size={20} color={t.text} />
        <Txt style={[type.h3, { color: t.text, flex: 1 }]}>Apply coupon</Txt>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={t.textFaint} />
      </Pressable>

      {open && (
        <View style={styles.couponBody}>
          <View style={[styles.couponInputRow, { borderColor: error ? t.nonVeg : t.border }]}>
            <TextInput
              value={code}
              onChangeText={(v) => { setCode(v.toUpperCase()); setError(null) }}
              placeholder="Enter code"
              placeholderTextColor={t.textFaint}
              autoCapitalize="characters"
              style={[styles.couponInput, { color: t.text }]}
            />
            <Pressable onPress={() => onApply(code)} disabled={!code}>
              <Txt style={[type.h3, { color: code ? t.brand : t.textFaint }]}>APPLY</Txt>
            </Pressable>
          </View>
          {error && <Txt style={[type.small, { color: t.nonVeg, marginTop: 6 }]}>{error}</Txt>}
          {/* Suggested coupon */}
          <Pressable onPress={() => onApply('FIRST50')} style={[styles.offerRow, { borderColor: t.border }]}>
            <Ionicons name="ticket-outline" size={16} color={t.text} />
            <View style={{ flex: 1 }}>
              <Txt style={[type.small, { color: t.text, fontWeight: '700' }]}>FIRST50</Txt>
              <Txt style={[type.tiny, { color: t.textMuted }]}>50% off your first 3 orders, up to ₹150</Txt>
            </View>
            <Txt style={[type.small, { color: t.brand, fontWeight: '700' }]}>APPLY</Txt>
          </Pressable>
        </View>
      )}
    </View>
  )
}

function Row({ label, value, t, bold, free, discount, strike }: { label: string; value: string; t: Theme; bold?: boolean; free?: boolean; discount?: boolean; strike?: string }) {
  const color = discount || free ? t.success : t.text
  return (
    <View style={styles.billRow}>
      <Txt style={[bold ? type.h3 : type.body, { color: bold ? t.text : t.textMuted }]}>{label}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        {strike && <Txt style={[type.small, { color: t.textFaint, textDecorationLine: 'line-through' }]}>{strike}</Txt>}
        <Txt style={[bold ? type.h3 : type.body, { color, fontWeight: bold || free ? '700' : '500' }]}>{value}</Txt>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  savings: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, marginBottom: space.md },
  zeroBanner: { flexDirection: 'row', borderRadius: radius.lg, paddingVertical: space.lg, marginBottom: space.lg },
  zcol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  zdiv: { position: 'absolute', left: 0, top: '12%', height: '76%', width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.16)' },
  zcap: { fontFamily: 'Poppins_700Bold', fontSize: 10, letterSpacing: 1, color: 'rgba(255,255,255,0.55)' },
  zbig: { fontFamily: 'Poppins_800ExtraBold', fontSize: 32, lineHeight: 40, color: '#fff' },
  zstruck: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecorationLine: 'line-through' },
  tipRow: { flexDirection: 'row', gap: space.sm },
  tipChip: { flex: 1, alignItems: 'center', borderWidth: 1, borderRadius: radius.md, paddingVertical: space.sm },
  credits: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: space.lg },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.lg },
  line: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: space.md },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md },
  stepBtn: { paddingHorizontal: space.sm, paddingVertical: 6 },
  sugg: { width: 140, marginRight: space.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  suggImg: { width: '100%', height: 90, backgroundColor: '#eee' },
  suggBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  suggAdd: { width: 28, height: 28, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  coupon: { marginTop: space.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: space.lg },
  couponHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  couponBody: { marginTop: space.md },
  couponInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.md, height: 46 },
  couponInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 14, letterSpacing: 1 },
  offerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md, borderWidth: StyleSheet.hairlineWidth, borderStyle: 'dashed', borderRadius: radius.md, padding: space.md },
  couponApplied: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg, borderRadius: radius.lg, borderWidth: 1, padding: space.lg },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
  footer: { padding: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
  minWarn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.sm },
})
