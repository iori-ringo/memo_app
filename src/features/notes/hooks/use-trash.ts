import { useCallback } from 'react'
import type { NotePage } from '@/types/note'
import { saveNotes } from '../services/note-storage'

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

interface UseTrashProps {
	pages: NotePage[]
	setPages: React.Dispatch<React.SetStateAction<NotePage[]>>
	activePageId: string | null
	setActivePageId: React.Dispatch<React.SetStateAction<string | null>>
}

interface UseTrashReturn {
	trashedPages: NotePage[]
	cleanupOldTrash: () => void
	handleDeletePage: (id: string) => Promise<void>
	handleRestorePage: (id: string) => Promise<void>
	handlePermanentDeletePage: (id: string) => Promise<void>
}

export const useTrash = ({
	pages,
	setPages,
	activePageId,
	setActivePageId,
}: UseTrashProps): UseTrashReturn => {
	// ゴミ箱に入っているページ
	const trashedPages = pages.filter((page) => page.deletedAt !== undefined)

	// 2週間以上前に削除されたページを自動削除
	const cleanupOldTrash = useCallback(() => {
		const twoWeeksAgo = Date.now() - TWO_WEEKS_MS
		setPages((prev) => {
			const cleaned = prev.filter((page) => {
				if (page.deletedAt && page.deletedAt < twoWeeksAgo) {
					return false
				}
				return true
			})
			return cleaned
		})
	}, [setPages])

	// ソフト削除（ゴミ箱に移動）
	const handleDeletePage = useCallback(
		async (id: string) => {
			const updatedPages = pages.map((page) =>
				page.id === id ? { ...page, deletedAt: Date.now(), updatedAt: Date.now() } : page
			)
			setPages(updatedPages)

			// 削除したページがアクティブなら別のページに切り替え
			if (activePageId === id) {
				const nextActivePage = updatedPages.find((p) => p.id !== id && !p.deletedAt)
				setActivePageId(nextActivePage?.id || null)
			}

			await saveNotes(updatedPages)
		},
		[pages, activePageId, setPages, setActivePageId]
	)

	// ゴミ箱から復元
	const handleRestorePage = useCallback(
		async (id: string) => {
			const updatedPages = pages.map((page) =>
				page.id === id ? { ...page, deletedAt: undefined, updatedAt: Date.now() } : page
			)
			setPages(updatedPages)
			await saveNotes(updatedPages)
		},
		[pages, setPages]
	)

	// 完全削除
	const handlePermanentDeletePage = useCallback(
		async (id: string) => {
			if (!confirm('このページを完全に削除してもよろしいですか？この操作は取り消せません。')) {
				return
			}

			const updatedPages = pages.filter((page) => page.id !== id)
			setPages(updatedPages)

			if (activePageId === id) {
				setActivePageId(null)
			}

			await saveNotes(updatedPages)
		},
		[pages, activePageId, setPages, setActivePageId]
	)

	return {
		trashedPages,
		cleanupOldTrash,
		handleDeletePage,
		handleRestorePage,
		handlePermanentDeletePage,
	}
}
