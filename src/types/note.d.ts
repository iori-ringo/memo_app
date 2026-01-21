/**
 * ノート関連のグローバル型定義
 *
 * キャンバス関連の型（CanvasObject, Stroke, Connection）は
 * features/notebook/types.ts で定義され、後方互換性のためここから再エクスポート。
 */

// キャンバス関連の型を再エクスポート
export type { SectionType, CanvasObject, Stroke, Connection } from '@/features/notebook/types'

export type NoteContent = string // TipTap からの HTML 文字列

export type NotePage = {
	id: string
	notebookId: string
	title: string // Keep title as metadata, but also have it as an object?
	// The plan says "Title area". Let's keep a main title field for the sidebar list,
	// but the visual title on the page might be an object or a specific field.
	// Let's keep `title` for the list.
	tags: string[]
	createdAt: number
	updatedAt: number
	isFavorite?: boolean
	deletedAt?: number // For Trash functionality

	// New Canvas Data
	objects: CanvasObject[]
	strokes: Stroke[]
	connections: Connection[]

	// レイアウト設定（セクション境界）
	layout?: {
		titleHeight?: number // パーセンテージ 0-100
		centerPosition?: number // パーセンテージ 0-100
		diversionPosition?: number // パーセンテージ 0-100
	}
}

export type Notebook = {
	id: string
	name: string
	pages: NotePage[]
	createdAt: number
	updatedAt: number
}

export type AppState = {
	notebooks: Notebook[]
	activeNotebookId: string
	activePageId: string | null
}

// --- Electron / App Configuration Types (Shared) ---

export type AppConfig = {
	theme?: 'light' | 'dark' | 'system'
	lastActivePageId?: string
	sidebarWidth?: number
}

export type ElectronAPI = {
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
