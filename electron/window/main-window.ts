/**
 * メインウィンドウ管理
 * アプリケーションのメインウィンドウを生成・管理する
 */
import * as path from 'node:path'
import { createMenu } from '@electron/window/menu'
import { app, BrowserWindow, shell } from 'electron'

/** ウィンドウのデフォルトサイズ */
const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 800

/** 外部リンクで許可するURLスキーム */
const ALLOWED_EXTERNAL_SCHEMES = ['https:', 'mailto:']

/** メインウィンドウのインスタンス */
let mainWindow: BrowserWindow | null = null

/**
 * メインウィンドウのインスタンスを返す
 * @returns メインウィンドウ、未作成の場合はnull
 */
export function getMainWindow(): BrowserWindow | null {
	return mainWindow
}

/**
 * メインウィンドウを生成する
 */
export function createWindow(): void {
	const isDev = !app.isPackaged

	mainWindow = new BrowserWindow({
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT,
		webPreferences: {
			// 開発・本番の両環境で確実にパスを解決するためapp.getAppPath()を使用
			preload: path.join(app.getAppPath(), 'electron/dist/preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	})

	if (isDev) {
		mainWindow.loadURL('http://localhost:3000')
		mainWindow.webContents.openDevTools()
	} else {
		mainWindow.loadFile(path.join(app.getAppPath(), 'out/index.html'))
	}

	// 外部URLへのナビゲーションをブロック（セキュリティ対策）
	// 開発環境: localhostを許可、本番環境: file://プロトコルを許可
	mainWindow.webContents.on('will-navigate', (event, url) => {
		const isAllowed = isDev ? url.startsWith('http://localhost:3000') : url.startsWith('file://')
		if (!isAllowed) {
			event.preventDefault()
		}
	})

	// 許可されたスキームの外部リンクをブラウザで開く
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		try {
			const { protocol } = new URL(url)
			if (ALLOWED_EXTERNAL_SCHEMES.includes(protocol)) {
				shell.openExternal(url)
			}
		} catch {
			// 不正なURLは無視
		}
		return { action: 'deny' }
	})

	// ウィンドウ閉鎖時に参照をクリーンアップ
	mainWindow.on('closed', () => {
		mainWindow = null
	})

	createMenu()
}
