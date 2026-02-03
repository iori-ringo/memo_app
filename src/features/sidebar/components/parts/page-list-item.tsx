/**
 * PageListItem - サイドバーのページアイテムコンポーネント
 *
 * ページリストの個別アイテムを表示。
 * お気に入りアイコン、タイトル、更新日時、ドロップダウンメニューを含む。
 * 右クリックでもコンテキストメニューを表示可能。
 */
'use client'

import { format, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { FileText, MoreHorizontal, Star } from 'lucide-react'
import { useEffect, useRef } from 'react'
import {
	getPageMenuActions,
	PageContextMenuItems,
	PageDropdownMenuItems,
} from '@/features/sidebar/components/parts/page-item-menu'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/shared/shadcn/context-menu'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/shared/shadcn/dropdown-menu'
import type { NotePage } from '@/types/note'

type PageListItemProps = {
	page: NotePage
	activePageId: string | null
	isTrash?: boolean
	editingPageId: string | null
	editingTitle: string
	onSelect?: (id: string) => void
	onStartEditing: (page: NotePage) => void
	onTitleChange: (value: string) => void
	onFinishEditing: () => void
	onKeyDown: (e: React.KeyboardEvent) => void
	onDelete?: (id: string) => void
	onRestore?: (id: string) => void
	onPermanentDelete?: (id: string) => void
}

export const PageListItem = ({
	page,
	activePageId,
	isTrash = false,
	editingPageId,
	editingTitle,
	onSelect,
	onStartEditing,
	onTitleChange,
	onFinishEditing,
	onKeyDown,
	onDelete,
	onRestore,
	onPermanentDelete,
}: PageListItemProps) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const isEditing = editingPageId === page.id
	const isActive = activePageId === page.id && !isTrash

	// 編集モード開始時にフォーカス
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
			inputRef.current.select()
		}
	}, [isEditing])

	// 日時フォーマット
	const lastEdited = new Date(page.updatedAt)
	const dateDisplay = isToday(lastEdited)
		? format(lastEdited, 'HH:mm', { locale: ja })
		: format(lastEdited, 'yyyy/MM/dd', { locale: ja })

	// タイトル表示（空なら「無題のページ」）
	const displayTitle = page.title?.trim() || '無題のページ'

	// メニューアクション（共通定義）
	const menuActions = getPageMenuActions(
		page,
		{ onStartEditing, onDelete, onRestore, onPermanentDelete },
		isTrash
	)

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className={cn(
						'group flex items-center gap-1.5 py-1 rounded-md text-sm transition-colors',
						isActive
							? 'bg-accent text-accent-foreground'
							: 'hover:bg-accent/50 text-muted-foreground'
					)}
				>
					{/* コンテンツエリア */}
					<div className="flex-1 min-w-0">
						{isEditing ? (
							// 編集モード
							<div className="flex items-center gap-1.5 w-full">
								{/* アイコン（編集モード） */}
								{page.isFavorite ? (
									<Star className="h-3.5 w-3.5 shrink-0 text-yellow-500 fill-yellow-500" />
								) : (
									<FileText className="h-3.5 w-3.5 shrink-0" />
								)}
								<div className="flex-1 min-w-0 flex flex-col gap-0.5">
									<input
										ref={inputRef}
										type="text"
										value={editingTitle}
										aria-label="ページ名の編集"
										onChange={(e) => onTitleChange(e.target.value)}
										onBlur={onFinishEditing}
										onKeyDown={onKeyDown}
										className="w-full rounded-md border border-input bg-background dark:bg-white dark:text-zinc-950 px-2 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
									/>
									<span className="text-[10px] text-muted-foreground truncate">{dateDisplay}</span>
								</div>
							</div>
						) : (
							// 表示モード
							<button
								type="button"
								className="w-full text-left flex items-center gap-1.5 bg-transparent border-none outline-none cursor-pointer rounded p-0.5 -m-0.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
								onClick={() => !isTrash && onSelect?.(page.id)}
								onDoubleClick={() => !isTrash && onStartEditing(page)}
							>
								{/* アイコン（表示モード） */}
								{page.isFavorite ? (
									<Star className="h-3.5 w-3.5 shrink-0 text-yellow-500 fill-yellow-500" />
								) : (
									<FileText className="h-3.5 w-3.5 shrink-0" />
								)}
								<div className="flex-1 min-w-0 flex flex-col gap-0.5">
									<span className="truncate font-medium text-foreground">{displayTitle}</span>
									<span className="text-[10px] text-muted-foreground truncate">{dateDisplay}</span>
								</div>
							</button>
						)}
					</div>

					{/* ドロップダウンメニュー（...ボタン） */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
							>
								<MoreHorizontal className="h-3.5 w-3.5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="bottom" align="end" collisionPadding={8}>
							<PageDropdownMenuItems actions={menuActions} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</ContextMenuTrigger>

			{/* 右クリックメニュー */}
			<ContextMenuContent>
				<PageContextMenuItems actions={menuActions} />
			</ContextMenuContent>
		</ContextMenu>
	)
}
