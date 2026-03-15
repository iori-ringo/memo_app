/**
 * Electronメインプロセスとレンダラープロセス間のIPC型定義
 *
 * コアドメイン型（NotePage, CanvasObjectなど）はsrc/types/note.tsから
 * インポートし、型の単一情報源（SSoT）を維持する
 */

// 共有ディレクトリからコア型を再エクスポート
export type {
	AppConfig,
	CanvasObject,
	Connection,
	ElectronAPI,
	NotePage,
	SectionType,
} from '../../src/types/note'

// IPCチャンネル名を定数として定義
export const IPC_CHANNELS = {
	LOAD_PAGES: 'load-pages',
	SAVE_PAGES: 'save-pages',
	LOAD_CONFIG: 'load-config',
	SAVE_CONFIG: 'save-config',
	NEW_PAGE: 'new-page',
	TOGGLE_DARK: 'toggle-dark',
} as const

// チャンネル名の型
export type IpcChannelName = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
