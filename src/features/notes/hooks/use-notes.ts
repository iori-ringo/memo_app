import { useEffect, useMemo } from 'react'

import { useNoteStore } from '@/features/notes/stores/note-store'

export const useNotes = () => {
	const pages = useNoteStore((s) => s.pages)
	const activePageId = useNoteStore((s) => s.activePageId)
	const isHydrated = useNoteStore((s) => s.isHydrated)
	const hydrate = useNoteStore((s) => s.hydrate)
	const addPage = useNoteStore((s) => s.addPage)
	const updatePage = useNoteStore((s) => s.updatePage)
	const setActivePageId = useNoteStore((s) => s.setActivePageId)

	// 初回 hydration
	useEffect(() => {
		hydrate()
	}, [hydrate])

	// アクティブなページ（削除されていないもの）
	const activePage = useMemo(
		() => pages.find((p) => p.id === activePageId && !p.deletedAt),
		[pages, activePageId]
	)

	return {
		pages,
		activePageId,
		activePage,
		isHydrated,
		addPage,
		updatePage,
		setActivePageId,
	}
}
