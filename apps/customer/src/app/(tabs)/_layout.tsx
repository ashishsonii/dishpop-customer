import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFor } from '@/theme/fonts'
import { haptics } from '@/lib/haptics'
import { useTheme } from '@/theme/tokens'

export default function TabsLayout() {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  // Sit the bar above the gesture pill / nav buttons: content row is a fixed
  // ~56dp, then the device's bottom inset is added as clearance below it.
  const bottomInset = Math.max(insets.bottom, 8)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.brand,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
          backgroundColor: t.bg,
          borderTopColor: t.border,
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarLabelStyle: { fontFamily: fontFor('600'), fontSize: 11, marginTop: 2 },
      }}
      screenListeners={{ tabPress: () => haptics.tap() }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color as string} />
          ),
        }}
      />
    </Tabs>
  )
}
