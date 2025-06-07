import { writable } from 'svelte/store'
import data from '../../seed.json'
import type { Settings } from '../../global'

export const settings = writable<Settings>()

export const loadSettings = () => {
  settings.set(data.settings)
}
