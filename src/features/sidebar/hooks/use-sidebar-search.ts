import { useMemo, useState } from 'react'
import type { NotePage } from '@/types/note'

export const useSidebarSearch = (pages: NotePage[]) => {
	const [searchQuery, setSearchQuery] = useState('')

	const filteredPages = useMemo(() => {
		if (!searchQuery.trim()) return pages
		const query = searchQuery.toLowerCase()
		return pages.filter((page) => page.title.toLowerCase().includes(query))
	}, [pages, searchQuery])

	return { searchQuery, setSearchQuery, filteredPages }
}
