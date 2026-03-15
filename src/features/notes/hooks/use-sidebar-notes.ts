/**
 * useSidebarNotes - サイドバー専用のストア購読フック
 *
 * HomeContent を経由せず、ストアに直接サブスクライブする。
 * selectPagesMeta + pagesMetaEqual により、キャンバス操作
 * （オブジェクトの移動/リサイズ等）でサイドバーが再レンダリングされるのを防止。
 */
import { useStoreWithEqualityFn } from 'zustand/traditional'

import {
	type PageMeta,
	pagesMetaEqual,
	selectPagesMeta,
	useNoteStore,
} from '@/features/notes/stores/note-store'

type SidebarNotesReturn = {
	pagesMeta: PageMeta[]
	activePageId: string | null
	addPage: () => void
	updatePage: (id: string, updates: Partial<PageMeta>) => void
	setActivePageId: (id: string | null) => void
	softDeletePage: (id: string) => void
	restorePage: (id: string) => void
	permanentDeletePage: (id: string) => void
}

export const useSidebarNotes = (): SidebarNotesReturn => {
	// カスタム等価比較でメタデータ変更時のみ再レンダリング
	const pagesMeta = useStoreWithEqualityFn(
		useNoteStore,
		selectPagesMeta,
		pagesMetaEqual
	)
	const activePageId = useNoteStore((s) => s.activePageId)
	const addPage = useNoteStore((s) => s.addPage)
	const updatePage = useNoteStore((s) => s.updatePage)
	const setActivePageId = useNoteStore((s) => s.setActivePageId)
	const softDeletePage = useNoteStore((s) => s.softDeletePage)
	const restorePage = useNoteStore((s) => s.restorePage)
	const permanentDeletePage = useNoteStore((s) => s.permanentDeletePage)

	return {
		pagesMeta,
		activePageId,
		addPage,
		updatePage,
		setActivePageId,
		softDeletePage,
		restorePage,
		permanentDeletePage,
	}
}
