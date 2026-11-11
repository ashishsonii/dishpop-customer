import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CartBar } from '@/components/CartBar'
import { Txt } from '@/components/Txt'
import { AddStepper, IconButton, RatingPill, Tag, VegDot } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { useZone } from '@/context/ZoneContext'
import {
  getBrand,
  kitchenForBrandInZone,
  menuForBrandInZone,
  type MenuItemView,
} from '@/data/catalog'
import { brandImage, dishImage } from '@/data/images'
import { rupees } from '@/lib/money'
import { radius, shadow, space, type, useTheme } from '@/theme/tokens'

export default function BrandPage() {
  const t = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { zone } = useZone()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { simpleQty, incSimple, decSimple, addLine } = useCart()
  const [vegOnly, setVegOnly] = useState(false)

  const brand = getBrand(id)
  if (!brand || !zone) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <Txt style={[type.body, { color: t.textMuted }]}>This brand isn't available here.</Txt>
      </View>
    )
  }
  const kitchen = kitchenForBrandInZone(brand.id, zone.id)
  let menu = menuForBrandInZone(brand.id, zone.id)
  if (vegOnly) {
    menu = menu
      .map((g) => ({ ...g, items: g.items.filter((v) => v.item.veg === 'veg') }))
      .filter((g) => g.items.length > 0)
  }

  function onAdd(v: MenuItemView) {
    if (v.item.addonGroups.length > 0) {
      router.push(`/item/${v.item.id}`)
      return
    }
    addLine({
      itemId: v.item.id,
      brandId: brand!.id,
      name: v.item.name,
      veg: v.item.veg,
      unitPrice: v.price,
      mrp: v.mrp,
      addons: [],
      qty: 1,
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View>
          <Image source={brandImage(brand.id)} style={styles.banner} />
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
          <View style={[styles.heroTop, { top: insets.top + space.sm }]}>
            <IconButton name="arrow-back" onPress={() => router.back()} label="Go back" float />
            <IconButton name="heart-outline" onPress={() => {}} label="Save brand" float />
          </View>
          <View style={styles.heroText}>
            <Txt style={[type.display, { color: '#fff' }]}>{brand.name}</Txt>
            <Txt style={[type.body, { color: 'rgba(255,255,255,0.9)' }]}>{brand.cuisine}</Txt>
          </View>
        </View>

        {/* Meta strip */}
        <View style={[styles.metaStrip, { backgroundColor: t.card, borderColor: t.border }, shadow.card]}>
          <RatingPill rating={brand.rating} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={15} color={t.textMuted} />
            <Txt style={[type.small, { color: t.text }]}>{zone.etaMinutes} min</Txt>
          </View>
          <View style={[styles.vDiv, { backgroundColor: t.border }]} />
          <Txt style={[type.small, { color: t.textMuted, flex: 1 }]}>
            Min order {rupees(zone.minOrderValue)}
          </Txt>
        </View>

        {/* Veg filter */}
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setVegOnly((v) => !v)}
            style={[
              styles.vegToggle,
              { borderColor: vegOnly ? t.veg : t.border, backgroundColor: vegOnly ? t.successSoft : t.card },
            ]}
          >
            <VegDot veg="veg" size={15} />
            <Txt style={[type.small, { color: t.text }]}>Veg only</Txt>
          </Pressable>
        </View>

        {/* Menu */}
        {menu.map((group) => (
          <View key={group.category}>
            <Txt style={[type.h3, styles.catTitle, { color: t.text }]}>
              {group.category}  ·  {group.items.length}
            </Txt>
            {group.items.map((v) => {
              const qty = simpleQty(v.item.id)
              const discounted = v.mrp > v.price
              return (
                <View key={v.item.id} style={[styles.row, { borderBottomColor: t.border }]}>
                  <View style={{ flex: 1, paddingRight: space.md }}>
                    <VegDot veg={v.item.veg} />
                    <Txt style={[type.h3, { color: t.text, marginTop: space.xs }]}>{v.item.name}</Txt>
                    <View style={styles.priceRow}>
                      <Txt style={[type.body, { color: t.text, fontWeight: '700' }]}>{rupees(v.price)}</Txt>
                      {discounted && (
                        <Txt style={[type.small, { color: t.textFaint, textDecorationLine: 'line-through' }]}>
                          {rupees(v.mrp)}
                        </Txt>
                      )}
                    </View>
                    {v.item.tags.length > 0 && (
                      <View style={styles.tags}>
                        {v.item.tags.map((tag) => (
                          <Tag key={tag} tag={tag} />
                        ))}
                      </View>
                    )}
                    <Txt style={[type.small, { color: t.textMuted, marginTop: space.xs }]} numberOfLines={2}>
                      {v.item.description}
                    </Txt>
                  </View>
                  <View style={styles.imgWrap}>
                    <Image source={dishImage(v.item.id)} style={styles.itemImg} />
                    <View style={styles.rowAdd}>
                      {v.available ? (
                        <AddStepper
                          qty={qty}
                          onAdd={() => onAdd(v)}
                          onInc={() => incSimple(v.item.id)}
                          onDec={() => decSimple(v.item.id)}
                          extendable={v.item.addonGroups.length > 0}
                        />
                      ) : (
                        <View style={[styles.soldOut, { backgroundColor: t.surface, borderColor: t.border }]}>
                          <Txt style={[type.small, { color: t.textMuted, fontWeight: '600' }]}>Sold out</Txt>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        ))}

        {/* FSSAI disclosure */}
        {kitchen && (
          <View style={[styles.disclosure, { backgroundColor: t.surface }]}>
            <View style={styles.discHead}>
              <Ionicons name="shield-checkmark" size={16} color={t.success} />
              <Txt style={[type.small, { color: t.text, fontWeight: '700' }]}>Food preparation & licensing</Txt>
            </View>
            <Txt style={[type.small, { color: t.textMuted }]}>
              Prepared in a licensed cloud kitchen by {kitchen.legalName}.
            </Txt>
            <Txt style={[type.small, { color: t.textMuted }]}>FSSAI Lic. No. {kitchen.fssaiLicenseNo}</Txt>
          </View>
        )}
      </ScrollView>
      <CartBar />
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: { width: '100%', height: 240, backgroundColor: '#ccc' },
  heroTop: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroText: { position: 'absolute', left: space.lg, bottom: space.xl, right: space.lg },
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.lg,
    marginTop: -space.xl,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vDiv: { width: StyleSheet.hairlineWidth, height: 18 },
  filterRow: { flexDirection: 'row', paddingHorizontal: space.lg, marginTop: space.lg },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 6,
  },
  catTitle: {
    paddingHorizontal: space.lg,
    marginTop: space.xl,
    marginBottom: space.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 2 },
  tags: { flexDirection: 'row', gap: space.xs, marginTop: space.sm },
  imgWrap: { width: 112, alignItems: 'center' },
  itemImg: { width: 112, height: 100, borderRadius: radius.md, backgroundColor: '#eee' },
  rowAdd: { position: 'absolute', bottom: -18 },
  soldOut: {
    minWidth: 96,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclosure: { margin: space.lg, padding: space.lg, borderRadius: radius.md },
  discHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
})
