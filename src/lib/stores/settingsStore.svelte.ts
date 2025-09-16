import type { Settings } from '$lib/db/schema'
import data from '../../seed.json'

// Create reactive state using $state
export const settings = $state<Settings>(data.settings as Settings)

// Export getter function to access settings
export function getSettings() {
  return settings
}

export const loadSettings = () => {
  // Update the existing settings object
  Object.assign(settings, data.settings)
}
