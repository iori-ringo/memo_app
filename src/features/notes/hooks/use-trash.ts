import { useMemo } from 'react'

import { useNoteStore } from '@/features/notes/stores/note-store'

export const useTrash = () => {
	const pages = useNoteStore((s) => s.pages)
	const softDeletePage = useNoteStore((s) => s.softDeletePage)
	const restorePage = useNoteStore((s) => s.restorePage)
	const permanentDeletePage = useNoteStore((s) => s.permanentDeletePage)
	const cleanupOldTrash = useNoteStore((s) => s.cleanupOldTrash)

	// ゴミ箱に入っているページ
	const trashedPages = useMemo(() => pages.filter((page) => page.deletedAt !== undefined), [pages])

	return {
		trashedPages,
		cleanupOldTrash,
		softDeletePage,
		restorePage,
		permanentDeletePage,
	}
}
