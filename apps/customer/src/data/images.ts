// Bundled food photos, so images never depend on the network. Mapped by id.
// Replace these with each brand's real dish photography later.
import type { ImageSourcePropType } from 'react-native'

const dish: Record<string, ImageSourcePropType> = {
  'i-paneer-thali': require('../../assets/food/paneer-thali.jpg'),
  'i-chicken-bowl': require('../../assets/food/chicken-bowl.jpg'),
  'i-classic-burger': require('../../assets/food/classic-burger.jpg'),
  'i-fries': require('../../assets/food/fries.jpg'),
}

const brand: Record<string, ImageSourcePropType> = {
  'b-box30': require('../../assets/food/box30-banner.jpg'),
  'b-mojopop': require('../../assets/food/mojopop-banner.jpg'),
}

export function dishImage(id: string): ImageSourcePropType | undefined {
  return dish[id]
}
export function brandImage(id: string): ImageSourcePropType | undefined {
  return brand[id]
}
