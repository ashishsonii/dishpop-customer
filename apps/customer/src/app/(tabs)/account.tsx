import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/Txt'
import { useAuth } from '@/context/AuthContext'
import { haptics } from '@/lib/haptics'
import { radius, space, type, useTheme, type Theme } from '@/theme/tokens'

type Icon = keyof typeof Ionicons.glyphMap

export default function Account() {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const signedIn = !!user

  function confirmSignOut() {
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => { haptics.tap(); signOut() } },
    ])
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: space.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile — flat, divider below */}
      <View style={[styles.profile, { borderBottomColor: t.border }]}>
        <View style={[styles.avatar, { backgroundColor: signedIn ? t.brand : t.surface, borderColor: t.border }]}>
          {signedIn ? (
            <Txt style={[type.h1, { color: '#fff' }]}>{(user!.name?.[0] ?? '+').toUpperCase()}</Txt>
          ) : (
            <Ionicons name="person" size={26} color={t.textMuted} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={[type.h1, { color: t.text }]}>{signedIn ? user!.name ?? 'DishPop user' : 'Guest'}</Txt>
          {signedIn ? (
            <Pressable onPress={() => { haptics.tap(); router.push('/account/profile') }} style={styles.editRow}>
              <Txt style={[type.small, { color: t.brand, fontWeight: '700' }]}>Edit profile</Txt>
              <Ionicons name="chevron-forward" size={13} color={t.brand} />
            </Pressable>
          ) : (
            <Txt style={[type.small, { color: t.textMuted, marginTop: 2 }]}>Sign in to save your orders</Txt>
          )}
        </View>
        {!signedIn && (
          <Pressable
            onPress={() => { haptics.press(); router.push('/auth/phone') }}
            style={({ pressed }) => [styles.signIn, { backgroundColor: pressed ? t.brandDark : t.brand }]}
          >
            <Txt style={[type.h3, { color: '#fff' }]}>Sign in</Txt>
          </Pressable>
        )}
      </View>

      {/* Referral banner */}
      <Pressable
        onPress={() => { haptics.tap(); router.push('/account/refer') }}
        style={({ pressed }) => [styles.banner, { backgroundColor: t.brand }, pressed && { opacity: 0.92 }]}
      >
        <View style={styles.bannerIcon}>
          <Ionicons name="gift" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={[type.h3, { color: '#fff' }]}>Refer & earn ₹500</Txt>
          <Txt style={[type.small, { color: 'rgba(255,255,255,0.7)' }]}>Give friends ₹100 off their first order</Txt>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
      </Pressable>

      {/* Credit / offers tiles */}
      <View style={styles.tiles}>
        <Tile icon="wallet-outline" label="DishPop credits" value="₹150" onPress={() => router.push('/account/credits')} t={t} />
        <Tile icon="pricetags-outline" label="Offers for you" value="2 new" onPress={() => router.push('/account/offers')} t={t} />
      </View>

      {/* Minimal, essential options only */}
      <View style={styles.list}>
        <Row icon="settings-outline" label="Settings & personalisation" onPress={() => router.push('/account/settings')} t={t} />
        <Row icon="receipt-outline" label="Your orders" onPress={() => router.push('/(tabs)/orders')} t={t} />
        <Row icon="card-outline" label="Saved payment methods" onPress={() => router.push('/account/payments')} t={t} />
        <Row icon="help-circle-outline" label="Help & support" onPress={() => router.push('/account/help')} t={t} />
      </View>

      {signedIn && (
        <Pressable onPress={confirmSignOut} style={({ pressed }) => [styles.logout, pressed && { opacity: 0.55 }]}>
          <Ionicons name="log-out-outline" size={19} color={t.nonVeg} />
          <Txt style={[type.h3, { color: t.nonVeg }]}>Log out</Txt>
        </Pressable>
      )}

      <Txt style={[type.tiny, { color: t.textFaint, textAlign: 'center', marginTop: space.xl }]}>
        DishPop · v0.1.0 · Made in India
      </Txt>
    </ScrollView>
  )
}

function Tile({ icon, label, value, onPress, t }: { icon: Icon; label: string; value: string; onPress?: () => void; t: Theme }) {
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress?.() }}
      style={({ pressed }) => [styles.tile, { backgroundColor: t.surface }, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name={icon} size={19} color={t.text} />
      <Txt style={[type.small, { color: t.textMuted, marginTop: space.sm }]}>{label}</Txt>
      <Txt style={[type.h3, { color: t.text }]}>{value}</Txt>
    </Pressable>
  )
}

function Row({ icon, label, value, onPress, t }: { icon: Icon; label: string; value?: string; onPress?: () => void; t: Theme }) {
  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress?.() }}
      android_ripple={{ color: t.surface }}
      style={({ pressed }) => [styles.row, { borderBottomColor: t.border }, pressed && { backgroundColor: t.surface }]}
    >
      <Ionicons name={icon} size={21} color={t.text} style={{ width: 30 }} />
      <Txt style={[type.body, { color: t.text, flex: 1, fontWeight: '600' }]}>{label}</Txt>
      {value && <Txt style={[type.body, { color: t.textMuted }]}>{value}</Txt>}
      <Ionicons name="chevron-forward" size={17} color={t.textFaint} style={{ marginLeft: space.sm }} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    marginBottom: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  signIn: { borderRadius: radius.md, paddingHorizontal: space.lg, paddingVertical: space.sm },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.lg,
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
  },
  bannerIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, marginTop: space.md },
  tile: { flex: 1, borderRadius: radius.lg, padding: space.lg },
  list: { marginTop: space.xl, paddingHorizontal: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.lg - 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.xl,
    paddingVertical: space.md,
  },
})
