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
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/shadcn/dropdown-menu'
import type { NotePage } from '@/types/note'

interface PageListItemProps {
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
	const lastEdited = new Date(page.updatedAt)
	const dateDisplay = isToday(lastEdited)
		? format(lastEdited, 'HH:mm', { locale: ja })
		: format(lastEdited, 'yyyy/MM/dd', { locale: ja })

	return (
		<button
			type="button"
			className={cn(
				'group w-full flex items-center gap-2 p-2 rounded-md text-sm transition-colors hover:bg-accent/50 relative cursor-pointer text-left border-0 bg-transparent',
				activePageId === page.id && !isTrash
					? 'bg-accent text-accent-foreground'
					: 'text-muted-foreground'
			)}
			onClick={() => !isTrash && onSelect?.(page.id)}
			onDoubleClick={() => !isTrash && onStartEditing(page)}
		>
			<div className="flex-1 min-w-0 flex flex-col gap-0.5">
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
							// biome-ignore lint/a11y/noAutofocus: インライン編集UXのために意図的
							autoFocus
							onChange={(e) => onTitleChange(e.target.value)}
							onBlur={onFinishEditing}
							onKeyDown={onKeyDown}
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
			</div>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: ドロップダウン用のstopPropagationラッパー */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: ドロップダウン用のstopPropagationラッパー */}
			<div onClick={(e) => e.stopPropagation()}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-6 w-6 opacity-100 transition-opacity">
							<MoreHorizontal className="h-3 w-3" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{isTrash ? (
							<>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										onRestore?.(page.id)
									}}
								>
									<RotateCcw className="mr-2 h-4 w-4" />
									復元
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										onPermanentDelete?.(page.id)
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
										onStartEditing(page)
									}}
								>
									<Pencil className="mr-2 h-4 w-4" />
									名前を変更
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation()
										onDelete?.(page.id)
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
		</button>
	)
}
