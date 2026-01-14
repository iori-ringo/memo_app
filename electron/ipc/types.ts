/**
 * IPC Types for Electron Main/Renderer communication
 *
 * Note: Core domain types (NotePage, CanvasObject, etc.) are imported from
 * src/types/note.ts to maintain a Single Source of Truth for types.
 */

// Re-export core types from shared location
export type {
	AppConfig,
	CanvasObject,
	Connection,
	ElectronAPI,
	NotePage,
	SectionType,
	Stroke,
} from '../../src/types/note'

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
