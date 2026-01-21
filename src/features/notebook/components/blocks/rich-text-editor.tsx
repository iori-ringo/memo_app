'use client'

/**
 * RichTextEditor - リッチテキストエディタコンポーネント
 *
 * TipTap を使用した WYSIWYG エディタ。
 * notebook/blocks/text-block.tsx から使用される。
 * キャンバス専用（ツールバーは RibbonToolbar が提供）。
 *
 * @features
 * - 太字・斜体・リスト等の基本フォーマット
 * - タスクリスト対応
 * - テキスト配置（左寄せ・中央・右寄せ）
 * - フォントサイズ・カラー変更
 *
 * @dependencies
 * - TipTap v3
 * - ./extensions/font-size.ts（カスタム拡張）
 */

import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { type Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FontSize } from '@/features/notebook/extensions/font-size'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
	content: string
	onChange: (content: string) => void
	placeholder?: string
	className?: string
	editable?: boolean
	onEditorReady?: (editor: Editor) => void
}

export const RichTextEditor = ({
	content,
	onChange,
	placeholder = '',
	className,
	editable = true,
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
			<EditorContent editor={editor} className="flex-1" />
		</div>
	)
}
