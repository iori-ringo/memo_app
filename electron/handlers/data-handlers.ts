/**
 * データ関連のIPCハンドラー
 * ページデータと設定の読み込み・保存操作を処理する
 */

import { type AppConfig, IPC_CHANNELS, type NotePage } from '@electron/ipc/types'
import { configStore } from '@electron/store/config-store'
import { pagesStore } from '@electron/store/pages-store'
import { log } from '@electron/utils/logger'
import { isValidAppConfig, isValidPages } from '@electron/utils/validators'
import { ipcMain } from 'electron'

/**
 * データ関連の全IPCハンドラーを登録する
 * アプリ初期化時に一度だけ呼び出す
 */
export function registerDataHandlers(): void {
	// ページデータの読み込み
	ipcMain.handle(IPC_CHANNELS.LOAD_PAGES, async (): Promise<NotePage[] | null> => {
		try {
			const pages = pagesStore.get('pages')
			log.info('Loaded pages data', { count: pages?.length ?? 0 })
			return pages
		} catch (e) {
			log.error('Failed to load pages', e)
			return null
		}
	})

	// ページデータの保存
	ipcMain.handle(IPC_CHANNELS.SAVE_PAGES, async (_event, pages: unknown): Promise<boolean> => {
		if (!isValidPages(pages)) {
			log.warn('Invalid pages format received', { type: typeof pages })
			return false
		}
		try {
			pagesStore.set('pages', pages)
			log.info('Saved pages data', { count: pages.length })
			return true
		} catch (e) {
			log.error('Failed to save pages', e)
			return false
		}
	})

	// アプリ設定の読み込み
	ipcMain.handle(IPC_CHANNELS.LOAD_CONFIG, async (): Promise<AppConfig> => {
		try {
			const config = configStore.get('config')
			log.info('Loaded config')
			return config
		} catch (e) {
			log.error('Failed to load config', e)
			return {}
		}
	})

	// アプリ設定の保存（既存設定とマージ）
	ipcMain.handle(IPC_CHANNELS.SAVE_CONFIG, async (_event, config: unknown): Promise<boolean> => {
		if (!isValidAppConfig(config)) {
			log.warn('Invalid config format received', { type: typeof config })
			return false
		}
		try {
			const existingConfig = configStore.get('config')
			const newConfig = { ...existingConfig, ...config }
			configStore.set('config', newConfig)
			log.info('Saved config')
			return true
		} catch (e) {
			log.error('Failed to save config', e)
			return false
		}
	})
}
