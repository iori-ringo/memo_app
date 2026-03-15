/**
 * note-store.ts - ノートデータのグローバル状態管理（SSoT）
 *
 * Zustand + subscribeWithSelector で状態管理。
 * persist ミドルウェアは使用せず、note-storage.ts の Platform Adapter 経由で永続化。
 * subscribe による自動保存で手動 saveNotes() の散在を解消。
 *
 * @usage
 * ```tsx
 * const pages = useNoteStore((s) => s.pages)
 * const addPage = useNoteStore((s) => s.addPage)
 * ```
 */

import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { loadNotes, saveConfig, saveNotes } from '@/features/notes/services/note-storage'
import type { NotePage } from '@/types/note'

// サイドバー用の軽量メタデータ型（objects/connections/layout を除外）
export type PageMeta = Omit<NotePage, 'objects' | 'connections' | 'layout'>

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

const INITIAL_PAGE: NotePage = {
	id: '1',
	notebookId: 'default',
	title: 'メモの魔力 - 実践ノート',
	tags: ['Guide'],
	createdAt: Date.now(),
	updatedAt: Date.now(),
	objects: [],
	connections: [],
}

type NoteState = {
	pages: NotePage[]
	activePageId: string | null
	isHydrated: boolean
}

type NoteActions = {
	hydrate: () => Promise<void>
	addPage: () => void
	updatePage: (id: string, updates: Partial<NotePage>) => void
	softDeletePage: (id: string) => void
	restorePage: (id: string) => void
	permanentDeletePage: (id: string) => void
	cleanupOldTrash: () => void
	setActivePageId: (id: string | null) => void
}

export const useNoteStore = create<NoteState & NoteActions>()(
	subscribeWithSelector((set, get) => ({
		pages: [],
		activePageId: null,
		isHydrated: false,

		hydrate: async () => {
			// StrictMode での二重実行を防止
			if (get().isHydrated) return

			const { pages: savedPages, config } = await loadNotes()

			if (savedPages.length > 0) {
				const lastActiveId = config?.lastActivePageId
				const targetPage = savedPages.find((p) => p.id === lastActiveId && !p.deletedAt)
				set({
					pages: savedPages,
					activePageId: targetPage
						? targetPage.id
						: (savedPages.find((p) => !p.deletedAt)?.id ?? null),
					isHydrated: true,
				})
			} else {
				set({
					pages: [INITIAL_PAGE],
					activePageId: INITIAL_PAGE.id,
					isHydrated: true,
				})
			}

			// 起動時にゴミ箱の自動クリーンアップ
			get().cleanupOldTrash()
		},

		addPage: () => {
			const newPage: NotePage = {
				id: uuidv4(),
				notebookId: 'default',
				title: '',
				tags: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				objects: [],
				connections: [],
			}
			set((state) => ({
				pages: [newPage, ...state.pages],
				activePageId: newPage.id,
			}))
		},

		updatePage: (id, updates) =>
			set((state) => ({
				pages: state.pages.map((p) =>
					p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
				),
			})),

		softDeletePage: (id) =>
			set((state) => {
				const pages = state.pages.map((p) =>
					p.id === id ? { ...p, deletedAt: Date.now(), updatedAt: Date.now() } : p
				)
				// 削除したページがアクティブなら別のページに切り替え
				const activePageId =
					state.activePageId === id
						? (pages.find((p) => p.id !== id && !p.deletedAt)?.id ?? null)
						: state.activePageId
				return { pages, activePageId }
			}),

		restorePage: (id) =>
			set((state) => ({
				pages: state.pages.map((p) =>
					p.id === id ? { ...p, deletedAt: undefined, updatedAt: Date.now() } : p
				),
			})),

		permanentDeletePage: (id) =>
			set((state) => {
				const pages = state.pages.filter((p) => p.id !== id)
				const activePageId = state.activePageId === id ? null : state.activePageId
				return { pages, activePageId }
			}),

		cleanupOldTrash: () => {
			const twoWeeksAgo = Date.now() - TWO_WEEKS_MS
			set((state) => ({
				pages: state.pages.filter((p) => !p.deletedAt || p.deletedAt >= twoWeeksAgo),
			}))
		},

		setActivePageId: (id) => set({ activePageId: id }),
	}))
)

// ---------------------------------------------------------------------------
// セレクタ: キャンバス用 — アクティブページのみ取得
// ---------------------------------------------------------------------------
export const selectActivePage = (state: NoteState & NoteActions): NotePage | undefined => {
	const id = state.activePageId
	return id ? state.pages.find((p) => p.id === id && !p.deletedAt) : undefined
}

// ---------------------------------------------------------------------------
// セレクタ: サイドバー用 — メタデータのみ取得（構造的共有で参照安定化）
// ---------------------------------------------------------------------------
export const selectPagesMeta = (() => {
	let prevPages: NotePage[] = []
	let prevMeta: PageMeta[] = []

	return (state: NoteState & NoteActions): PageMeta[] => {
		const pages = state.pages
		if (pages === prevPages) return prevMeta

		const next = pages.map((page, i) => {
			// 同じページ参照ならメタデータも同じ — 前回の軽量オブジェクトを再利用
			if (page === prevPages[i] && i < prevMeta.length) return prevMeta[i]
			// objects/connections/layout を除外し、メタデータのみ抽出
			const { objects: _, connections: __, layout: ___, ...meta } = page
			return meta
		})

		prevPages = pages
		prevMeta = next
		return next
	}
})()

// サイドバー用等価比較: updatedAt を無視し、表示に影響するフィールドのみ比較
// ドラッグ/リサイズで updatedAt が変わっても、サイドバーの再レンダリングを防止する
export const pagesMetaEqual = (a: PageMeta[], b: PageMeta[]): boolean => {
	if (a.length !== b.length) return false
	return a.every((item, i) => {
		const other = b[i]
		return (
			item.id === other.id &&
			item.title === other.title &&
			item.isFavorite === other.isFavorite &&
			item.deletedAt === other.deletedAt
		)
	})
}

// 自動保存: pages が変更されたら 300ms debounce して保存（タイピング中の過剰な IPC 発火を防止）
let saveTimer: ReturnType<typeof setTimeout> | null = null

useNoteStore.subscribe(
	(state) => state.pages,
	(pages) => {
		if (!useNoteStore.getState().isHydrated || pages.length === 0) return
		if (saveTimer) clearTimeout(saveTimer)
		saveTimer = setTimeout(() => {
			void saveNotes(pages)
		}, 300)
	}
)

// 自動保存: activePageId が変更されたら設定を保存
useNoteStore.subscribe(
	(state) => state.activePageId,
	(activePageId) => {
		if (useNoteStore.getState().isHydrated && activePageId) {
			saveConfig({ lastActivePageId: activePageId })
		}
	}
)
