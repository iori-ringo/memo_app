/**
 * TextAlignTools - テキスト配置ツール群
 *
 * 左揃え、中央揃え、右揃えの切り替えを提供。
 */
'use client'

import type { Editor } from '@tiptap/react'
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/shadcn/button'

interface TextAlignToolsProps {
	editor: Editor | null
}

export const TextAlignTools = ({ editor }: TextAlignToolsProps) => {
	return (
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
	)
}
