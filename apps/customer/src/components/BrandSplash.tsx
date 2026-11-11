import { useEffect, useRef, useState } from 'react'
import { Animated, ImageBackground, StyleSheet } from 'react-native'
import { Txt } from '@/components/Txt'
import { Wordmark } from '@/components/Wordmark'
import { type } from '@/theme/tokens'

const INK = '#0B0B0E'
const shutter = require('../../assets/images/shutter.png')

// Full-screen branded open screen shown on launch, then fades away. Renders in
// Expo Go (unlike the native splash), so the brand shows on every cold start.
// Uses a detailed corrugated-shutter texture behind the wordmark.
export function BrandSplash({ onDone }: { onDone?: () => void }) {
  const [gone, setGone] = useState(false)
  const opacity = useRef(new Animated.Value(1)).current
  const rise = useRef(new Animated.Value(14)).current
  const logoFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Logo eases in, holds long enough to read, then the screen fades out.
    Animated.parallel([
      Animated.timing(logoFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start()
    const hold = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        setGone(true)
        onDone?.()
      })
    }, 3400)
    return () => clearTimeout(hold)
  }, [opacity, rise, logoFade, onDone])

  if (gone) return null
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, { opacity }]}>
      <ImageBackground source={shutter} resizeMode="cover" style={styles.bg}>
        <Animated.View
          style={{ alignItems: 'center', opacity: logoFade, transform: [{ translateY: rise }] }}
        >
          <Wordmark size={48} color="#FFFFFF" />
          <Txt style={[type.small, styles.tagline]}>your brands, delivered</Txt>
        </Animated.View>
      </ImageBackground>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: INK, zIndex: 100 },
  bg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tagline: { color: '#9A9AA2', marginTop: 13, letterSpacing: 0.3 },
})
