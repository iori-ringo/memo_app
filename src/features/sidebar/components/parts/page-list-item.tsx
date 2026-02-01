/**
 * PageListItem - サイドバーのページアイテムコンポーネント
 *
 * ページリストの個別アイテムを表示。
 * お気に入りアイコン、タイトル、更新日時、ドロップダウンメニューを含む。
 */
'use client'

import { format, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { FileText, MoreHorizontal, Pencil, RotateCcw, Star, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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

	return (
		<div
			className={cn(
				'group flex items-center gap-1.5 py-1 rounded-md text-sm transition-colors',
				isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground'
			)}
		>
			{/* アイコン */}
			{page.isFavorite ? (
				<Star className="h-3.5 w-3.5 shrink-0 text-yellow-500 fill-yellow-500" />
			) : (
				<FileText className="h-3.5 w-3.5 shrink-0" />
			)}

			{/* コンテンツエリア */}
			<div className="flex-1 min-w-0">
				{isEditing ? (
					// 編集モード
					<div className="flex flex-col gap-0.5">
						<input
							ref={inputRef}
							type="text"
							value={editingTitle}
							aria-label="ページ名の編集"
							onChange={(e) => onTitleChange(e.target.value)}
							onBlur={onFinishEditing}
							onKeyDown={onKeyDown}
							className="w-full bg-transparent border-b border-primary outline-none text-foreground text-sm font-medium px-0 py-0.5 focus-visible:ring-0"
						/>
						<span className="text-[10px] text-muted-foreground truncate">{dateDisplay}</span>
					</div>
				) : (
					// 表示モード
					<button
						type="button"
						className="w-full text-left flex flex-col gap-0.5 bg-transparent border-none outline-none cursor-pointer rounded p-0.5 -m-0.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
						onClick={() => !isTrash && onSelect?.(page.id)}
						onDoubleClick={() => !isTrash && onStartEditing(page)}
					>
						<span className="truncate font-medium text-foreground">{displayTitle}</span>
						<span className="text-[10px] text-muted-foreground truncate">{dateDisplay}</span>
					</button>
				)}
			</div>

			{/* ドロップダウンメニュー */}
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
					{isTrash ? (
						<>
							<DropdownMenuItem onClick={() => onRestore?.(page.id)}>
								<RotateCcw className="mr-2 h-4 w-4" />
								復元
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onPermanentDelete?.(page.id)}
								className="text-red-600 focus:text-red-600"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								完全に削除
							</DropdownMenuItem>
						</>
					) : (
						<>
							<DropdownMenuItem onClick={() => onStartEditing(page)}>
								<Pencil className="mr-2 h-4 w-4" />
								名前を変更
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDelete?.(page.id)}
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
