// IPCチャンネル名を定数として定義
export const IPC_CHANNELS = {
	LOAD_PAGES: 'load-pages',
	SAVE_PAGES: 'save-pages',
	LOAD_CONFIG: 'load-config',
	SAVE_CONFIG: 'save-config',
	NEW_PAGE: 'new-page',
	TOGGLE_DARK: 'toggle-dark',
	GENERATE_ABSTRACTION: 'generate-abstraction',
	GENERATE_DIVERSION: 'generate-diversion',
	GENERATE_SUMMARY: 'generate-summary',
} as const

// 設定の型
export interface AppConfig {
	theme?: 'light' | 'dark' | 'system'
	lastActivePageId?: string
}

// チャンネル名の型
export type IpcChannelName = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
