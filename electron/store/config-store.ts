/**
 * Config Store
 * Manages persistent storage for application configuration using electron-store
 */

import type { AppConfig } from '@electron/ipc/types'
import Store from 'electron-store'

/** Schema for the config store */
type ConfigStoreSchema = {
	config: AppConfig
}

/** Config store instance with type-safe schema */
export const configStore = new Store<ConfigStoreSchema>({
	name: 'config',
	defaults: {
		config: {},
	},
})
