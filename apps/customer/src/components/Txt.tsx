import { Text, type TextProps, type TextStyle } from 'react-native'
import { fontFor } from '@/theme/fonts'

// Text wrapper that applies the correct Plus Jakarta Sans face for the weight,
// so typography is consistent everywhere. Use instead of raw <Text>.
export function Txt({ style, ...rest }: TextProps) {
  const flat = flatten(style)
  const weight = (flat.fontWeight as string) ?? '500'
  return (
    <Text
      {...rest}
      style={[{ fontFamily: fontFor(weight) }, style]}
      allowFontScaling
    />
  )
}

function flatten(style: TextProps['style']): TextStyle {
  if (!style) return {}
  if (Array.isArray(style)) {
    return style.reduce<TextStyle>((acc, s) => ({ ...acc, ...flatten(s as any) }), {})
  }
  return style as TextStyle
}
