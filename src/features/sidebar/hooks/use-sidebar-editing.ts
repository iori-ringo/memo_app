import { useCallback, useRef, useState } from 'react'
import type { NotePage } from '@/types/note'

type UseSidebarEditingProps = {
	pages: NotePage[]
	onUpdatePage?: (id: string, updates: Partial<NotePage>) => void
}

export const useSidebarEditing = ({ pages, onUpdatePage }: UseSidebarEditingProps) => {
	const [editingPageId, setEditingPageId] = useState<string | null>(null)
	const [editingTitle, setEditingTitle] = useState('')

	// useRef Latest Value Pattern: コールバック内で最新値を参照
	const pagesRef = useRef(pages)
	pagesRef.current = pages
	const onUpdatePageRef = useRef(onUpdatePage)
	onUpdatePageRef.current = onUpdatePage

	const handleStartEditing = useCallback((page: NotePage) => {
		setEditingPageId(page.id)
		setEditingTitle(page.title)
	}, [])

	const handleFinishEditing = useCallback(() => {
		setEditingPageId((currentEditingPageId) => {
			if (currentEditingPageId && onUpdatePageRef.current) {
				const page = pagesRef.current.find((p) => p.id === currentEditingPageId)
				// editingTitle は closure で参照（setEditingTitle と同期的に呼ばれるため安全）
				setEditingTitle((currentTitle) => {
					if (page && page.title !== currentTitle) {
						onUpdatePageRef.current?.(currentEditingPageId, { title: currentTitle })
					}
					return ''
				})
			} else {
				setEditingTitle('')
			}
			return null
		})
	}, [])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleFinishEditing()
			} else if (e.key === 'Escape') {
				setEditingPageId(null)
				setEditingTitle('')
			}
		},
		[handleFinishEditing]
	)

	return {
		editingPageId,
		editingTitle,
		setEditingTitle,
		handleStartEditing,
		handleFinishEditing,
		handleKeyDown,
	}
}
