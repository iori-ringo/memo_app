/**
 * プラットフォームイベントアダプター
 * Electron固有のイベントリスナーをWeb環境でも動作するように抽象化
 *
 * このアダプターにより、以下の両方の環境でアプリケーションが動作します:
 * - Electron: ネイティブIPCイベントを使用
 * - Webブラウザ: 何もしない関数を返す（将来的にキーボードショートカットの追加が可能）
 */

import { getElectronAPI } from '@/lib/platform'

type CleanupFn = () => void

/**
 * プラットフォームに依存しないイベントハンドラー
 * Electron環境を自動検出し、適切な実装を提供します
 */
export const platformEvents = {
	/**
	 * 新規ページ作成イベントのリスナーを登録
	 * Electron: メニューから発火（Cmd+M）
	 * Web: 何もしない（将来的にキーボードショートカットの追加が可能）
	 */
	onNewPage: (callback: () => void): CleanupFn => {
		const api = getElectronAPI()
		if (api) {
			return api.onNewPage(callback)
		}
		// Web環境では何もしない
		return () => {
			/* クリーンアップ不要 */
		}
	},

	/**
	 * ダークモード切り替えイベントのリスナーを登録
	 * Electron: メニューから発火
	 * Web: 何もしない（テーマ切り替えはUIボタンで処理）
	 */
	onToggleDark: (callback: () => void): CleanupFn => {
		const api = getElectronAPI()
		if (api) {
			return api.onToggleDark(callback)
		}
		// Web環境では何もしない
		return () => {
			/* クリーンアップ不要 */
		}
	},
}
