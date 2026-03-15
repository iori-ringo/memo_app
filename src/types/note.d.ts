/**
 * ノート関連のグローバル型定義
 *
 * キャンバス関連の型（CanvasObject, Connection）は
 * features/notebook/types.ts で定義され、後方互換性のためここから再エクスポート。
 */

// キャンバス関連の型を再エクスポート
export type { CanvasObject, Connection, SectionType } from '@/features/notebook/types'

export type NoteContent = string // TipTap からの HTML 文字列

export type NotePage = {
	id: string
	notebookId: string
	title: string // サイドバーのリスト表示用のタイトル
	tags: string[]
	createdAt: number
	updatedAt: number
	isFavorite?: boolean
	deletedAt?: number // ゴミ箱機能用

	// キャンバスデータ
	objects: CanvasObject[]
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

// --- Electron / アプリケーション設定の型（共有） ---

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
}
