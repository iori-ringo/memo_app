/**
 * ColorTools - テキストカラーツール群
 *
 * テキストの色変更機能を提供。
 */
'use client'

import type { Editor } from '@tiptap/react'
import { cn } from '@/lib/utils'

interface ColorToolsProps {
	editor: Editor | null
}

const COLORS = [
	{ name: 'Black', value: '#000000' },
	{ name: 'Red', value: '#ef4444' },
	{ name: 'Blue', value: '#3b82f6' },
	{ name: 'Yellow', value: '#eab308' },
]

export const ColorTools = ({ editor }: ColorToolsProps) => {
	return (
		<div className="flex items-center gap-1">
			{COLORS.map((color) => (
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
	)
}
