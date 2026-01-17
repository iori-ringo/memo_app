/**
 * note-store.ts - ノートデータのグローバル状態管理
 *
 * Zustand を使用したノートの CRUD 操作と永続化。
 * Electron 環境では IPC 経由、Web 環境では localStorage を使用。
 *
 * @usage
 * ```tsx
 * const pages = useNoteStore((s) => s.pages)
 * const addPage = useNoteStore((s) => s.addPage)
 * ```
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { NotePage } from '@/types/note'

interface NoteState {
	/** 全ページデータ */
	pages: NotePage[]
	/** 現在選択中のページID */
	activePageId: string | null

	// アクション
	setPages: (pages: NotePage[]) => void
	addPage: (page: NotePage) => void
	updatePage: (id: string, updates: Partial<NotePage>) => void
	deletePage: (id: string) => void
	setActivePageId: (id: string | null) => void
}

/**
 * ストアのバージョン
 * データ構造が変更された場合はインクリメントし、migrate で対応
 */
const STORE_VERSION = 1

export const useNoteStore = create<NoteState>()(
	persist(
		(set) => ({
			pages: [],
			activePageId: null,

			setPages: (pages) => set({ pages }),

			addPage: (page) =>
				set((state) => ({
					pages: [page, ...state.pages],
				})),

			updatePage: (id, updates) =>
				set((state) => ({
					pages: state.pages.map((p) =>
						p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
					),
				})),

			deletePage: (id) =>
				set((state) => ({
					pages: state.pages.filter((p) => p.id !== id),
				})),

			setActivePageId: (id) => set({ activePageId: id }),
		}),
		{
			name: 'memo-app-notes',
			version: STORE_VERSION,
			storage: createJSONStorage(() => localStorage),

			/**
			 * マイグレーション関数
			 * 将来のバージョンアップ時にデータ構造を変換
			 */
			migrate: (persistedState, version) => {
				// バージョン0（初期）からバージョン1への移行
				if (version === 0) {
					// 必要に応じてデータ変換を実施
				}
				return persistedState as NoteState
			},

			/**
			 * 永続化するデータを選択
			 * アクション関数は除外される
			 */
			partialize: (state) => ({
				pages: state.pages,
				activePageId: state.activePageId,
			}),
		}
	)
)
