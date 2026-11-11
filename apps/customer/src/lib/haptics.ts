import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

// Thin haptics wrapper. All calls are fire-and-forget and no-op on web, so
// screens can call them freely without awaiting or guarding.
const on = Platform.OS !== 'web'

export const haptics = {
  // Light tick for ordinary taps (add, stepper, select, nav).
  tap() {
    if (on) Haptics.selectionAsync().catch(() => {})
  },
  // Slightly firmer press for primary actions.
  press() {
    if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
  },
  // Confirmation buzz for success (order placed).
  success() {
    if (on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
  },
  // Warning for blocked / invalid actions.
  warn() {
    if (on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
  },
}
