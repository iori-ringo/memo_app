import { useMemo, useState } from 'react'

import type { PageMeta } from '@/features/notes/stores/note-store'

export const useSidebarSearch = (pages: PageMeta[]) => {
	const [searchQuery, setSearchQuery] = useState('')

	const filteredPages = useMemo(() => {
		if (!searchQuery.trim()) return pages
		const query = searchQuery.toLowerCase()
		return pages.filter((page) => page.title.toLowerCase().includes(query))
	}, [pages, searchQuery])

	return { searchQuery, setSearchQuery, filteredPages }
}
