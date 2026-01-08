'use client'

import type { Editor } from '@tiptap/react'
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Eraser,
	Italic,
	Link2,
	List,
	ListOrdered,
	Pen,
	Square,
	Strikethrough,
	Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface RibbonToolbarProps {
	editor: Editor | null
	isConnectMode: boolean
	isPenMode: boolean
	isObjectEraserMode: boolean
	hasSelection: boolean
	onToggleConnectMode: () => void
	onTogglePenMode: () => void
	onToggleObjectEraserMode: () => void
	onDelete: () => void
}

export const RibbonToolbar = ({
	editor,
	isConnectMode,
	isPenMode,
	isObjectEraserMode,
	hasSelection,
	onToggleConnectMode,
	onTogglePenMode,
	onToggleObjectEraserMode,
	onDelete,
}: RibbonToolbarProps) => {
	const colors = [
		{ name: 'Black', value: '#000000' },
		{ name: 'Red', value: '#ef4444' },
		{ name: 'Blue', value: '#3b82f6' },
		{ name: 'Yellow', value: '#eab308' },
	]

	return (
		<div className="w-full bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-2 flex items-center gap-2 shadow-sm">
			{/* Text Formatting */}
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
								// Get current font size from editor
								const { from } = editor.state.selection
								const currentFontSize = editor.getAttributes('textStyle').fontSize
								if (currentFontSize) {
									return currentFontSize
								}
								// Default if no font size is set
								if (from === editor.state.selection.to) {
									// No selection, check at cursor position
									const marks = editor.state.storedMarks || editor.state.selection.$from.marks()
									const fontSizeMark = marks.find(
										(mark) => mark.type.name === 'textStyle' && mark.attrs.fontSize
									)
									return fontSizeMark?.attrs.fontSize || '16px'
								}
								return '16px'
							})()}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
							<DropdownMenuItem
								key={size}
								onClick={() => {
									if (!editor) return
									// Get current selection
									const { from, to } = editor.state.selection

									if (from === to) {
										// No text selected, select all content in the text block
										editor.chain().focus().selectAll().setFontSize(`${size}px`).run()
									} else {
										// Text is selected, apply only to selection
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

			<Separator orientation="vertical" className="h-6" />

			{/* Alignment */}
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor?.chain().focus().setTextAlign('left').run()}
					disabled={!editor}
					className={cn('h-8 w-8 p-0', editor?.isActive({ textAlign: 'left' }) && 'bg-muted')}
					title="左揃え"
				>
					<AlignLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor?.chain().focus().setTextAlign('center').run()}
					disabled={!editor}
					className={cn('h-8 w-8 p-0', editor?.isActive({ textAlign: 'center' }) && 'bg-muted')}
					title="中央揃え"
				>
					<AlignCenter className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor?.chain().focus().setTextAlign('right').run()}
					disabled={!editor}
					className={cn('h-8 w-8 p-0', editor?.isActive({ textAlign: 'right' }) && 'bg-muted')}
					title="右揃え"
				>
					<AlignRight className="h-4 w-4" />
				</Button>
			</div>

			<Separator orientation="vertical" className="h-6" />

			{/* Colors */}
			<div className="flex items-center gap-1">
				{colors.map((color) => (
					<button
						type="button"
						key={color.value}
						onClick={() => editor?.chain().focus().setColor(color.value).run()}
						disabled={!editor}
						className={cn(
							'w-6 h-6 rounded border border-stone-300 dark:border-stone-700 hover:ring-2 hover:ring-primary hover:ring-offset-1',
							editor?.isActive('textStyle', { color: color.value }) &&
								'ring-2 ring-primary ring-offset-1'
						)}
						style={{ backgroundColor: color.value }}
						title={color.name}
					/>
				))}
			</div>

			<Separator orientation="vertical" className="h-6" />

			{/* Lists */}
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

			<Separator orientation="vertical" className="h-6" />

			{/* Modes */}
			<div className="flex items-center gap-1">
				<Button
					variant={isConnectMode ? 'default' : 'ghost'}
					size="sm"
					onClick={onToggleConnectMode}
					className="h-8 px-3"
					title="接続モード (C)"
				>
					<Link2 className="h-4 w-4 mr-1" />
					{isConnectMode && <span className="text-xs">Connect</span>}
				</Button>
				<Button
					variant={isPenMode ? 'default' : 'ghost'}
					size="sm"
					onClick={onTogglePenMode}
					className="h-8 px-3"
					title="ペンモード (P)"
				>
					<Pen className="h-4 w-4 mr-1" />
					{isPenMode && <span className="text-xs">Pen</span>}
				</Button>
				<Button
					variant={isObjectEraserMode ? 'default' : 'ghost'}
					size="sm"
					onClick={onToggleObjectEraserMode}
					className="h-8 px-3"
					title="オブジェクト消しゴム (Shift+E)"
				>
					<Eraser className="h-4 w-4 mr-1" />
					{isObjectEraserMode && <span className="text-xs">Obj</span>}
				</Button>
			</div>

			<Separator orientation="vertical" className="h-6" />

			{/* Delete */}
			<Button
				variant="ghost"
				size="sm"
				onClick={onDelete}
				disabled={!hasSelection}
				className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
				title="削除 (Delete)"
			>
				<Trash2 className="h-4 w-4 mr-1" />
				<span className="text-xs">削除</span>
			</Button>

			{/* Spacer */}
			<div className="flex-1" />

			{/* Mode Indicators */}
			<div className="flex items-center gap-2">
				{isPenMode && (
					<div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-in fade-in zoom-in duration-200">
						<Pen className="w-3 h-3" />
						Pen Mode
					</div>
				)}
				{isConnectMode && (
					<div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-in fade-in zoom-in duration-200">
						<Link2 className="w-3 h-3" />
						Connect Mode
					</div>
				)}
			</div>
		</div>
	)
}
