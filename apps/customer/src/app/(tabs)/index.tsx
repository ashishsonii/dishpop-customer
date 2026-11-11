import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { type ComponentRef, useEffect, useRef, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CartBar } from '@/components/CartBar'
import { BrandCard, DishCard } from '@/components/cards'
import { Txt } from '@/components/Txt'
import { Wordmark } from '@/components/Wordmark'
import { SectionHeader } from '@/components/ui'
import { useZone } from '@/context/ZoneContext'
import { brandsInZone, dishesInZone } from '@/data/catalog'
import { isZoneOpen } from '@/lib/zone'
import { radius, space, type, useTheme, type Theme } from '@/theme/tokens'

type Slide =
  | { kind: 'offer'; big: string; sub: string; chip: string }
  | { kind: 'fees' }
const SLIDES: Slide[] = [
  { kind: 'offer', big: '50% OFF', sub: 'on your first 3 orders', chip: 'CODE · FIRST50' },
  { kind: 'fees' },
]

// Auto-rotating offer banners (every 1300ms), swipeable, with page dots.
function HeroCarousel({ t, width }: { t: Theme; width: number }) {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null)
  const [idx, setIdx] = useState(0)
  const slideW = width - space.lg * 2
  const step = slideW + space.md

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => {
        const next = (prev + 1) % SLIDES.length
        ref.current?.scrollTo({ x: next * step, animated: true })
        return next
      })
    }, 3500)
    return () => clearInterval(id)
  }, [step])

  return (
    <View style={{ marginTop: space.md }}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: space.lg }}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / step))}
      >
        {SLIDES.map((s, i) => (
          <LinearGradient
            key={s.kind}
            colors={['#1A1A1F', t.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { width: slideW, marginRight: i < SLIDES.length - 1 ? space.md : 0 }]}
          >
            {s.kind === 'offer' ? (
              <>
                <View style={styles.heroMark} pointerEvents="none">
                  <Wordmark size={96} color="rgba(255,255,255,0.07)" />
                </View>
                <View style={styles.heroStamp} pointerEvents="none">
                  <Wordmark size={15} color="rgba(255,255,255,0.85)" />
                </View>
                <View style={{ flex: 1, marginTop: space.lg }}>
                  <Txt style={[type.display, { color: '#fff' }]}>{s.big}</Txt>
                  <Txt style={[type.body, { color: 'rgba(255,255,255,0.8)' }]}>{s.sub}</Txt>
                  <View style={styles.codeChip}>
                    <Ionicons name="pricetag" size={12} color="#fff" />
                    <Txt style={[type.tiny, { color: '#fff', letterSpacing: 1 }]}>{s.chip}</Txt>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.feesSlide}>
                <View style={styles.zeroHeroWrap}>
                  <Txt style={styles.zeroRupee}>₹</Txt>
                  <Txt style={styles.zeroDigit}>0</Txt>
                </View>
                <View style={[styles.zeroDiv, { backgroundColor: 'rgba(255,255,255,0.18)' }]} />
                <View style={{ gap: 9 }}>
                  {['Delivery Fee', 'Packaging Fee', 'Platform Fee'].map((label) => (
                    <View key={label} style={styles.feeRow}>
                      <Txt style={styles.feeZero}>₹0</Txt>
                      <Txt style={styles.feeLabel}>{label}</Txt>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </LinearGradient>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === idx ? t.brand : t.border, width: i === idx ? 18 : 6 }]} />
        ))}
      </View>
    </View>
  )
}

