'use client'

import { format, isThisWeek, isToday, isYesterday } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
	Book,
	ChevronDown,
	ChevronRight,
	FileText,
	MoreHorizontal,
	Pencil,
	Plus,
	RotateCcw,
	Search,
	Star,
	Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/shared/common/mode-toggle'
import { Button } from '@/shared/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import type { NotePage } from '@/types/note'

type AppSidebarProps = {
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
	const [isTrashOpen, setIsTrashOpen] = useState(false)

	const filteredPages = pages.filter((page) => {
		const query = searchQuery.toLowerCase()
		return (
			page.title.toLowerCase().includes(query) ||
			(page.summary?.toLowerCase() || '').includes(query) ||
			(page.fact?.toLowerCase() || '').includes(query)
		)
	})

	// Global shortcut for New Page (Cmd+M)
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

	// Filter active (non-deleted) pages
	const activePagesFiltered = filteredPages.filter((p) => !p.deletedAt)

	// Filter deleted pages
	const deletedPages = filteredPages.filter((p) => p.deletedAt)

	// Organize active pages
	const favoritePages = activePagesFiltered.filter((p) => p.isFavorite)
	const nonFavoritePages = activePagesFiltered.filter((p) => !p.isFavorite)

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

	// Group non-favorites by date
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

	// Sort within groups (newest first)
	Object.values(groupedPages).forEach((group) => {
		group.sort((a, b) => b.updatedAt - a.updatedAt)
	})

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

	const renderPageItem = (page: NotePage, isTrash: boolean = false) => {
		const lastEdited = new Date(page.updatedAt)
		const dateDisplay = isToday(lastEdited)
			? format(lastEdited, 'HH:mm', { locale: ja })
			: format(lastEdited, 'yyyy/MM/dd', { locale: ja })

		return (
			<div
				key={page.id}
				className={cn(
					'group w-full flex items-center gap-1 p-1 rounded-md text-sm transition-colors hover:bg-accent/50 relative text-left',
					activePageId === page.id && !isTrash
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground'
				)}
			>
				<button
					type="button"
					className="flex-1 min-w-0 flex flex-col gap-0.5 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left border-0 bg-transparent outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
					onClick={() => !isTrash && onSelectPage(page.id)}
					onDoubleClick={() => !isTrash && handleStartEditing(page)}
				>
					<div className="flex items-center gap-2 w-full min-w-0">
						{page.isFavorite ? (
							<Star className="h-3 w-3 shrink-0 text-yellow-500 fill-yellow-500" />
						) : (
							<FileText className="h-3 w-3 shrink-0" />
						)}

						{editingPageId === page.id ? (
							<input
								type="text"
								value={editingTitle}
								// biome-ignore lint/a11y/noAutofocus: intentional for inline edit UX
								autoFocus
								onChange={(e) => setEditingTitle(e.target.value)}
								onBlur={handleFinishEditing}
								onKeyDown={handleKeyDown}
								className="flex-1 min-w-0 bg-background border rounded px-1 text-foreground"
								onClick={(e) => e.stopPropagation()}
							/>
						) : (
							<span className="flex-1 truncate font-medium text-primary">
								{page.title && page.title.trim() !== '' ? page.title : '無題のページ'}
							</span>
						)}
					</div>
					<span className="text-[10px] text-muted-foreground pl-5 truncate">{dateDisplay}</span>
				</button>

				{/* Dropdown Menu - Standard Button, no stopPropagation hack needed */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shrink-0"
						>
							<MoreHorizontal className="h-3 w-3" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{isTrash ? (
							<>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										onRestorePage?.(page.id)
									}}
								>
									<RotateCcw className="mr-2 h-4 w-4" />
									復元
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										onPermanentDeletePage?.(page.id)
									}}
									className="text-red-600 focus:text-red-600"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									完全に削除
								</DropdownMenuItem>
							</>
						) : (
							<>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										handleStartEditing(page)
									}}
								>
									<Pencil className="mr-2 h-4 w-4" />
									名前を変更
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										onDeletePage(page.id)
									}}
									className="text-red-600 focus:text-red-600"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									削除
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		)
	}

	return (
		<div className={cn('flex flex-col h-full border-r bg-muted/30', className)}>
			{/* Header */}
			<div className="p-4 border-b space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 font-semibold text-lg">
						<Book className="h-5 w-5 text-primary" />
						<span>My Notebook</span>
					</div>
					<ModeToggle />
				</div>
				<div className="relative">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="検索..."
						className="pl-8 bg-background"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Page List */}
			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					<Button variant="default" className="w-full justify-start gap-2 mb-4" onClick={onAddPage}>
						<Plus className="h-4 w-4" />
						新しいページ
					</Button>

					{/* Favorites */}
					{favoritePages.length > 0 && (
						<div className="mb-4">
							<div className="text-xs font-semibold text-muted-foreground px-2 mb-2 flex items-center gap-2">
								<Star className="h-3 w-3 fill-current" />
								お気に入り
							</div>
							{favoritePages.map((page) => renderPageItem(page))}
						</div>
					)}

					{/* Today */}
					{groupedPages.today.length > 0 && (
						<div className="mb-4">
							<div className="text-xs font-semibold text-muted-foreground px-2 mb-2">今日</div>
							{groupedPages.today.map((page) => renderPageItem(page))}
						</div>
					)}

					{/* Yesterday */}
					{groupedPages.yesterday.length > 0 && (
						<div className="mb-4">
							<div className="text-xs font-semibold text-muted-foreground px-2 mb-2">昨日</div>
							{groupedPages.yesterday.map((page) => renderPageItem(page))}
						</div>
					)}

					{/* This Week */}
					{groupedPages.thisWeek.length > 0 && (
						<div className="mb-4">
							<div className="text-xs font-semibold text-muted-foreground px-2 mb-2">今週</div>
							{groupedPages.thisWeek.map((page) => renderPageItem(page))}
						</div>
					)}

					{/* Older */}
					{groupedPages.older.length > 0 && (
						<div className="mb-4">
							<div className="text-xs font-semibold text-muted-foreground px-2 mb-2">それ以前</div>
							{groupedPages.older.map((page) => renderPageItem(page))}
						</div>
					)}

					{/* Trash Section */}
					{deletedPages.length > 0 && (
						<div className="mt-8 pt-4 border-t">
							<button
								type="button"
								onClick={() => setIsTrashOpen(!isTrashOpen)}
								className="w-full flex items-center gap-2 text-xs font-semibold text-muted-foreground px-2 mb-2 hover:text-foreground transition-colors"
							>
								{isTrashOpen ? (
									<ChevronDown className="h-3 w-3" />
								) : (
									<ChevronRight className="h-3 w-3" />
								)}
								<Trash2 className="h-3 w-3" />
								ゴミ箱 ({deletedPages.length})
							</button>

							{isTrashOpen && (
								<div className="space-y-1">
									{deletedPages.map((page) => renderPageItem(page, true))}
								</div>
							)}
						</div>
					)}

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
