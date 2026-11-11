import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { BrandSplash } from '@/components/BrandSplash'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { OrdersProvider } from '@/context/OrdersContext'
import { ZoneProvider } from '@/context/ZoneContext'
import { fontMap } from '@/theme/fonts'
import { useTheme } from '@/theme/tokens'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const t = useTheme()
  const [loaded] = useFonts(fontMap)

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ZoneProvider>
          <OrdersProvider>
          <CartProvider>
            <StatusBar style={t.isDark ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: t.bg },
                headerShadowVisible: false,
                headerTintColor: t.text,
                headerTitleStyle: { fontFamily: 'Poppins_700Bold', color: t.text },
                contentStyle: { backgroundColor: t.bg },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="brand/[id]" options={{ headerShown: false }} />
              <Stack.Screen
                name="item/[id]"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen name="cart" options={{ title: 'Your cart' }} />
              <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
              <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="account/profile" options={{ title: 'Edit profile' }} />
              <Stack.Screen name="account/settings" options={{ title: 'Settings' }} />
              <Stack.Screen name="account/payments" options={{ title: 'Payment methods' }} />
              <Stack.Screen name="account/help" options={{ title: 'Help & support' }} />
              <Stack.Screen name="account/refer" options={{ title: 'Refer & earn' }} />
              <Stack.Screen name="account/credits" options={{ title: 'DishPop credits' }} />
              <Stack.Screen name="account/offers" options={{ title: 'Offers' }} />
              <Stack.Screen
                name="auth/phone"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen
                name="auth/verify"
                options={{ presentation: 'modal', headerShown: false }}
              />
            </Stack>
            <BrandSplash />
          </CartProvider>
          </OrdersProvider>
          </ZoneProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
