'use client'

import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { type Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'
import { FontSize } from '../extensions/font-size'

interface RichTextEditorProps {
	content: string
	onChange: (content: string) => void
	placeholder?: string
	className?: string
	editable?: boolean
	variant?: 'default' | 'canvas'
	onEditorReady?: (editor: Editor) => void
}

export const RichTextEditor = ({
	content,
	onChange,
	placeholder = '',
	className,
	editable = true,
	variant = 'default',
	onEditorReady,
}: RichTextEditorProps) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder,
			}),
			TextStyle,
			Color,
			FontSize,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
		],
		content,
		editable,
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML())
		},
		editorProps: {
			attributes: {
				class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px]',
			},
		},
		onCreate: ({ editor }) => {
			onEditorReady?.(editor)
		},
	})

	if (!editor) {
		return null
	}

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{editable && variant === 'default' && (
				<div className="flex items-center gap-1 border-b pb-2 mb-2 sticky top-0 bg-background/95 backdrop-blur z-10">
					<ToolbarButtons editor={editor} />
				</div>
			)}

			{/* BubbleMenu temporarily disabled - Tiptap v3 compatibility issue */}
			{/* {editable && variant === "default" && (
                <BubbleMenu editor={editor} className="flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1">
                    <ToolbarButtons editor={editor} />
                    <div className="w-px h-4 bg-border mx-1" />
                    <ColorPicker editor={editor} />
                </BubbleMenu>
            )} */}

			<EditorContent editor={editor} className="flex-1" />
		</div>
	)
}

const ToolbarButtons = ({ editor }: { editor: Editor }) => {
	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
			>
				<Bold className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
			>
				<Italic className="h-4 w-4" />
			</Button>
			<div className="w-px h-4 bg-border mx-1" />
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-muted')}
			>
				<List className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-muted')}
			>
				<ListOrdered className="h-4 w-4" />
			</Button>
		</>
	)
}
