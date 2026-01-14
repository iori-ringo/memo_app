import type { AppConfig, ElectronAPI } from './note'

// note.d.ts からインポートした型をグローバル拡張に使用
declare global {
	interface Window {
		electronAPI?: ElectronAPI
	}
}

export type { AppConfig, ElectronAPI }
