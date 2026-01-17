/**
 * TextFormattingTools - テキストフォーマットツール群
 *
 * 太字、斜体、取り消し線、フォントサイズ変更を提供。
 */
'use client'

import type { Editor } from '@tiptap/react'
import { Bold, Italic, Strikethrough } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/shadcn/dropdown-menu'

interface TextFormattingToolsProps {
	editor: Editor | null
}

export const TextFormattingTools = ({ editor }: TextFormattingToolsProps) => {
	return (
		<div className="flex items-center gap-1">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor?.chain().focus().toggleBold().run()}
				disabled={!editor}
				className={cn('h-8 w-8 p-0', editor?.isActive('bold') && 'bg-muted')}
				title="太字 (Ctrl+B)"
			>
				<Bold className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor?.chain().focus().toggleItalic().run()}
				disabled={!editor}
				className={cn('h-8 w-8 p-0', editor?.isActive('italic') && 'bg-muted')}
				title="斜体 (Ctrl+I)"
			>
				<Italic className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor?.chain().focus().toggleStrike().run()}
				disabled={!editor}
				className={cn('h-8 w-8 p-0', editor?.isActive('strike') && 'bg-muted')}
				title="取消線"
			>
				<Strikethrough className="h-4 w-4" />
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						disabled={!editor}
						className="h-8 px-2 text-xs min-w-[60px]"
						title="フォントサイズ"
					>
						{(() => {
							if (!editor) return 'Size'
							const currentFontSize = editor.getAttributes('textStyle').fontSize
							if (currentFontSize) return currentFontSize
							const marks = editor.state.storedMarks || editor.state.selection.$from.marks()
							const fontSizeMark = marks.find(
								(mark) => mark.type.name === 'textStyle' && mark.attrs.fontSize
							)
							return fontSizeMark?.attrs.fontSize || '16px'
						})()}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
						<DropdownMenuItem
							key={size}
							onClick={() => {
								if (!editor) return
								const { from, to } = editor.state.selection
								if (from === to) {
									editor.chain().focus().selectAll().setFontSize(`${size}px`).run()
								} else {
									editor.chain().focus().setFontSize(`${size}px`).run()
								}
							}}
						>
							{size}px
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
