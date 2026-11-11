import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { Txt } from '@/components/Txt'
import { AddStepper, RatingPill, Tag, VegDot } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { brandImage, dishImage } from '@/data/images'
import { rupees } from '@/lib/money'
import { radius, shadow, space, type, useTheme } from '@/theme/tokens'
import type { Brand, BrandItem } from '@/types/models'

export interface DishView {
  item: BrandItem
  price: number
  mrp: number
  available: boolean
  brand: Brand
}

// Full-width brand card — works well with just 1–2 brands at launch.
export function BrandCard({
  brand,
  eta,
  closedLabel,
  subtitle,
}: {
  brand: Brand
  eta: number
  closedLabel?: string | null
  subtitle?: string
}) {
  const t = useTheme()
  const router = useRouter()
  return (
    <Pressable
      onPress={() => router.push(`/brand/${brand.id}`)}
      style={({ pressed }) => [
        styles.brandCard,
        { backgroundColor: t.card, borderColor: t.border },
        shadow.card,
        pressed && { opacity: 0.95 },
      ]}
    >
      <View>
        <Image source={brandImage(brand.id)} style={styles.brandBanner} />
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'transparent', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.brandRatingWrap}>
          <RatingPill rating={brand.rating} />
        </View>
        {closedLabel && (
          <View style={styles.closedPill}>
            <Ionicons name="moon" size={12} color="#fff" />
            <Txt style={[type.tiny, { color: '#fff' }]}>{closedLabel}</Txt>
          </View>
        )}
        <View style={styles.brandOverlay}>
          <Txt style={[type.h1, styles.brandName]}>{brand.name}</Txt>
          <Txt style={[type.small, styles.brandCuisine]}>{brand.cuisine}</Txt>
        </View>
      </View>
      <View style={styles.brandFooter}>
        <View style={styles.brandMeta}>
          <Ionicons name="time-outline" size={15} color={t.textMuted} />
          <Txt style={[type.small, { color: t.text }]}>{eta} min</Txt>
        </View>
        <View style={[styles.dot, { backgroundColor: t.textFaint }]} />
        <Txt style={[type.small, { color: t.textMuted, flex: 1 }]} numberOfLines={1}>
          {subtitle ?? brand.tagline}
        </Txt>
        <Ionicons name="chevron-forward" size={16} color={t.textFaint} />
      </View>
    </Pressable>
  )
}

// Dish card for the 2-column curated grid — the whole short menu on the home.
export function DishCard({ dish, width }: { dish: DishView; width: number }) {
  const t = useTheme()
  const router = useRouter()
  const { simpleQty, incSimple, decSimple, addLine } = useCart()
  const hasAddons = dish.item.addonGroups.length > 0
  const qty = simpleQty(dish.item.id)
  const discounted = dish.mrp > dish.price

  function onAdd() {
    if (hasAddons) {
      router.push(`/item/${dish.item.id}`)
      return
    }
    addLine({
      itemId: dish.item.id,
      brandId: dish.brand.id,
      name: dish.item.name,
      veg: dish.item.veg,
      unitPrice: dish.price,
      mrp: dish.mrp,
      addons: [],
      qty: 1,
    })
  }

  return (
    <View style={[styles.dishCard, { width, backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
      <View>
        <Image source={dishImage(dish.item.id)} style={styles.dishImg} />
        <View style={styles.dishVeg}>
          <VegDot veg={dish.item.veg} size={15} />
        </View>
        <View style={styles.dishAdd}>
          {dish.available ? (
            <AddStepper
              qty={qty}
              onAdd={onAdd}
              onInc={() => incSimple(dish.item.id)}
              onDec={() => decSimple(dish.item.id)}
              extendable={hasAddons}
            />
          ) : (
            <View style={[styles.soldOut, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Txt style={[type.small, { color: t.textMuted, fontWeight: '600' }]}>Sold out</Txt>
            </View>
          )}
        </View>
      </View>
      <View style={styles.dishBody}>
        {dish.item.tags[0] && (
          <View style={{ marginBottom: 2 }}>
            <Tag tag={dish.item.tags[0]} />
          </View>
        )}
        <Txt style={[type.h3, { color: t.text, fontWeight: '600' }]} numberOfLines={2}>
          {dish.item.name}
        </Txt>
        <Txt style={[type.tiny, { color: t.textMuted }]} numberOfLines={1}>
          {dish.brand.name}
        </Txt>
        <View style={styles.dishPriceRow}>
          <Txt style={[type.body, { color: t.text, fontWeight: '700' }]}>{rupees(dish.price)}</Txt>
          {discounted && (
            <Txt style={[type.small, { color: t.textFaint, textDecorationLine: 'line-through' }]}>
              {rupees(dish.mrp)}
            </Txt>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  brandCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: space.lg,
  },
  brandBanner: { width: '100%', height: 170, backgroundColor: '#3a3a3a' },
  brandRatingWrap: { position: 'absolute', top: space.md, right: space.md },
  closedPill: {
    position: 'absolute',
    top: space.md,
    left: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  brandOverlay: { position: 'absolute', left: space.lg, bottom: space.md, right: space.lg },
  brandName: {
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  brandCuisine: {
    color: 'rgba(255,255,255,0.92)',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  brandFooter: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  brandMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 3, height: 3, borderRadius: 2 },
  dishCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: space.lg,
  },
  dishImg: { width: '100%', height: 130, backgroundColor: '#eee' },
  dishVeg: {
    position: 'absolute',
    top: space.sm,
    left: space.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 4,
    padding: 2,
  },
  dishTag: { position: 'absolute', top: space.sm, right: space.sm },
  dishAdd: { position: 'absolute', bottom: -18, right: space.sm },
  soldOut: {
    minWidth: 92,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishBody: { padding: space.md, paddingTop: space.lg + 2 },
  dishPriceRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
})
