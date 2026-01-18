export type NoteContent = string // HTML string from Tiptap

export type SectionType = 'title' | 'fact' | 'abstraction' | 'diversion'

export type CanvasObject = {
	id: string
	type: 'text'
	section: SectionType
	content: string
	x: number // Percentage 0-100 relative to the section or page? Let's say relative to the page for simplicity, or section.
	// The plan said "relative coordinates (%) or absolute (px)".
	// Let's use absolute px relative to the page container for now, or relative to section.
	// To keep it simple and robust against resize, let's use absolute for now, but maybe relative is better for responsive.
	// Let's stick to the plan: "x: number, y: number".
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

export type Stroke = {
	id: string
	points: { x: number; y: number; pressure?: number }[]
	color: string
	width: number
	isHighlighter: boolean
}

export type Connection = {
	id: string
	fromObjectId: string
	toObjectId: string
	type: 'arrow' | 'line'
	style: 'solid' | 'dashed' | 'hand-drawn'
}

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

	// Layout preferences (section boundaries)
	layout?: {
		titleHeight?: number // Percentage 0-100
		centerPosition?: number // Percentage 0-100
		diversionPosition?: number // Percentage 0-100
	}

	// Legacy fields (optional, for migration)
	summary?: string
	fact?: string
	abstraction?: string
	diversion?: string
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
