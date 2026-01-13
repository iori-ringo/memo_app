/**
 * Application Menu
 * Defines the native macOS menu structure
 */

import { IPC_CHANNELS } from '@electron/ipc/types'
import { getMainWindow } from '@electron/window/main-window'
import { app, Menu } from 'electron'

/**
 * Creates and sets the application menu
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
			label: 'File',
			submenu: [
				{
					label: 'New Page',
					accelerator: 'CmdOrCtrl+M',
					click: () => getMainWindow()?.webContents.send(IPC_CHANNELS.NEW_PAGE),
				},
				{ type: 'separator' },
				{ role: 'close' },
			],
		},
		{
			label: 'Edit',
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
			label: 'View',
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
					label: 'Toggle Dark Mode',
					click: () => getMainWindow()?.webContents.send(IPC_CHANNELS.TOGGLE_DARK),
				},
			],
		},
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}
