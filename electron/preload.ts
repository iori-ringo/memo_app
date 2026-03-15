/**
 * Preload スクリプト
 *
 * sandbox: true 環境では require でカスタムモジュールを読み込めないため、
 * IPCチャンネル名はここで直接定義する（ipc/types.ts と同期を保つこと）
 *
 * 注意: import type はコンパイル時に除去されるため sandbox でも安全に使用可能
 */
import { contextBridge, type IpcRendererEvent, ipcRenderer } from 'electron'

import type { AppConfig, NotePage } from './ipc/types'

// sandbox 環境では外部モジュールの require が制限されるため、定数をインライン定義
const IPC_CHANNELS = {
	LOAD_PAGES: 'load-pages',
	SAVE_PAGES: 'save-pages',
	LOAD_CONFIG: 'load-config',
	SAVE_CONFIG: 'save-config',
	NEW_PAGE: 'new-page',
	TOGGLE_DARK: 'toggle-dark',
} as const

contextBridge.exposeInMainWorld('electronAPI', {
	loadPages: (): Promise<NotePage[] | null> => ipcRenderer.invoke(IPC_CHANNELS.LOAD_PAGES),
	savePages: (pages: NotePage[]): Promise<boolean> =>
		ipcRenderer.invoke(IPC_CHANNELS.SAVE_PAGES, pages),
	loadConfig: (): Promise<AppConfig> => ipcRenderer.invoke(IPC_CHANNELS.LOAD_CONFIG),
	saveConfig: (config: AppConfig): Promise<boolean> =>
		ipcRenderer.invoke(IPC_CHANNELS.SAVE_CONFIG, config),
	onNewPage: (callback: () => void): (() => void) => {
		const subscription = (_event: IpcRendererEvent) => callback()
		ipcRenderer.on(IPC_CHANNELS.NEW_PAGE, subscription)
		return () => ipcRenderer.removeListener(IPC_CHANNELS.NEW_PAGE, subscription)
	},
	onToggleDark: (callback: () => void): (() => void) => {
		const subscription = (_event: IpcRendererEvent) => callback()
		ipcRenderer.on(IPC_CHANNELS.TOGGLE_DARK, subscription)
		return () => ipcRenderer.removeListener(IPC_CHANNELS.TOGGLE_DARK, subscription)
	},
})
