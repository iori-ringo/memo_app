/**
 * Electron メインプロセスのエントリーポイント
 * アプリ起動〜終了までの流れを管理する
 */

import { registerDataHandlers } from '@electron/handlers/data-handlers'
import { initLogger, log } from '@electron/utils/logger'
import { createWindow } from '@electron/window/main-window'
import { app, BrowserWindow } from 'electron'

// 他の処理より先にロガーを準備（以降のログ出力を確実にするため）
initLogger()

// アプリの準備が完了したら起動処理を開始
app.whenReady().then(() => {
	log.info('App starting...')

	// レンダラー（React側）からの通信を受け取れるよう、先に IPC ハンドラーを登録
	registerDataHandlers()

	// アプリのメインウィンドウを表示
	createWindow()

	// macOS では Dock アイコンをクリックしたとき、ウィンドウがなければ再作成する
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

// 全ウィンドウを閉じたらアプリ終了（macOS はウィンドウを閉じてもアプリは残す慣習）
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
