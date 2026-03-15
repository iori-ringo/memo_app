import { useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_OBJECT_SIZE, SECTION_TYPES } from '@/features/notebook/constants'
import type { CanvasObject, NotePage, SectionType } from '@/types/note'

export const useCanvasOperations = (
	page: NotePage,
	onUpdate: (id: string, updates: Partial<NotePage>) => void,
	containerRef?: React.RefObject<HTMLDivElement>
) => {
	// useLatest パターン: ref 経由で最新値を参照し、コールバックの依存配列を空にして参照を安定化
	// これにより TextBlock (memo) や ConnectionLayer (memo) に渡すコールバックが再作成されない
	const pageRef = useRef(page)
	pageRef.current = page
	const onUpdateRef = useRef(onUpdate)
	onUpdateRef.current = onUpdate

	const handleAddBlock = useCallback(
		(eOrX: React.MouseEvent | number, valY?: number) => {
			const currentPage = pageRef.current
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
			const titleH = (totalHeight * (currentPage.layout?.titleHeight ?? 10)) / 100
			const centerH = (totalHeight * (currentPage.layout?.centerPosition ?? 50)) / 100
			const diversionH = (totalHeight * (currentPage.layout?.diversionPosition ?? 75)) / 100

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

			onUpdateRef.current(currentPage.id, {
				objects: [...currentPage.objects, newObject],
			})
		},
		[containerRef]
	)

	const handleUpdateObject = useCallback(
		(objectId: string, updates: Partial<CanvasObject>) => {
			const currentPage = pageRef.current
			const newObjects = currentPage.objects.map((obj) =>
				obj.id === objectId ? { ...obj, ...updates } : obj
			)
			onUpdateRef.current(currentPage.id, { objects: newObjects })
		},
		[]
	)

	const handleDeleteObject = useCallback(
		(objectId: string) => {
			const currentPage = pageRef.current
			const newObjects = currentPage.objects.filter((obj) => obj.id !== objectId)
			// Also remove connections related to this object
			const newConnections = currentPage.connections.filter(
				(conn) => conn.fromObjectId !== objectId && conn.toObjectId !== objectId
			)
			onUpdateRef.current(currentPage.id, { objects: newObjects, connections: newConnections })
		},
		[]
	)

	const handleDeleteConnection = useCallback(
		(connectionId: string) => {
			const currentPage = pageRef.current
			const newConnections = currentPage.connections.filter((conn) => conn.id !== connectionId)
			onUpdateRef.current(currentPage.id, { connections: newConnections })
		},
		[]
	)

	const toggleFavorite = useCallback(() => {
		const currentPage = pageRef.current
		onUpdateRef.current(currentPage.id, { isFavorite: !currentPage.isFavorite })
	}, [])

	return {
		handleAddBlock,
		handleUpdateObject,
		handleDeleteObject,
		handleDeleteConnection,
		toggleFavorite,
	}
}
