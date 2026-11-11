import { View } from 'react-native'
import { Txt } from '@/components/Txt'
import { useTheme } from '@/theme/tokens'

// The DishPop wordmark: "dishp●p" — the o in pop is a solid dot.
// One lockup, reused in the splash, nav, and anywhere the brand appears.
export function Wordmark({
  size = 40,
  color,
}: {
  size?: number
  color?: string
}) {
  const t = useTheme()
  const c = color ?? t.text
  const dot = Math.round(size * 0.62)
  const letter = {
    fontSize: size,
    lineHeight: size,
    fontWeight: '800' as const,
    letterSpacing: -size * 0.05,
    color: c,
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Txt style={letter}>dishp</Txt>
      <View
        style={{
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: c,
          marginHorizontal: size * 0.02,
          marginBottom: size * 0.12,
        }}
      />
      <Txt style={letter}>p</Txt>
    </View>
  )
}
