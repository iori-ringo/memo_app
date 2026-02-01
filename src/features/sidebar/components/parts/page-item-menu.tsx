/**
 * PageItemMenu - ページアイテムのメニュー項目コンポーネント
 *
 * ContextMenu と DropdownMenu で共通のメニュー項目を定義。
 * 重複を排除し、一貫したメニュー表示を提供。
 */
import type { LucideIcon } from 'lucide-react'
import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { ContextMenuItem } from '@/shared/shadcn/context-menu'
import { DropdownMenuItem } from '@/shared/shadcn/dropdown-menu'
import type { NotePage } from '@/types/note'

type PageMenuAction = {
	icon: LucideIcon
	label: string
	onClick: () => void
	variant?: 'default' | 'destructive'
}

type PageMenuHandlers = {
	onStartEditing: (page: NotePage) => void
	onDelete?: (id: string) => void
	onRestore?: (id: string) => void
	onPermanentDelete?: (id: string) => void
}

export const getPageMenuActions = (
	page: NotePage,
	handlers: PageMenuHandlers,
	isTrash: boolean
): PageMenuAction[] => {
	if (isTrash) {
		return [
			{
				icon: RotateCcw,
				label: '復元',
				onClick: () => handlers.onRestore?.(page.id),
			},
			{
				icon: Trash2,
				label: '完全に削除',
				onClick: () => handlers.onPermanentDelete?.(page.id),
				variant: 'destructive',
			},
		]
	}
	return [
		{
			icon: Pencil,
			label: '名前を変更',
			onClick: () => handlers.onStartEditing(page),
		},
		{
			icon: Trash2,
			label: '削除',
			onClick: () => handlers.onDelete?.(page.id),
			variant: 'destructive',
		},
	]
}

type MenuItemsProps = {
	actions: PageMenuAction[]
}

export const PageContextMenuItems = ({ actions }: MenuItemsProps) => (
	<>
		{actions.map((action) => (
			<ContextMenuItem key={action.label} onSelect={action.onClick} variant={action.variant}>
				<action.icon className="mr-2 h-4 w-4" />
				{action.label}
			</ContextMenuItem>
		))}
	</>
)

export const PageDropdownMenuItems = ({ actions }: MenuItemsProps) => (
	<>
		{actions.map((action) => (
			<DropdownMenuItem
				key={action.label}
				onClick={action.onClick}
				className={action.variant === 'destructive' ? 'text-red-600 focus:text-red-600' : ''}
			>
				<action.icon className="mr-2 h-4 w-4" />
				{action.label}
			</DropdownMenuItem>
		))}
	</>
)
