import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins'

// Font map passed to useFonts(). Poppins — the standard, clean Indian food-app
// face. Keys match the fontFamily tokens / fontFor() weights.
export const fontMap = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
}

const byWeight: Record<string, string> = {
  '400': 'Poppins_400Regular',
  '500': 'Poppins_500Medium',
  '600': 'Poppins_600SemiBold',
  '700': 'Poppins_700Bold',
  '800': 'Poppins_800ExtraBold',
}

export function fontFor(weight?: string): string {
  return byWeight[weight ?? '500'] ?? 'Poppins_500Medium'
}
