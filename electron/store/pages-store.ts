/**
 * ページストア
 * electron-storeを使用してNotePageデータを永続化する
 */

import type { NotePage } from '@electron/ipc/types'
import Store from 'electron-store'

/** ページストアのスキーマ定義 */
type PagesStoreSchema = {
	pages: NotePage[]
}

/** 型安全なスキーマを持つページストアのインスタンス */
export const pagesStore = new Store<PagesStoreSchema>({
	name: 'pages-store',
	defaults: {
		pages: [],
	},
})
