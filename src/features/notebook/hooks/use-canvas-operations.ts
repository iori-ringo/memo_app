import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_OBJECT_SIZE, SECTION_TYPES } from '@/lib/constants'
import type { CanvasObject, NotePage, SectionType, Stroke } from '@/types/note'

export const useCanvasOperations = (
	page: NotePage,
	onUpdate: (id: string, updates: Partial<NotePage>) => void,
	containerRef?: React.RefObject<HTMLDivElement>
) => {
	const handleAddBlock = useCallback(
		(eOrX: React.MouseEvent | number, valY?: number) => {
			let x: number
			let y: number
			let totalHeight: number

			if (typeof eOrX === 'number') {
				x = eOrX
				y = valY || 100
				if (containerRef?.current) {
					totalHeight = containerRef.current.getBoundingClientRect().height
				} else {
					totalHeight = 800 // Fallback
				}
			} else {
				const e = eOrX
				// Only add if double click on background
				if (e.target !== e.currentTarget) return

				const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
				x = e.clientX - rect.left
				y = e.clientY - rect.top
				totalHeight = rect.height
			}

			// Determine section based on Y position
			const titleH = (totalHeight * (page.layout?.titleHeight ?? 10)) / 100
			const centerH = (totalHeight * (page.layout?.centerPosition ?? 50)) / 100
			const diversionH = (totalHeight * (page.layout?.diversionPosition ?? 75)) / 100

			let section: SectionType = SECTION_TYPES.FACT
			if (y < titleH) section = SECTION_TYPES.TITLE
			else if (y < centerH) section = SECTION_TYPES.FACT
			else if (y < diversionH) section = SECTION_TYPES.ABSTRACTION
			else section = SECTION_TYPES.DIVERSION

			const newObject: CanvasObject = {
				id: uuidv4(),
				type: 'text',
				section,
				content: '',
				x: x - DEFAULT_OBJECT_SIZE.WIDTH / 2,
				y: y - DEFAULT_OBJECT_SIZE.HEIGHT / 2,
				width: DEFAULT_OBJECT_SIZE.WIDTH,
				height: DEFAULT_OBJECT_SIZE.HEIGHT,
			}

			onUpdate(page.id, {
				objects: [...page.objects, newObject],
			})
		},
		[page, onUpdate, containerRef]
	)

	const handleUpdateObject = useCallback(
		(objectId: string, updates: Partial<CanvasObject>) => {
			const newObjects = page.objects.map((obj) =>
				obj.id === objectId ? { ...obj, ...updates } : obj
			)
			onUpdate(page.id, { objects: newObjects })
		},
		[page.objects, page.id, onUpdate]
	)

	const handleDeleteObject = useCallback(
		(objectId: string) => {
			const newObjects = page.objects.filter((obj) => obj.id !== objectId)
			// Also remove connections related to this object
			const newConnections = page.connections.filter(
				(conn) => conn.fromObjectId !== objectId && conn.toObjectId !== objectId
			)
			onUpdate(page.id, { objects: newObjects, connections: newConnections })
		},
		[page.objects, page.connections, page.id, onUpdate]
	)

	const handleDeleteConnection = useCallback(
		(connectionId: string) => {
			const newConnections = page.connections.filter((conn) => conn.id !== connectionId)
			onUpdate(page.id, { connections: newConnections })
		},
		[page.connections, page.id, onUpdate]
	)

	const handleUpdateStrokes = useCallback(
		(newStrokes: Stroke[]) => {
			onUpdate(page.id, { strokes: newStrokes })
		},
		[page.id, onUpdate]
	)

	const toggleFavorite = useCallback(() => {
		onUpdate(page.id, { isFavorite: !page.isFavorite })
	}, [page.id, page.isFavorite, onUpdate])

	return {
		handleAddBlock,
		handleUpdateObject,
		handleDeleteObject,
		handleDeleteConnection,
		handleUpdateStrokes,
		toggleFavorite,
	}
}
