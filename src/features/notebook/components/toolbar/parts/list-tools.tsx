/**
 * ListTools - リストツール群
 *
 * 箇条書き、番号付きリスト、チェックボックスリストの切り替えを提供。
 */
'use client'

import type { Editor } from '@tiptap/react'
import { List, ListOrdered, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'

type ListToolsProps = {
	editor: Editor | null
}

export const ListTools = ({ editor }: ListToolsProps) => {
	return (
		<div className="flex items-center gap-1">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor?.chain().focus().toggleBulletList().run()}
				disabled={!editor}
				className={cn('h-8 w-8 p-0', editor?.isActive('bulletList') && 'bg-muted')}
				title="箇条書き"
			>
				<List className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor?.chain().focus().toggleOrderedList().run()}
				disabled={!editor}
				className={cn('h-8 w-8 p-0', editor?.isActive('orderedList') && 'bg-muted')}
				title="番号付きリスト"
			>
				<ListOrdered className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor?.chain().focus().toggleTaskList().run()}
				disabled={!editor}
				className={cn('h-8 w-8 p-0', editor?.isActive('taskList') && 'bg-muted')}
				title="チェックボックス"
			>
				<Square className="h-4 w-4" />
			</Button>
		</div>
	)
}
