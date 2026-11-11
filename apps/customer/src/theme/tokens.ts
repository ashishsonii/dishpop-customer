// DishPop design tokens — CRED / EatClub-style monochrome.
// Two colours do the work: near-black and white, with a clean grey ramp for
// structure. The only hues are the functional food markers (veg / non-veg),
// which a food app must show. No decorative colour.

const palette = {
  black: '#0E0E10', // primary "brand" ink (buttons, pills)
  blackPress: '#000000',
  ink: '#232328', // headings / body — soft off-black, not harsh
  grey600: '#6B6B73', // muted / secondary text
  grey400: '#9A9AA2', // faint text / placeholders
  grey300: '#C9C9CF',
  grey200: '#E6E6E9', // borders
  grey100: '#F1F1F3', // tints / chips
  grey50: '#F8F8F9', // surfaces
  white: '#FFFFFF',
  // Functional only (food markers + states)
  veg: '#1A7F37',
  nonVeg: '#C5221F',
  egg: '#B07A00',
  success: '#1A7F37',
  successSoft: '#E7F4EC',
}

export interface Theme {
  bg: string
  surface: string
  card: string
  text: string
  textMuted: string
  textFaint: string
  border: string
  brand: string
  brandDark: string
  brandSoft: string
  brandBorder: string
  gold: string // secondary accent — monochrome here
  goldSoft: string
  veg: string
  nonVeg: string
  egg: string
  success: string
  successSoft: string
  onBrand: string
  overlay: string
  isDark: boolean
}

export const lightTheme: Theme = {
  bg: palette.white,
  surface: palette.grey50,
  card: palette.white,
  text: palette.ink,
  textMuted: palette.grey600,
  textFaint: palette.grey400,
  border: palette.grey200,
  brand: palette.black,
  brandDark: palette.blackPress,
  brandSoft: palette.grey100,
  brandBorder: palette.grey200,
  gold: palette.ink, // tags / credits read as monochrome ink
  goldSoft: palette.grey100,
  veg: palette.veg,
  nonVeg: palette.nonVeg,
  egg: palette.egg,
  success: palette.success,
  successSoft: palette.successSoft,
  onBrand: palette.white,
  overlay: 'rgba(14,14,16,0.55)',
  isDark: false,
}

// Fixed to the clean monochrome light theme.
export function useTheme(): Theme {
  return lightTheme
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 }

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 }

export const icon = { sm: 18, md: 22, lg: 26 }

export const type = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  h1: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  h3: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  bodyReg: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  tiny: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const },
}

export const fontFamily = {
  '400': 'Poppins_400Regular',
  '500': 'Poppins_500Medium',
  '600': 'Poppins_600SemiBold',
  '700': 'Poppins_700Bold',
  '800': 'Poppins_800ExtraBold',
}

export const shadow = {
  card: {
    shadowColor: '#0E0E10',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  float: {
    shadowColor: '#0E0E10',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
}

export const motion = { fast: 120, base: 200, slow: 300 }
