/**
 * AppSidebar - メインサイドバーコンポーネント
 *
 * ページ一覧、検索、お気に入り、ゴミ箱を管理。
 * 子コンポーネント: SidebarHeader, PageListItem, TrashSection
 */
'use client'

import { isThisWeek, isToday, isYesterday } from 'date-fns'
import { Plus, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'
import { ScrollArea } from '@/shared/shadcn/scroll-area'
import type { NotePage } from '@/types/note'
import { PageListItem } from './parts/page-list-item'
import { SidebarHeader } from './parts/sidebar-header'
import { TrashSection } from './parts/trash-section'

interface AppSidebarProps {
	pages: NotePage[]
	activePageId: string | null
	onSelectPage: (id: string) => void
	onAddPage: () => void
	onUpdatePageTitle?: (id: string, title: string) => void
	onDeletePage: (id: string) => void
	onRestorePage?: (id: string) => void
	onPermanentDeletePage?: (id: string) => void
	className?: string
}

export const AppSidebar = ({
	pages,
	activePageId,
	onSelectPage,
	onAddPage,
	onUpdatePageTitle,
	onDeletePage,
	onRestorePage,
	onPermanentDeletePage,
	className,
}: AppSidebarProps) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [editingPageId, setEditingPageId] = useState<string | null>(null)
	const [editingTitle, setEditingTitle] = useState('')

	// 検索フィルタリング
	const filteredPages = pages.filter((page) => {
		const query = searchQuery.toLowerCase()
		return page.title.toLowerCase().includes(query)
	})

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

	// アクティブ（削除されていない）ページ
	const activePagesFiltered = filteredPages.filter((p) => !p.deletedAt)
	// 削除されたページ
	const deletedPages = filteredPages.filter((p) => p.deletedAt)

	// お気に入りと非お気に入りを分離
	const favoritePages = activePagesFiltered.filter((p) => p.isFavorite)
	const nonFavoritePages = activePagesFiltered.filter((p) => !p.isFavorite)

	// 日付でグループ化
	const groupedPages: {
		today: NotePage[]
		yesterday: NotePage[]
		thisWeek: NotePage[]
		older: NotePage[]
	} = {
		today: [],
		yesterday: [],
		thisWeek: [],
		older: [],
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
		if (editingPageId && editingTitle.trim() !== '') {
			onUpdatePageTitle?.(editingPageId, editingTitle.trim())
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

	// ページアイテム共通の props
	const pageItemProps = {
		activePageId,
		editingPageId,
		editingTitle,
		onSelect: onSelectPage,
		onStartEditing: handleStartEditing,
		onTitleChange: setEditingTitle,
		onFinishEditing: handleFinishEditing,
		onKeyDown: handleKeyDown,
		onDelete: onDeletePage,
	}

	// ページグループをレンダリング
	const renderPageGroup = (label: string, pageList: NotePage[], icon?: React.ReactNode) => {
		if (pageList.length === 0) return null
		return (
			<div className="mb-4">
				<div className="text-xs font-semibold text-muted-foreground px-2 mb-2 flex items-center gap-2">
					{icon}
					{label}
				</div>
				{pageList.map((page) => (
					<PageListItem key={page.id} page={page} {...pageItemProps} />
				))}
			</div>
		)
	}

	return (
		<div className={cn('flex flex-col h-full border-r bg-muted/30', className)}>
			<SidebarHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					<Button variant="default" className="w-full justify-start gap-2 mb-4" onClick={onAddPage}>
						<Plus className="h-4 w-4" />
						新しいページ
					</Button>

					{/* お気に入り */}
					{renderPageGroup('お気に入り', favoritePages, <Star className="h-3 w-3 fill-current" />)}

					{/* 今日 */}
					{renderPageGroup('今日', groupedPages.today)}

					{/* 昨日 */}
					{renderPageGroup('昨日', groupedPages.yesterday)}

					{/* 今週 */}
					{renderPageGroup('今週', groupedPages.thisWeek)}

					{/* それ以前 */}
					{renderPageGroup('それ以前', groupedPages.older)}

					{/* ゴミ箱 */}
					<TrashSection
						deletedPages={deletedPages}
						activePageId={activePageId}
						editingPageId={editingPageId}
						editingTitle={editingTitle}
						onStartEditing={handleStartEditing}
						onTitleChange={setEditingTitle}
						onFinishEditing={handleFinishEditing}
						onKeyDown={handleKeyDown}
						onRestore={onRestorePage}
						onPermanentDelete={onPermanentDeletePage}
					/>

					{activePagesFiltered.length === 0 && deletedPages.length === 0 && (
						<div className="text-center py-8 text-muted-foreground text-sm">
							ページが見つかりません
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}
