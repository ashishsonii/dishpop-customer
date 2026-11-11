import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { Txt } from '@/components/Txt'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme } from '@/theme/tokens'
import type { ItemTag, VegClass } from '@/types/models'

// Veg / non-veg / egg marker.
export function VegDot({ veg, size = 16 }: { veg: VegClass; size?: number }) {
  const t = useTheme()
  const c = veg === 'veg' ? t.veg : veg === 'egg' ? t.egg : t.nonVeg
  const inner = Math.round(size * 0.5)
  return (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: 1.5,
        borderRadius: 3,
        borderColor: c,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: c }} />
    </View>
  )
}

const tagLabel: Record<ItemTag, string> = {
  bestseller: 'Bestseller',
  new: 'New',
  spicy: 'Spicy',
  popular: 'Popular',
}

const tagIcon: Record<ItemTag, keyof typeof Ionicons.glyphMap> = {
  bestseller: 'star',
  new: 'sparkles',
  spicy: 'flame',
  popular: 'trending-up',
}

// Minimal label — bold text + small icon, no chip.
export function Tag({ tag }: { tag: ItemTag }) {
  const t = useTheme()
  return (
    <View style={s.tag}>
      <Ionicons name={tagIcon[tag]} size={11} color={t.text} />
      <Txt style={[type.tiny, { color: t.text, letterSpacing: 0.4 }]}>
        {tagLabel[tag].toUpperCase()}
      </Txt>
    </View>
  )
}

// Green rating pill with star.
export function RatingPill({ rating }: { rating: number }) {
  const t = useTheme()
  return (
    <View style={[s.rating, { backgroundColor: t.brand }]}>
      <Ionicons name="star" size={11} color="#fff" />
      <Txt style={[type.tiny, { color: '#fff' }]}>{rating.toFixed(1)}</Txt>
    </View>
  )
}

export function SectionHeader({ children }: { children: string }) {
  const t = useTheme()
  return (
    <View style={s.sectionHead}>
      <Txt style={[type.small, s.sectionText, { color: t.textMuted }]}>{children}</Txt>
      <View style={[s.sectionRule, { backgroundColor: t.border }]} />
    </View>
  )
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  icon?: keyof typeof Ionicons.glyphMap
}) {
  const t = useTheme()
  return (
    <Pressable
      onPress={() => {
        haptics.press()
        onPress()
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: disabled ? t.textFaint : pressed ? t.brandDark : t.brand },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={s.btnRow}>
          {icon && <Ionicons name={icon} size={18} color={t.onBrand} />}
          <Txt style={[type.h3, { color: t.onBrand, fontWeight: '700' }]}>{label}</Txt>
        </View>
      )}
    </Pressable>
  )
}

// ADD button that flips to a ± stepper once qty > 0.
export function AddStepper({
  qty,
  onAdd,
  onInc,
  onDec,
  extendable,
}: {
  qty: number
  onAdd: () => void
  onInc: () => void
  onDec: () => void
  extendable?: boolean // item has add-ons → "ADD +"
}) {
  const t = useTheme()
  if (qty === 0) {
    return (
      <Pressable
        onPress={() => {
          haptics.tap()
          onAdd()
        }}
        accessibilityRole="button"
        accessibilityLabel="Add to cart"
        style={({ pressed }) => [
          s.add,
          { backgroundColor: t.card, borderColor: t.border },
          pressed && { backgroundColor: t.brandSoft },
        ]}
      >
        <Txt style={[type.h3, { color: t.brand, fontWeight: '700' }]}>
          ADD{extendable ? '  +' : ''}
        </Txt>
      </Pressable>
    )
  }
  return (
    <View style={[s.add, s.stepper, { backgroundColor: t.brand, borderColor: t.brand }]}>
      <Pressable
        onPress={() => {
          haptics.tap()
          onDec()
        }}
        hitSlop={8}
        style={s.stepBtn}
        accessibilityLabel="Decrease"
      >
        <Ionicons name="remove" size={18} color="#fff" />
      </Pressable>
      <Txt style={[type.h3, { color: '#fff', fontWeight: '700', minWidth: 20, textAlign: 'center' }]}>
        {qty}
      </Txt>
      <Pressable
        onPress={() => {
          haptics.tap()
          onInc()
        }}
        hitSlop={8}
        style={s.stepBtn}
        accessibilityLabel="Increase"
      >
        <Ionicons name="add" size={18} color="#fff" />
      </Pressable>
    </View>
  )
}

// Circular icon button for headers (back, etc.).
export function IconButton({
  name,
  onPress,
  label,
  float,
}: {
  name: keyof typeof Ionicons.glyphMap
  onPress: () => void
  label: string
  float?: boolean
}) {
  const t = useTheme()
  return (
    <Pressable
      onPress={() => {
        haptics.tap()
        onPress()
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        s.iconBtn,
        { backgroundColor: float ? 'rgba(0,0,0,0.45)' : t.surface },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={name} size={20} color={float ? '#fff' : t.text} />
    </Pressable>
  )
}

const s = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    marginTop: space.xl,
    marginBottom: space.md,
  },
  sectionText: { fontWeight: '700', letterSpacing: 0.8 },
  sectionRule: { flex: 1, height: StyleSheet.hairlineWidth },
  btn: {
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  add: {
    minWidth: 104,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.sm },
  stepBtn: { paddingHorizontal: space.sm, height: '100%', justifyContent: 'center' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
