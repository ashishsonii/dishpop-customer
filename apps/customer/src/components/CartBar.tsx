import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { useCart } from '@/context/CartContext'
import { useZone } from '@/context/ZoneContext'
import { haptics } from '@/lib/haptics'
import { rupees } from '@/lib/money'
import { radius, shadow, space, type, useTheme } from '@/theme/tokens'

// Sticky bar shown once the cart has items.
export function CartBar() {
  const t = useTheme()
  const { count, totals } = useCart()
  const { zone } = useZone()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  if (count === 0) return null
  const { payable } = totals(zone)
  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + space.sm }]}>
      <Pressable
        onPress={() => {
          haptics.tap()
          router.push('/cart')
        }}
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${count} items, ${rupees(payable)}`}
        style={({ pressed }) => [
          styles.bar,
          { backgroundColor: pressed ? t.brandDark : t.brand },
          shadow.float,
        ]}
      >
        <View style={styles.left}>
          <Ionicons name="bag-handle" size={20} color="#fff" />
          <Txt style={[type.body, { color: '#fff', fontWeight: '700' }]}>
            {count} {count === 1 ? 'item' : 'items'}
          </Txt>
        </View>
        <View style={styles.right}>
          <Txt style={[type.h3, { color: '#fff' }]}>View cart · {rupees(payable)}</Txt>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  bar: {
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
})
