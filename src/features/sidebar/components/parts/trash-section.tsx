/**
 * TrashSection - ゴミ箱セクションコンポーネント
 *
 * 削除されたページの一覧と復元・完全削除機能。
 */
'use client'

import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { PageListItem } from '@/features/sidebar/components/parts/page-list-item'
import type { NotePage } from '@/types/note'

type TrashSectionProps = {
	deletedPages: NotePage[]
	activePageId: string | null
	editingPageId: string | null
	editingTitle: string
	onStartEditing: (page: NotePage) => void
	onTitleChange: (value: string) => void
	onFinishEditing: () => void
	onKeyDown: (e: React.KeyboardEvent) => void
	onRestore?: (id: string) => void
	onPermanentDelete?: (id: string) => void
}

export const TrashSection = ({
	deletedPages,
	activePageId,
	editingPageId,
	editingTitle,
	onStartEditing,
	onTitleChange,
	onFinishEditing,
	onKeyDown,
	onRestore,
	onPermanentDelete,
}: TrashSectionProps) => {
	const [isOpen, setIsOpen] = useState(false)

	if (deletedPages.length === 0) return null

	return (
		<div className="mt-8 pt-4 border-t">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2 hover:text-foreground transition-colors"
			>
				{isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
				<Trash2 className="h-3 w-3" />
				ゴミ箱 ({deletedPages.length})
			</button>

			{isOpen && (
				<div className="space-y-1">
					{deletedPages.map((page) => (
						<PageListItem
							key={page.id}
							page={page}
							activePageId={activePageId}
							isTrash
							editingPageId={editingPageId}
							editingTitle={editingTitle}
							onStartEditing={onStartEditing}
							onTitleChange={onTitleChange}
							onFinishEditing={onFinishEditing}
							onKeyDown={onKeyDown}
							onRestore={onRestore}
							onPermanentDelete={onPermanentDelete}
						/>
					))}
				</div>
			)}
		</div>
	)
}
