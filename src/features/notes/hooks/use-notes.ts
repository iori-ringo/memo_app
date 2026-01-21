import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { NotePage } from '@/types/note'
import { loadNotes, saveConfig, saveNotes } from '../services/note-storage'

const INITIAL_PAGE: NotePage = {
	id: '1',
	notebookId: 'default',
	title: 'メモの魔力 - 実践ノート',
	tags: ['Guide'],
	createdAt: Date.now(),
	updatedAt: Date.now(),
	objects: [],
	strokes: [],
	connections: [],
}

interface UseNotesReturn {
	pages: NotePage[]
	setPages: React.Dispatch<React.SetStateAction<NotePage[]>>
	activePageId: string | null
	setActivePageId: React.Dispatch<React.SetStateAction<string | null>>
	activePage: NotePage | undefined
	isClient: boolean
	handleAddPage: () => void
	handleUpdatePage: (id: string, updates: Partial<NotePage>) => void
	handleUpdatePageTitle: (id: string, newTitle: string) => Promise<void>
}

export const useNotes = (): UseNotesReturn => {
	const [pages, setPages] = useState<NotePage[]>([])
	const [activePageId, setActivePageId] = useState<string | null>(null)
	const [isClient, setIsClient] = useState(false)

	// クライアントサイドの確認
	useEffect(() => {
		setIsClient(true)
	}, [])

	// データ読み込み
	useEffect(() => {
		if (!isClient) return

		const loadData = async () => {
			const { pages: savedPages, config } = await loadNotes()

			if (savedPages.length > 0) {
				setPages(savedPages)
				// 最後にアクティブだったページを復元
				const lastActiveId = config?.lastActivePageId
				const targetPage = savedPages.find((p: NotePage) => p.id === lastActiveId && !p.deletedAt)
				setActivePageId(
					targetPage ? targetPage.id : savedPages.find((p) => !p.deletedAt)?.id || null
				)
			} else {
				setPages([INITIAL_PAGE])
				setActivePageId(INITIAL_PAGE.id)
			}
		}

		loadData()
	}, [isClient])

	// 自動保存
	useEffect(() => {
		if (isClient && pages.length > 0) {
			saveNotes(pages)
		}
	}, [pages, isClient])

	// アクティブページIDの保存
	useEffect(() => {
		if (!isClient || !activePageId) return
		saveConfig({ lastActivePageId: activePageId })
	}, [activePageId, isClient])

	// 新規ページ追加
	const handleAddPage = useCallback(() => {
		const newPage: NotePage = {
			id: uuidv4(),
			notebookId: 'default',
			title: '',
			tags: [],
			createdAt: Date.now(),
			updatedAt: Date.now(),
			objects: [],
			strokes: [],
			connections: [],
		}
		setPages((prev) => [newPage, ...prev])
		setActivePageId(newPage.id)
	}, [])

	// ページ更新
	const handleUpdatePage = useCallback((id: string, updates: Partial<NotePage>) => {
		setPages((prev) =>
			prev.map((page) => (page.id === id ? { ...page, ...updates, updatedAt: Date.now() } : page))
		)
	}, [])

	// ページタイトル更新
	const handleUpdatePageTitle = useCallback(
		async (id: string, newTitle: string) => {
			const updatedPages = pages.map((page) =>
				page.id === id ? { ...page, title: newTitle, updatedAt: Date.now() } : page
			)
			setPages(updatedPages)
			await saveNotes(updatedPages)
		},
		[pages]
	)

	// アクティブなページ（削除されていないもの）
	const activePage = pages.find((p) => p.id === activePageId && !p.deletedAt)

	return {
		pages,
		setPages,
		activePageId,
		setActivePageId,
		activePage,
		isClient,
		handleAddPage,
		handleUpdatePage,
		handleUpdatePageTitle,
	}
}
