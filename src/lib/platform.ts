/**
 * プラットフォーム判定ユーティリティ
 *
 * Electron / Web 環境の判定を一元化し、
 * 各モジュールでの `window.electronAPI` チェックの重複を排除する
 */

import type { ElectronAPI } from '@/types/note'

/**
 * 現在の実行環境が Electron かどうかを判定する
 * SSR（サーバーサイドレンダリング）環境では常に false を返す
 */
export const isElectron = (): boolean => {
	return typeof window !== 'undefined' && !!window.electronAPI
}

/**
 * Electron API を安全に取得する
 * Electron環境でない場合は null を返す
 */
export const getElectronAPI = (): ElectronAPI | null => {
	if (typeof window !== 'undefined' && window.electronAPI) {
		return window.electronAPI
	}
	return null
}
