import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { PrimaryButton, VegDot } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import { useZone } from '@/context/ZoneContext'
import { items, offerings } from '@/data/mock'
import { dishImage } from '@/data/images'
import { rupees } from '@/lib/money'
import { radius, space, type, useTheme } from '@/theme/tokens'

export default function ItemDetail() {
  const t = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { zone } = useZone()
  const { addLine } = useCart()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const item = items.find((i) => i.id === id)
  const offering = offerings.find((o) => o.itemId === id && o.zoneId === zone?.id)
  const [selected, setSelected] = useState<Record<string, Set<string>>>({})

  if (!item || !offering) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <Txt style={[type.body, { color: t.textMuted }]}>Item unavailable.</Txt>
      </View>
    )
  }

  function toggle(groupId: string, optionId: string, single: boolean) {
    setSelected((prev) => {
      const set = new Set(prev[groupId] ?? [])
      if (single) {
        set.clear()
        set.add(optionId)
      } else {
        set.has(optionId) ? set.delete(optionId) : set.add(optionId)
      }
      return { ...prev, [groupId]: set }
    })
  }

  const chosenAddons = useMemo(() => {
    const out: { optionId: string; name: string; price: number }[] = []
    for (const g of item.addonGroups) {
      for (const optId of selected[g.id] ?? []) {
        const opt = g.options.find((o) => o.id === optId)
        if (opt) out.push({ optionId: opt.id, name: opt.name, price: opt.price })
      }
    }
    return out
  }, [item, selected])

  const unmet = item.addonGroups.filter((g) => g.min > 0 && (selected[g.id]?.size ?? 0) < g.min)
  const addonTotal = chosenAddons.reduce((s, a) => s + a.price, 0)

  function add() {
    addLine({
      itemId: item!.id,
      brandId: item!.brandId,
      name: item!.name,
      veg: item!.veg,
      unitPrice: offering!.price,
      mrp: offering!.mrp,
      addons: chosenAddons,
      qty: 1,
    })
    router.back()
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View>
          <Image source={dishImage(item.id)} style={styles.img} />
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Close"
            style={[styles.close, { top: insets.top + space.sm }]}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.body}>
          <VegDot veg={item.veg} />
          <Txt style={[type.h1, { color: t.text, marginTop: space.sm }]}>{item.name}</Txt>
          <Txt style={[type.h3, { color: t.text, marginTop: 2 }]}>{rupees(offering.price)}</Txt>
          <Txt style={[type.body, { color: t.textMuted, marginTop: space.sm }]}>{item.description}</Txt>

          {item.addonGroups.map((g) => {
            const single = g.max === 1
            return (
              <View key={g.id} style={styles.group}>
                <Txt style={[type.h3, { color: t.text }]}>{g.name}</Txt>
                <Txt style={[type.small, { color: g.min > 0 ? t.brand : t.textMuted, marginBottom: space.sm }]}>
                  {g.min > 0 ? 'Required · ' : 'Optional · '}
                  {single ? 'choose 1' : `up to ${g.max}`}
                </Txt>
                {g.options.map((o) => {
                  const on = selected[g.id]?.has(o.id) ?? false
                  return (
                    <Pressable
                      key={o.id}
                      onPress={() => toggle(g.id, o.id, single)}
                      style={[styles.option, { borderBottomColor: t.border }]}
                    >
                      <View
                        style={[
                          styles.box,
                          single && { borderRadius: 11 },
                          { borderColor: on ? t.brand : t.textFaint, backgroundColor: on ? t.brand : 'transparent' },
                        ]}
                      >
                        {on && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>
                      <Txt style={[type.body, { color: t.text, flex: 1 }]}>{o.name}</Txt>
                      <Txt style={[type.small, { color: t.textMuted }]}>+ {rupees(o.price)}</Txt>
                    </Pressable>
                  )
                })}
              </View>
            )
          })}
        </View>
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: t.bg, borderTopColor: t.border, paddingBottom: insets.bottom + space.md }]}>
        <PrimaryButton
          label={unmet.length ? `Select ${unmet[0].name}` : `Add item · ${rupees(offering.price + addonTotal)}`}
          onPress={add}
          disabled={unmet.length > 0}
          icon={unmet.length ? undefined : 'bag-add'}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: 240, backgroundColor: '#eee' },
  close: {
    position: 'absolute',
    right: space.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: space.lg },
  group: { marginTop: space.xl },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  box: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    marginRight: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { padding: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
})
