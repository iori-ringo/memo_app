import { isThisWeek, isToday, isYesterday } from 'date-fns'
import { useEffect, useState } from 'react'
import type { NotePage } from '@/types/note'

type UseSidebarLogicProps = {
	pages: NotePage[]
	onAddPage: () => void
	onUpdatePage?: (id: string, updates: Partial<NotePage>) => void
}

export const useSidebarLogic = ({ pages, onAddPage, onUpdatePage }: UseSidebarLogicProps) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [editingPageId, setEditingPageId] = useState<string | null>(null)
	const [editingTitle, setEditingTitle] = useState('')

	// Cmd+M で新規ページ作成
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
				e.preventDefault()
				onAddPage()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [onAddPage])

	// 検索フィルタリング
	const filteredPages = pages.filter((page) => {
		const query = searchQuery.toLowerCase()
		return page.title.toLowerCase().includes(query)
	})

	// アクティブ（削除されていない）ページ
	const activePagesFiltered = filteredPages.filter((p) => !p.deletedAt)
	// 削除されたページ
	const deletedPages = filteredPages.filter((p) => p.deletedAt)

	// お気に入りと非お気に入りを分離
	const favoritePages = activePagesFiltered.filter((p) => p.isFavorite)
	const nonFavoritePages = activePagesFiltered.filter((p) => !p.isFavorite)

	// 日付でグループ化
	const groupedPages = {
		today: [] as NotePage[],
		yesterday: [] as NotePage[],
		thisWeek: [] as NotePage[],
		older: [] as NotePage[],
	}

	nonFavoritePages.forEach((page) => {
		const date = new Date(page.updatedAt)
		if (isToday(date)) {
			groupedPages.today.push(page)
		} else if (isYesterday(date)) {
			groupedPages.yesterday.push(page)
		} else if (isThisWeek(date)) {
			groupedPages.thisWeek.push(page)
		} else {
			groupedPages.older.push(page)
		}
	})

	// 各グループを新しい順にソート
	Object.values(groupedPages).forEach((group) => {
		group.sort((a, b) => b.updatedAt - a.updatedAt)
	})

	// 編集関連のハンドラー
	const handleStartEditing = (page: NotePage) => {
		setEditingPageId(page.id)
		setEditingTitle(page.title)
	}

	const handleFinishEditing = () => {
		if (editingPageId && onUpdatePage) {
			const page = pages.find((p) => p.id === editingPageId)
			if (page && page.title !== editingTitle) {
				onUpdatePage(editingPageId, { title: editingTitle })
			}
		}
		setEditingPageId(null)
		setEditingTitle('')
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleFinishEditing()
		} else if (e.key === 'Escape') {
			setEditingPageId(null)
			setEditingTitle('')
		}
	}

	return {
		searchQuery,
		setSearchQuery,
		editingPageId,
		editingTitle,
		setEditingTitle,
		handleStartEditing,
		handleFinishEditing,
		handleKeyDown,
		activePagesFiltered,
		deletedPages,
		favoritePages,
		groupedPages,
	}
}
