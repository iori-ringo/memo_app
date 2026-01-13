/**
 * Pages Store
 * Manages persistent storage for NotePage data using electron-store
 */

import type { NotePage } from '@electron/ipc/types'
import Store from 'electron-store'

/** Schema for the pages store */
interface PagesStoreSchema {
	pages: NotePage[]
}

/** Pages store instance with type-safe schema */
export const pagesStore = new Store<PagesStoreSchema>({
	name: 'pages-store',
	defaults: {
		pages: [],
	},
})
