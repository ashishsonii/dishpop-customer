import { Ionicons } from '@expo/vector-icons'
import { useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DishCard } from '@/components/cards'
import { Txt } from '@/components/Txt'
import { useZone } from '@/context/ZoneContext'
import { dishesInZone } from '@/data/catalog'
import { radius, space, type, useTheme } from '@/theme/tokens'

export default function Search() {
  const t = useTheme()
  const { zone } = useZone()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const [q, setQ] = useState('')
  const cardW = (width - space.lg * 2 - space.md) / 2

  const all = zone ? dishesInZone(zone.id) : []
  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return all
    return all.filter(
      (d) =>
        d.item.name.toLowerCase().includes(query) ||
        d.brand.name.toLowerCase().includes(query) ||
        d.item.category.toLowerCase().includes(query),
    )
  }, [q, all])

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + space.sm }}>
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Ionicons name="search" size={18} color={t.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search dishes or brands"
            placeholderTextColor={t.textFaint}
            style={[styles.input, { color: t.text }]}
            returnKeyType="search"
            autoCorrect={false}
          />
          {q.length > 0 && (
            <Ionicons name="close-circle" size={18} color={t.textFaint} onPress={() => setQ('')} />
          )}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {results.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="fast-food-outline" size={40} color={t.textFaint} />
            <Txt style={[type.body, { color: t.textMuted, marginTop: space.sm }]}>
              No dishes match "{q}"
            </Txt>
          </View>
        ) : (
          <View style={styles.grid}>
            {results.map((d) => (
              <DishCard key={d.item.id} dish={d} width={cardW} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: space.lg, paddingBottom: space.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.md,
    height: 48,
  },
  input: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 14 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  empty: { alignItems: 'center', paddingTop: 80 },
})
