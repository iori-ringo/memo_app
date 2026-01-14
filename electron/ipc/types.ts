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

// チャンネル名の型
export type IpcChannelName = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

// 設定の型
export interface AppConfig {
	theme?: 'light' | 'dark' | 'system'
	lastActivePageId?: string
	sidebarWidth?: number
}

// CanvasObject 型（src/types/note.ts と同期）
export interface CanvasObject {
	id: string
	type: 'text'
	section: 'title' | 'fact' | 'abstraction' | 'diversion'
	content: string
	x: number
	y: number
	width: number
	height: number
	style?: {
		color?: string
		fontSize?: number
		bold?: boolean
		italic?: boolean
	}
}

// Stroke 型
export interface Stroke {
	id: string
	points: { x: number; y: number; pressure?: number }[]
	color: string
	width: number
	isHighlighter: boolean
}

// Connection 型
export interface Connection {
	id: string
	fromObjectId: string
	toObjectId: string
	type: 'arrow' | 'line'
	style: 'solid' | 'dashed' | 'hand-drawn'
}

// NotePage 型（src/types/note.ts と同期）
export interface NotePage {
	id: string
	notebookId: string
	title: string
	tags: string[]
	createdAt: number
	updatedAt: number
	isFavorite?: boolean
	deletedAt?: number
	objects: CanvasObject[]
	strokes: Stroke[]
	connections: Connection[]
	layout?: {
		titleHeight?: number
		centerPosition?: number
		diversionPosition?: number
	}
	summary?: string
	fact?: string
	abstraction?: string
	diversion?: string
}

// ElectronAPI 型（window.electronAPI の型）
export interface ElectronAPI {
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
