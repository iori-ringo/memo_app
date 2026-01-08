import type { NotePage } from './note'

interface AppConfig {
	theme?: 'light' | 'dark' | 'system'
	lastActivePageId?: string
}

declare global {
	interface Window {
		electronAPI?: {
			loadPages: () => Promise<NotePage[]>
			savePages: (pages: NotePage[]) => Promise<boolean>
			loadConfig: () => Promise<AppConfig>
			saveConfig: (config: AppConfig) => Promise<boolean>
			onNewPage: (callback: () => void) => () => void
			onToggleDark: (callback: () => void) => () => void
			generateAbstraction: (fact: string) => Promise<string>
			generateDiversion: (fact: string, abstraction: string) => Promise<string>
			generateSummary: (content: string) => Promise<string>
		}
	}
}
