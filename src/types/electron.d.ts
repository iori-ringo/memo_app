import type { NotePage } from './note'

interface AppConfig {
	theme?: 'light' | 'dark' | 'system'
	lastActivePageId?: string
	sidebarWidth?: number
}

interface ElectronAPI {
	loadPages: () => Promise<NotePage[] | null>
	savePages: (pages: NotePage[]) => Promise<boolean>
	loadConfig: () => Promise<AppConfig>
	saveConfig: (config: AppConfig) => Promise<boolean>
	onNewPage: (callback: () => void) => () => void
	onToggleDark: (callback: () => void) => () => void
	generateAbstraction: (fact: string) => Promise<string>
	generateDiversion: (fact: string, abstraction: string) => Promise<string>
	generateSummary: (content: string) => Promise<string>
}

declare global {
	interface Window {
		electronAPI?: ElectronAPI
	}
}

export type { AppConfig, ElectronAPI }
