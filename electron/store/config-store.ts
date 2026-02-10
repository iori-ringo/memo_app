/**
 * 設定ストア
 * electron-storeを使用してアプリケーション設定を永続化する
 */

import type { AppConfig } from '@electron/ipc/types'
import Store from 'electron-store'

/** 設定ストアのスキーマ定義 */
type ConfigStoreSchema = {
	config: AppConfig
}

/** 型安全なスキーマを持つ設定ストアのインスタンス */
export const configStore = new Store<ConfigStoreSchema>({
	name: 'config',
	defaults: {
		config: {},
	},
})
