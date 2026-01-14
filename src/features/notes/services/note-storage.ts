import type { NotePage } from '@/types/note'

interface AppConfig {
	theme?: 'light' | 'dark' | 'system'
	lastActivePageId?: string
}

const STORAGE_KEYS = {
	PAGES: 'magic-notebook-pages',
	CONFIG: 'magic-notebook-config',
} as const

/**
 * ノートページをストレージから読み込む
 */
export const loadNotes = async (): Promise<{ pages: NotePage[]; config: AppConfig | null }> => {
	if (window.electronAPI) {
		try {
			const [savedPages, config] = await Promise.all([
				window.electronAPI.loadPages(),
				window.electronAPI.loadConfig(),
			])
			return { pages: savedPages || [], config: config || null }
		} catch (e) {
			console.error('Failed to load pages from Electron', e)
			return { pages: [], config: null }
		}
	}

	// ブラウザ環境（localStorage）
	try {
		const savedPages = localStorage.getItem(STORAGE_KEYS.PAGES)
		const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG)

		return {
			pages: savedPages ? JSON.parse(savedPages) : [],
			config: savedConfig ? JSON.parse(savedConfig) : null,
		}
	} catch (e) {
		console.error('Failed to load pages from localStorage', e)
		return { pages: [], config: null }
	}
}

/**
 * ノートページをストレージに保存する
 */
export const saveNotes = async (pages: NotePage[]): Promise<boolean> => {
	if (window.electronAPI) {
		try {
			await window.electronAPI.savePages(pages)
			return true
		} catch (e) {
			console.error('Failed to save pages to Electron', e)
			return false
		}
	}

	// ブラウザ環境（localStorage）
	try {
		localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages))
		return true
	} catch (e) {
		console.error('Failed to save pages to localStorage', e)
		return false
	}
}

/**
 * 設定を保存する
 */
export const saveConfig = async (config: AppConfig): Promise<boolean> => {
	if (window.electronAPI) {
		try {
			await window.electronAPI.saveConfig(config)
			return true
		} catch (e) {
			console.error('Failed to save config to Electron', e)
			return false
		}
	}

	// ブラウザ環境（localStorage）
	try {
		localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
		return true
	} catch (e) {
		console.error('Failed to save config to localStorage', e)
		return false
	}
}
