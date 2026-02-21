/**
 * AppSidebar - メインサイドバーコンポーネント
 *
 * ページ一覧、検索、お気に入り、ゴミ箱を管理。
 * 子コンポーネント: SidebarHeader, PageListItem, TrashSection
 */
'use client'

import { Plus, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { PageListItem } from '@/features/sidebar/components/parts/page-list-item'
import { SidebarHeader } from '@/features/sidebar/components/parts/sidebar-header'
import { TrashSection } from '@/features/sidebar/components/parts/trash-section'
import { useSidebarEditing } from '@/features/sidebar/hooks/use-sidebar-editing'
import { useSidebarGrouping } from '@/features/sidebar/hooks/use-sidebar-grouping'
import { useSidebarSearch } from '@/features/sidebar/hooks/use-sidebar-search'
import { useSidebarShortcuts } from '@/features/sidebar/hooks/use-sidebar-shortcuts'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'
import type { NotePage } from '@/types/note'

// 静的JSXの抽出（rendering-hoist-jsx）
const favoriteIcon = <Star className="h-3 w-3 fill-current" />

// ページグループコンポーネント（rendering-inline-functions）
type PageGroupProps = {
	label: string
	pages: NotePage[]
	icon?: ReactNode
	pageItemProps: Record<string, unknown>
}

const PageGroup = ({ label, pages, icon, pageItemProps }: PageGroupProps) => {
	if (pages.length === 0) return null
	return (
		<div className="mb-4">
			<div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
				{icon}
				{label}
			</div>
			{pages.map((page) => (
				<PageListItem key={page.id} page={page} {...pageItemProps} />
			))}
		</div>
	)
}

type AppSidebarProps = {
	pages: NotePage[]
	activePageId: string | null
	onSelectPage: (pageId: string) => void
	onAddPage: () => void
	onUpdatePage?: (id: string, updates: Partial<NotePage>) => void
	onDeletePage: (pageId: string) => void
	onRestorePage?: (pageId: string) => void
	onPermanentDeletePage?: (pageId: string) => void
	className?: string
}

export const AppSidebar = ({
	pages,
	activePageId,
	onSelectPage,
	onAddPage,
	onUpdatePage,
	onDeletePage,
	onRestorePage,
	onPermanentDeletePage,
	className,
}: AppSidebarProps) => {
	// キーボードショートカット（Cmd+M で新規ページ作成）
	useSidebarShortcuts({ onAddPage })

	// 検索フィルタリング
	const { searchQuery, setSearchQuery, filteredPages } = useSidebarSearch(pages)

	// ページのグループ化（お気に入り、日付別、削除済み）
	const { activePages, deletedPages, favoritePages, groupedPages } =
		useSidebarGrouping(filteredPages)

	// ページタイトル編集
	const {
		editingPageId,
		editingTitle,
		setEditingTitle,
		handleStartEditing,
		handleFinishEditing,
		handleKeyDown,
	} = useSidebarEditing({ pages, onUpdatePage })

	// ページアイテム共通の props（useMemo でメモ化）
	const pageItemProps = useMemo(
		() => ({
			activePageId,
			editingPageId,
			editingTitle,
			onSelect: onSelectPage,
			onStartEditing: handleStartEditing,
			onTitleChange: setEditingTitle,
			onFinishEditing: handleFinishEditing,
			onKeyDown: handleKeyDown,
			onDelete: onDeletePage,
			onRestore: onRestorePage,
			onPermanentDelete: onPermanentDeletePage,
		}),
		[
			activePageId,
			editingPageId,
			editingTitle,
			onSelectPage,
			handleStartEditing,
			setEditingTitle,
			handleFinishEditing,
			handleKeyDown,
			onDeletePage,
			onRestorePage,
			onPermanentDeletePage,
		]
	)

	return (
		<div className={cn('flex flex-col h-full border-r bg-muted/30', className)}>
			<SidebarHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

			<div className="p-4 pt-3">
				<Button variant="default" className="w-full justify-start gap-2" onClick={onAddPage}>
					<Plus className="h-4 w-4" />
					新しいページ
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="px-4 py-2 space-y-1">
					{/* お気に入り */}
					<PageGroup
						label="お気に入り"
						pages={favoritePages}
						icon={favoriteIcon}
						pageItemProps={pageItemProps}
					/>

					{/* 今日 */}
					<PageGroup label="今日" pages={groupedPages.today} pageItemProps={pageItemProps} />

					{/* 昨日 */}
					<PageGroup label="昨日" pages={groupedPages.yesterday} pageItemProps={pageItemProps} />

					{/* 今週 */}
					<PageGroup label="今週" pages={groupedPages.thisWeek} pageItemProps={pageItemProps} />

					{/* それ以前 */}
					<PageGroup label="それ以前" pages={groupedPages.older} pageItemProps={pageItemProps} />

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

					{activePages.length === 0 && deletedPages.length === 0 && (
						<div className="text-center py-8 text-muted-foreground text-sm">ページがありません</div>
					)}
				</div>
			</div>
		</div>
	)
}