function hour12(h: number): string {
  const ap = h < 12 ? 'AM' : 'PM'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh} ${ap}`
}

export default function Home() {
  const t = useTheme()
  const { zone, address, status, refreshLocation } = useZone()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { width } = useWindowDimensions()

  const open = zone ? isZoneOpen(zone) : false
  const openLabel = zone ? `Opens ${hour12(zone.openHour)}` : 'Closed'
  const brands = zone ? brandsInZone(zone.id) : []
  const dishes = zone ? dishesInZone(zone.id) : []
  const cardW = (width - space.lg * 2 - space.md) / 2

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Location header */}
      <View style={[styles.header, { paddingTop: insets.top + space.sm, backgroundColor: t.bg }]}>
        <Pressable
          style={styles.locBtn}
          onPress={refreshLocation}
          accessibilityLabel="Change delivery location"
        >
          <View style={styles.locTop}>
            <Ionicons name="time" size={15} color={t.brand} />
            <Txt style={[type.h3, { color: t.text }]}>
              {open ? `Delivery in ${zone?.etaMinutes ?? '–'} min` : 'Currently closed'}
            </Txt>
          </View>
          <View style={styles.locBottom}>
            <Ionicons name="location-sharp" size={14} color={t.brand} />
            <Txt style={[type.small, { color: t.textMuted }]} numberOfLines={1}>
              {status === 'loading'
                ? 'Finding your location…'
                : status === 'denied'
                  ? 'Location off · tap to enable'
                  : (address ?? zone?.name ?? 'Select location')}
            </Txt>
            <Ionicons name="chevron-down" size={14} color={t.textMuted} />
          </View>
        </Pressable>
        <View style={[styles.credits, { backgroundColor: t.goldSoft, borderColor: t.gold }]}>
          <Ionicons name="wallet" size={14} color={t.gold} />
          <Txt style={[type.tiny, { color: t.gold }]}>₹150</Txt>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Auto-rotating offer carousel */}
        <HeroCarousel t={t} width={width} />

        {/* Brands — few, so full-width cards */}
        <SectionHeader>{brands.length > 1 ? 'OUR KITCHENS' : 'OUR KITCHEN'}</SectionHeader>
        <View style={{ paddingHorizontal: space.lg }}>
          {brands.length === 0 && (
            <Txt style={[type.body, { color: t.textMuted }]}>
              No brands are available here yet. We're expanding — check back soon.
            </Txt>
          )}
          {brands.map((b) => (
            <BrandCard
              key={b.id}
              brand={b}
              eta={zone!.etaMinutes}
              closedLabel={open ? null : openLabel}
            />
          ))}
        </View>

        {/* Full curated menu as a grid */}
        {dishes.length > 0 && (
          <>
            <SectionHeader>POPULAR RIGHT NOW</SectionHeader>
            <View style={styles.grid}>
              {dishes.map((d) => (
                <DishCard key={d.item.id} dish={d} width={cardW} />
              ))}
            </View>
          </>
        )}

        {/* FSSAI reassurance strip */}
        <View style={[styles.trust, { backgroundColor: t.surface }]}>
          <Ionicons name="shield-checkmark" size={16} color={t.success} />
          <Txt style={[type.small, { color: t.textMuted, flex: 1 }]}>
            Every kitchen is FSSAI-licensed. Full details on each brand's page.
          </Txt>
        </View>
      </ScrollView>
      <CartBar />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  locBtn: { flex: 1 },
  locTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locBottom: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  credits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: 6,
  },
  heroWrap: { paddingHorizontal: space.lg, marginTop: space.md },
  hero: {
    borderRadius: radius.lg,
    padding: space.xl,
    minHeight: 150,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heroMark: {
    position: 'absolute',
    right: -40,
    bottom: 2,
    transform: [{ rotate: '-4deg' }],
  },
  heroStamp: { position: 'absolute', top: space.lg, left: space.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: space.md },
  dot: { height: 6, borderRadius: 3 },
  feesSlide: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.lg },
  zeroHeroWrap: { flexDirection: 'row', alignItems: 'flex-start' },
  zeroRupee: { fontFamily: 'Poppins_700Bold', fontSize: 32, lineHeight: 36, color: '#fff', marginTop: 12 },
  zeroDigit: { fontFamily: 'Poppins_800ExtraBold', fontSize: 86, lineHeight: 88, color: '#fff', letterSpacing: -4 },
  zeroDiv: { width: StyleSheet.hairlineWidth, height: 72 },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  feeZero: { fontFamily: 'Poppins_800ExtraBold', fontSize: 16, color: '#fff' },
  feeLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.72)' },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: space.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    marginTop: space.sm,
    padding: space.md,
    borderRadius: radius.md,
  },
})
