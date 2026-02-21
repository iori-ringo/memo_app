/**
 * アプリケーションメニュー
 * macOSネイティブメニューの構成を定義する
 */

import { IPC_CHANNELS } from '@electron/ipc/types'
import { getMainWindow } from '@electron/window/main-window'
import { app, Menu } from 'electron'

/**
 * アプリケーションメニューを生成・設定する
 */
export function createMenu(): void {
	const template: Electron.MenuItemConstructorOptions[] = [
		{
			label: app.name,
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideOthers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' },
			],
		},
		{
			label: 'ファイル',
			submenu: [
				{
					label: '新規ページ',
					accelerator: 'CmdOrCtrl+M',
					click: () => getMainWindow()?.webContents.send(IPC_CHANNELS.NEW_PAGE),
				},
				{ type: 'separator' },
				{ role: 'close' },
			],
		},
		{
			label: '編集',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				{ role: 'selectAll' },
			],
		},
		{
			label: '表示',
			submenu: [
				{ role: 'reload' },
				{ role: 'forceReload' },
				{ role: 'toggleDevTools' },
				{ type: 'separator' },
				{ role: 'resetZoom' },
				{ role: 'zoomIn' },
				{ role: 'zoomOut' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
				{
					label: 'ダークモード切替',
					click: () => getMainWindow()?.webContents.send(IPC_CHANNELS.TOGGLE_DARK),
				},
			],
		},
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}
